import {
  extractGoogleMapsQuery,
  isGoogleMapsRedirectCandidate,
  parseCoordinatesFromGoogleMapsUrl,
} from "./googleMapsUrl.js";

export type GeocodeResult = {
  lat?: number;
  lng?: number;
  country?: string;
  provider?: string;
  query?: string;
  confidence?: number;
  resolvedGoogleMapsUrl?: string;
  googleMapsQuery?: string;
};

export type GeocodeInput = {
  name?: string;
  address?: string;
  city?: string;
  googleMapsUrl?: string;
};

type CacheEntry = {
  lat?: number;
  lng?: number;
  country?: string;
  provider?: string;
  confidence?: number;
  query: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function resolveGoogleMapsUrl(url: string, cache: Record<string, CacheEntry>) {
  if (!isGoogleMapsRedirectCandidate(url)) return url;

  const cacheKey = `google_maps_redirect:${url}`;
  const cached = cache[cacheKey];
  if (cached?.query) return cached.query;

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "my-yt-japan-restaurant/0.1 (Google Maps link resolver)",
      },
    });
    const resolvedUrl = response.url || url;
    cache[cacheKey] = { query: resolvedUrl, provider: "google_maps_redirect" };
    return resolvedUrl;
  } catch {
    cache[cacheKey] = { query: url, provider: "google_maps_redirect" };
    return url;
  }
}

function normalizeQuery(query: string) {
  return query.replace(/\s+/g, " ").trim();
}

function pushQuery(queries: string[], parts: Array<string | undefined>) {
  const normalizedParts = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  if (!normalizedParts.some((part) => part.toLowerCase() !== "japan")) return;

  const query = normalizeQuery(normalizedParts.join(" "));
  if (query && !queries.includes(query)) queries.push(query);
}

export function buildNominatimQueries(input: GeocodeInput, mapsQuery?: string) {
  const queries: string[] = [];
  const name = mapsQuery || input.name;

  pushQuery(queries, [input.address, mapsQuery, input.city, "Japan"]);
  pushQuery(queries, [input.address, "Japan"]);
  pushQuery(queries, [name, input.city, "Japan"]);
  pushQuery(queries, [name, "Japan"]);

  return queries;
}

async function queryNominatim(
  query: string,
  cache: Record<string, CacheEntry>,
  minDelayMs: number,
) {
  if (cache[query]) return { ...cache[query], provider: cache[query].provider ?? "nominatim" };

  await sleep(minDelayMs);
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "jp");
  url.searchParams.set("q", query);

  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "my-yt-japan-restaurant/0.1 (https://github.com/lowbyyj/my-yt-japan-restaurant)",
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Nominatim failed ${response.status}: ${response.statusText}`);
  }

  const body = (await response.json()) as Array<{
    lat?: string;
    lon?: string;
    importance?: number;
    address?: { country_code?: string };
  }>;
  const first = body[0];
  if (!first?.lat || !first.lon) {
    cache[query] = { query, provider: "nominatim" };
    return { query, provider: "nominatim" };
  }

  const country = first.address?.country_code?.toUpperCase();
  const entry: CacheEntry = {
    lat: Number(first.lat),
    lng: Number(first.lon),
    country: country === "JP" ? "JP" : country,
    provider: "nominatim",
    confidence: Math.min(0.9, Math.max(0.45, first.importance ?? 0.55)),
    query,
  };
  cache[query] = entry;
  return entry;
}

export async function geocodePlace(
  input: GeocodeInput,
  cache: Record<string, CacheEntry>,
  options: { provider: string; minDelayMs?: number },
): Promise<GeocodeResult> {
  const result: GeocodeResult = {};
  let googleMapsUrl = input.googleMapsUrl;

  if (googleMapsUrl) {
    googleMapsUrl = await resolveGoogleMapsUrl(googleMapsUrl, cache);
    result.resolvedGoogleMapsUrl = googleMapsUrl;
    result.googleMapsQuery = extractGoogleMapsQuery(googleMapsUrl);

    const coordinates = parseCoordinatesFromGoogleMapsUrl(googleMapsUrl);
    if (coordinates) {
      return {
        ...result,
        lat: coordinates.lat,
        lng: coordinates.lng,
        country: "JP",
        provider: `google_maps_url:${coordinates.source}`,
        confidence: 0.95,
      };
    }
  }

  if (options.provider !== "nominatim") return result;

  const queries = buildNominatimQueries(input, result.googleMapsQuery);
  if (queries.length === 0) return result;

  let lastResult: GeocodeResult = {};
  for (const query of queries) {
    const geocode = await queryNominatim(query, cache, options.minDelayMs ?? 1100);
    lastResult = geocode;
    if (typeof geocode.lat === "number" && typeof geocode.lng === "number") return geocode;
  }

  return lastResult;
}
