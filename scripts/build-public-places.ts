import { readJsonFile, writeJsonFile } from "./utils/files.js";
import {
  dataStatusSchema,
  geocodedCandidatesSchema,
  publicPlacesSchema,
  type DataStatus,
  type PublicPlace,
} from "./utils/schema.js";

const INPUT_PATH = "data/generated/geocoded_candidates.json";
const INGEST_PATH = "data/generated/youtube_owner_comment_candidates.json";
const PUBLIC_PLACES_PATH = "public/data/places.json";
const PUBLIC_STATUS_PATH = "public/data/data_status.json";
const CONFIDENCE_THRESHOLD = Number(process.env.CONFIDENCE_THRESHOLD || 0.55);

type IngestSummary = {
  dataGenerated: boolean;
  reason?: string;
  generatedAt: string | null;
  channelHandle: string;
  videosScanned: number;
  likelyShorts: number;
  ownerCommentCandidates: number;
};

function toPublicPlace(candidate: (typeof geocodedCandidatesSchema._output)[number]) {
  if (
    candidate.country !== "JP" ||
    typeof candidate.lat !== "number" ||
    typeof candidate.lng !== "number" ||
    candidate.verdict !== "auto_recommended" ||
    candidate.negativeSignalHits.length > 0 ||
    candidate.confidence < CONFIDENCE_THRESHOLD ||
    !candidate.sourceCommentId ||
    !candidate.videoId ||
    !candidate.videoUrl ||
    !candidate.thumbnailUrl
  ) {
    return undefined;
  }

  const place: PublicPlace = {
    id: candidate.id,
    status: "published",
    country: "JP",
    nameKoOrOriginal: candidate.nameKoOrOriginal,
    nameLocal: candidate.nameLocal,
    city: candidate.city ?? "Japan",
    area: candidate.area,
    lat: candidate.lat,
    lng: candidate.lng,
    categoryTags: candidate.categoryTags,
    commentKoAuto: candidate.commentKoAuto,
    verdict: "auto_recommended",
    confidence: candidate.confidence,
    negativeSignalHits: [],
    sourceVideoId: candidate.videoId,
    sourceVideoTitle: candidate.videoTitle,
    sourceVideoUrl: candidate.videoUrl,
    thumbnailUrl: candidate.thumbnailUrl,
    sourceCommentId: candidate.sourceCommentId,
    sourceKind: "owner_location_comment_candidate",
    googleMapsUrl: candidate.googleMapsUrl,
    generatedAt: new Date().toISOString(),
  };
  return place;
}

function classifyMissingGeocode(candidate: (typeof geocodedCandidatesSchema._output)[number]) {
  const url = candidate.googleMapsUrl ?? "";
  if (/maps\.app\.goo\.gl|goo\.gl\/maps/iu.test(url)) return "maps_short_url_unresolved";
  if (/google\.[^/]+\/maps\/place/iu.test(url)) return "google_maps_place_without_coordinates";
  if (/google\.[^/]+\/maps\/search/iu.test(url)) return "google_maps_search_query_only";
  if (candidate.addressCandidate) return "address_candidate_geocoder_failed";
  if (candidate.googleMapsQuery) return "map_query_geocoder_failed";
  if (candidate.nameKoOrOriginal && candidate.city) return "name_city_query_geocoder_failed";
  if (candidate.nameKoOrOriginal) return "name_only_query_geocoder_failed";
  return "no_usable_location_candidate";
}

function buildHoldbackBreakdown(candidates: Array<(typeof geocodedCandidatesSchema._output)[number]>) {
  const breakdown: Record<string, number> = {};
  for (const candidate of candidates) {
    if (
      candidate.verdict === "excluded_negative_signal" ||
      candidate.country !== "JP" ||
      (typeof candidate.lat === "number" && typeof candidate.lng === "number")
    ) {
      continue;
    }
    const reason = classifyMissingGeocode(candidate);
    breakdown[reason] = (breakdown[reason] ?? 0) + 1;
  }
  return breakdown;
}

async function main() {
  const ingest = await readJsonFile<IngestSummary>(INGEST_PATH, {
    dataGenerated: false,
    reason: "YOUTUBE_API_KEY not provided",
    generatedAt: null,
    channelHandle: process.env.YOUTUBE_CHANNEL_HANDLE || "@space_tamnik",
    videosScanned: 0,
    likelyShorts: 0,
    ownerCommentCandidates: 0,
  });
  const candidates = geocodedCandidatesSchema.parse(await readJsonFile(INPUT_PATH, []));
  const places = publicPlacesSchema.parse(
    candidates.map(toPublicPlace).filter((place): place is PublicPlace => Boolean(place)),
  );

  const excludedNegativeSignal = candidates.filter(
    (candidate) => candidate.verdict === "excluded_negative_signal",
  ).length;
  const needsGeocode = candidates.filter(
    (candidate) => candidate.verdict === "needs_geocode",
  ).length;
  const geocoded = candidates.filter(
    (candidate) => candidate.country === "JP" && typeof candidate.lat === "number",
  ).length;
  const heldBackNonJapan = candidates.filter(
    (candidate) =>
      candidate.verdict !== "excluded_negative_signal" && candidate.country !== "JP",
  ).length;
  const heldBackMissingGeocode = candidates.filter(
    (candidate) =>
      candidate.verdict !== "excluded_negative_signal" &&
      candidate.country === "JP" &&
      (typeof candidate.lat !== "number" || typeof candidate.lng !== "number"),
  ).length;
  const heldBackLowConfidence = candidates.filter(
    (candidate) =>
      candidate.verdict !== "excluded_negative_signal" &&
      candidate.country === "JP" &&
      typeof candidate.lat === "number" &&
      typeof candidate.lng === "number" &&
      candidate.confidence < CONFIDENCE_THRESHOLD,
  ).length;
  const heldBack = Math.max(
    0,
    candidates.length - places.length - excludedNegativeSignal,
  );

  const apiKeyPresent = Boolean(process.env.YOUTUBE_API_KEY?.trim());
  const dataGenerated = Boolean(ingest.dataGenerated && apiKeyPresent);
  const status: DataStatus = dataStatusSchema.parse({
    dataGenerated,
    reason: dataGenerated
      ? places.length > 0
        ? undefined
        : "No publishable places after automated filters"
      : ingest.reason ?? "YOUTUBE_API_KEY not provided",
    generatedAt: dataGenerated ? new Date().toISOString() : null,
    channelHandle: ingest.channelHandle,
    videosScanned: ingest.videosScanned,
    likelyShorts: ingest.likelyShorts,
    ownerCommentCandidates: ingest.ownerCommentCandidates,
    japanCandidates: candidates.filter((candidate) => candidate.country === "JP").length,
    geocoded,
    published: places.length,
    excludedNegativeSignal,
    needsGeocode,
    heldBack,
    heldBackLowConfidence,
    heldBackMissingGeocode,
    heldBackNonJapan,
    geocodeHoldbackBreakdown: buildHoldbackBreakdown(candidates),
  });

  await writeJsonFile(PUBLIC_PLACES_PATH, places);
  await writeJsonFile(PUBLIC_STATUS_PATH, status);
  console.log(JSON.stringify(status, null, 2));
}

await main();
