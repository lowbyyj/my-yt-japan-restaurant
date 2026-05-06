import { readJsonFile, writeJsonFile } from "./utils/files.js";
import { geocodePlace } from "./utils/geocode.js";
import {
  geocodedCandidatesSchema,
  placeCandidatesSchema,
  type GeocodedCandidate,
} from "./utils/schema.js";

const INPUT_PATH = "data/generated/place_candidates.json";
const OUTPUT_PATH = "data/generated/geocoded_candidates.json";
const CACHE_PATH = "data/cache/geocode_cache.json";

type CacheEntry = {
  lat?: number;
  lng?: number;
  country?: string;
  provider?: string;
  confidence?: number;
  query: string;
};

async function main() {
  const candidates = placeCandidatesSchema.parse(await readJsonFile(INPUT_PATH, []));
  const cache = await readJsonFile<Record<string, CacheEntry>>(CACHE_PATH, {});
  const provider = process.env.GEOCODE_PROVIDER || "nominatim";
  const output: GeocodedCandidate[] = [];

  for (const candidate of candidates) {
    if (candidate.verdict === "excluded_negative_signal") {
      output.push(candidate);
      continue;
    }

    const geocode = await geocodePlace(
      {
        name: candidate.nameLocal ?? candidate.nameKoOrOriginal,
        address: candidate.addressCandidate,
        city: candidate.city,
        googleMapsUrl: candidate.googleMapsUrl,
      },
      cache,
      { provider, minDelayMs: 1100 },
    );

    const hasJapanCoords =
      typeof geocode.lat === "number" &&
      typeof geocode.lng === "number" &&
      (geocode.country === "JP" || candidate.country === "JP");

    output.push({
      ...candidate,
      country: hasJapanCoords ? "JP" : candidate.country,
      lat: hasJapanCoords ? geocode.lat : undefined,
      lng: hasJapanCoords ? geocode.lng : undefined,
      googleMapsUrl: geocode.resolvedGoogleMapsUrl ?? candidate.googleMapsUrl,
      googleMapsQuery: geocode.googleMapsQuery ?? candidate.googleMapsQuery,
      geocodeProvider: geocode.provider,
      geocodeQuery: geocode.query,
      geocodeConfidence: geocode.confidence,
      verdict:
        candidate.verdict === "auto_recommended" && hasJapanCoords
          ? "auto_recommended"
          : "needs_geocode",
    });
  }

  const validated = geocodedCandidatesSchema.parse(output);
  await writeJsonFile(OUTPUT_PATH, validated);
  await writeJsonFile(CACHE_PATH, cache);

  console.log(
    JSON.stringify(
      {
        totalCandidates: validated.length,
        geocoded: validated.filter(
          (candidate) => typeof candidate.lat === "number" && candidate.country === "JP",
        ).length,
        needsGeocode: validated.filter((candidate) => candidate.verdict === "needs_geocode")
          .length,
      },
      null,
      2,
    ),
  );
}

await main();
