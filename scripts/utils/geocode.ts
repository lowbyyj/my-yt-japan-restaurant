import {
  extractGoogleMapsQuery,
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

async function resolveGoogleMapsUrl(url: string) {
  if (!/maps\.app\.goo\.gl|goo\.gl\/maps/u.test(url)) return url;
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent": "my-yt-japan-restaurant/0.1 (Google Maps link resolver)",
      },
    });
    return response.url || url;
  } catch {
    return url;
  }
}

function buildNominatimQuery(input: GeocodeInput, mapsQuery?: string) {
  return [input.address, mapsQuery, input.name, input.city, "Japan"]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");
}

export async function geocodePlace(
  input: GeocodeInput,
  cache: Record<string, CacheEntry>,
  options: { provider: string; minDelayMs?: number },
): Promise<GeocodeResult> {
  const result: GeocodeResult = {};
  let googleMapsUrl = input.googleMapsUrl;

  if (googleMapsUrl) {
    googleMapsUrl = await resolveGoogleMapsUrl(googleMapsUrl);
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

  const query = buildNominatimQuery(input, result.googleMapsQuery);
  if (!query.trim()) return result;

  if (cache[query]) return { ...cache[query], provider: cache[query].provider ?? "nominatim" };

  await sleep(options.minDelayMs ?? 1100);
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
