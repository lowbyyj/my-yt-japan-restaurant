import {
  publicPlacesSchema,
  type GeocodedCandidate,
  type LocationResolution,
  type PublicPlace,
} from "./schema.js";

export type ResolutionBuildOptions = {
  generatedAt: string;
  confidenceThreshold: number;
};

function resolutionKey(resolution: LocationResolution) {
  return `${resolution.sourceVideoId}:${resolution.sourceCommentId ?? ""}`;
}

function candidateKey(candidate: GeocodedCandidate) {
  return `${candidate.videoId}:${candidate.sourceCommentId}`;
}

function isPublishableResolution(
  candidate: GeocodedCandidate,
  resolution: LocationResolution | undefined,
  confidenceThreshold: number,
) {
  if (!resolution) return false;
  if (candidate.verdict === "excluded_negative_signal") return false;
  if (candidate.negativeSignalHits.length > 0) return false;
  if (resolution.status !== "resolved" || resolution.country !== "JP") return false;
  if (resolution.confidence < confidenceThreshold) return false;
  if (typeof resolution.lat !== "number" || typeof resolution.lng !== "number") return false;
  if (resolution.evidenceUrls.length === 0) return false;
  return true;
}

function toResolvedPublicPlace(
  candidate: GeocodedCandidate,
  resolution: LocationResolution,
  generatedAt: string,
): PublicPlace {
  return {
    id: candidate.id,
    status: "published",
    country: "JP",
    nameKoOrOriginal: resolution.resolvedName,
    nameLocal: candidate.nameLocal,
    city: resolution.city,
    area: resolution.area ?? candidate.area,
    lat: resolution.lat!,
    lng: resolution.lng!,
    categoryTags: candidate.categoryTags,
    commentKoAuto: `${candidate.commentKoAuto} Hermes가 공개 웹 근거로 위치를 확인했습니다.`,
    verdict: "auto_recommended",
    confidence: Math.max(candidate.confidence, resolution.confidence),
    negativeSignalHits: [],
    sourceVideoId: candidate.videoId,
    sourceVideoTitle: candidate.videoTitle,
    sourceVideoUrl: candidate.videoUrl,
    thumbnailUrl: candidate.thumbnailUrl,
    sourceCommentId: candidate.sourceCommentId,
    sourceKind: "owner_location_comment_candidate",
    googleMapsUrl: resolution.googleMapsSearchUrl,
    locationResolvedBy: resolution.resolvedBy,
    locationConfidence: resolution.confidence,
    evidenceUrls: resolution.evidenceUrls,
    coordinateSource: resolution.coordinateSource,
    placeTypeKo: resolution.placeTypeKo,
    signatureKo: resolution.signatureKo,
    whyKo: resolution.whyKo,
    displayDescriptionKo: resolution.displayDescriptionKo,
    generatedAt,
  };
}

export function buildResolvedPublicPlaces(
  candidates: GeocodedCandidate[],
  resolutions: LocationResolution[],
  options: ResolutionBuildOptions,
) {
  const resolutionByCandidate = new Map<string, LocationResolution>();
  for (const resolution of resolutions) {
    if (!resolutionByCandidate.has(resolutionKey(resolution))) {
      resolutionByCandidate.set(resolutionKey(resolution), resolution);
    }
  }

  const seenVideos = new Set<string>();
  const places: PublicPlace[] = [];
  for (const candidate of candidates) {
    if (seenVideos.has(candidate.videoId)) continue;
    const resolution = resolutionByCandidate.get(candidateKey(candidate));
    if (!isPublishableResolution(candidate, resolution, options.confidenceThreshold)) continue;
    places.push(toResolvedPublicPlace(candidate, resolution!, options.generatedAt));
    seenVideos.add(candidate.videoId);
  }

  return publicPlacesSchema.parse(places);
}

export function mergeAndDedupePublicPlaces(
  basePlaces: PublicPlace[],
  resolvedPlaces: PublicPlace[],
) {
  const merged: PublicPlace[] = [];
  const seenSourceVideos = new Set<string>();
  const seenPlaceKeys = new Set<string>();

  for (const place of [...resolvedPlaces, ...basePlaces]) {
    const placeKey = `${place.nameKoOrOriginal.toLowerCase()}|${place.city.toLowerCase()}|${place.lat.toFixed(5)}|${place.lng.toFixed(5)}`;
    if (seenSourceVideos.has(place.sourceVideoId) || seenPlaceKeys.has(placeKey)) continue;
    merged.push(place);
    seenSourceVideos.add(place.sourceVideoId);
    seenPlaceKeys.add(placeKey);
  }

  return publicPlacesSchema.parse(merged);
}
