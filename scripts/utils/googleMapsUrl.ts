export type ParsedCoordinates = {
  lat: number;
  lng: number;
  source: string;
};

const LAT = "(-?\\d+(?:\\.\\d+)?)";
const LNG = "(-?\\d+(?:\\.\\d+)?)";

function toCoordinate(latText: string, lngText: string, source: string) {
  const lat = Number(latText);
  const lng = Number(lngText);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
  return { lat, lng, source };
}

export function extractGoogleMapsUrls(text: string): string[] {
  const matches = text.match(
    /https?:\/\/(?:www\.)?(?:google\.[^\s)]+\/maps|maps\.app\.goo\.gl|goo\.gl\/maps)[^\s)\]]*/gi,
  );
  return Array.from(new Set(matches ?? [])).map((url) =>
    url.replace(/[.,;!?]+$/u, ""),
  );
}

export function parseCoordinatesFromGoogleMapsUrl(
  urlText: string,
): ParsedCoordinates | undefined {
  const decoded = decodeURIComponent(urlText);
  const atMatch = decoded.match(new RegExp(`/@${LAT},${LNG}`));
  if (atMatch) return toCoordinate(atMatch[1], atMatch[2], "/@lat,lng");

  const bangMatch = decoded.match(new RegExp(`!3d${LAT}!4d${LNG}`, "i"));
  if (bangMatch) return toCoordinate(bangMatch[1], bangMatch[2], "!3d!4d");

  const lngLatBangMatch = decoded.match(new RegExp(`!2d${LNG}!3d${LAT}`, "i"));
  if (lngLatBangMatch) {
    return toCoordinate(lngLatBangMatch[2], lngLatBangMatch[1], "!2d!3d");
  }

  const pairMatch = decoded.match(
    new RegExp(`(?:query|q|ll|center|destination)=${LAT},\\s*${LNG}`, "i"),
  );
  if (pairMatch) return toCoordinate(pairMatch[1], pairMatch[2], "query");

  try {
    const parsed = new URL(urlText);
    for (const key of ["query", "q", "ll", "center", "destination"]) {
      const value = parsed.searchParams.get(key);
      if (!value) continue;
      const coords = value.match(new RegExp(`^\\s*${LAT},\\s*${LNG}\\s*$`));
      if (coords) return toCoordinate(coords[1], coords[2], key);
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function isGoogleMapsRedirectCandidate(urlText: string) {
  if (parseCoordinatesFromGoogleMapsUrl(urlText)) return false;
  try {
    const parsed = new URL(urlText);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.toLowerCase();
    if (host === "maps.app.goo.gl" || (host === "goo.gl" && path.startsWith("/maps"))) {
      return true;
    }
    if (!host.includes("google.") || !path.includes("/maps")) return false;
    return path.includes("/maps/search") || path.includes("/maps/place");
  } catch {
    return false;
  }
}

export function extractGoogleMapsQuery(urlText: string): string | undefined {
  try {
    const parsed = new URL(urlText);
    for (const key of ["query", "q", "destination"]) {
      const value = parsed.searchParams.get(key);
      if (value && !parseCoordinatesFromGoogleMapsUrl(value)) return value.trim();
    }

    const placePrefix = "/maps/place/";
    const decodedPath = decodeURIComponent(parsed.pathname);
    const placeIndex = decodedPath.indexOf(placePrefix);
    if (placeIndex >= 0) {
      const afterPrefix = decodedPath.slice(placeIndex + placePrefix.length);
      const name = afterPrefix.split("/")[0]?.replace(/\+/g, " ").trim();
      if (name) return name;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export function createGoogleMapsSearchUrl(parts: Array<string | undefined>) {
  const query = parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query,
  )}`;
}
