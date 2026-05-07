import { z } from "zod";

export const publicPlaceSchema = z.object({
  id: z.string().min(1),
  status: z.literal("published"),
  country: z.literal("JP"),
  nameKoOrOriginal: z.string().min(1),
  nameLocal: z.string().min(1).optional(),
  city: z.string().min(1),
  area: z.string().min(1).optional(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  categoryTags: z.array(z.string().min(1)).default([]),
  commentKoAuto: z.string().min(1),
  verdict: z.literal("auto_recommended"),
  confidence: z.number().min(0).max(1),
  negativeSignalHits: z.array(z.string()).max(0),
  sourceVideoId: z.string().min(1),
  sourceVideoTitle: z.string().min(1),
  sourceVideoUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  sourceCommentId: z.string().min(1),
  sourceKind: z.literal("owner_location_comment_candidate"),
  googleMapsUrl: z.string().url().optional(),
  locationResolvedBy: z.literal("hermes").optional(),
  locationConfidence: z.number().min(0).max(1).optional(),
  evidenceUrls: z.array(z.string().url()).optional(),
  coordinateSource: z.string().min(1).optional(),
  generatedAt: z.string().datetime(),
});

export const publicPlacesSchema = z.array(publicPlaceSchema);

export const dataStatusSchema = z.object({
  dataGenerated: z.boolean(),
  reason: z.string().optional(),
  generatedAt: z.string().datetime().nullable(),
  channelHandle: z.string().min(1),
  videosScanned: z.number().int().nonnegative(),
  likelyShorts: z.number().int().nonnegative(),
  ownerCommentCandidates: z.number().int().nonnegative(),
  japanCandidates: z.number().int().nonnegative(),
  geocoded: z.number().int().nonnegative(),
  published: z.number().int().nonnegative(),
  excludedNegativeSignal: z.number().int().nonnegative(),
  needsGeocode: z.number().int().nonnegative(),
  heldBack: z.number().int().nonnegative(),
  heldBackLowConfidence: z.number().int().nonnegative().default(0),
  heldBackMissingGeocode: z.number().int().nonnegative().default(0),
  heldBackNonJapan: z.number().int().nonnegative().default(0),
  geocodeHoldbackBreakdown: z.record(z.string(), z.number().int().nonnegative()).optional(),
});

export type PublicPlace = z.infer<typeof publicPlaceSchema>;
export type DataStatus = z.infer<typeof dataStatusSchema>;

export const locationCommentSourceSchema = z.object({
  videoId: z.string().min(1),
  videoTitle: z.string().min(1),
  videoDescription: z.string().default(""),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
  sourceCommentId: z.string().min(1),
  sourceCommentText: z.string().min(1),
  candidateScore: z.number().nonnegative(),
  sourceKind: z.literal("owner_location_comment_candidate"),
});

export const placeCandidateSchema = locationCommentSourceSchema.extend({
  id: z.string().min(1),
  nameKoOrOriginal: z.string().min(1),
  nameLocal: z.string().min(1).optional(),
  addressCandidate: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  area: z.string().min(1).optional(),
  country: z.literal("JP").optional(),
  googleMapsUrl: z.string().url().optional(),
  googleMapsQuery: z.string().min(1).optional(),
  categoryTags: z.array(z.string().min(1)),
  commentKoAuto: z.string().min(1),
  verdict: z.enum([
    "auto_recommended",
    "excluded_negative_signal",
    "needs_geocode",
  ]),
  confidence: z.number().min(0).max(1),
  negativeSignalHits: z.array(z.string()),
  positiveSignalHits: z.array(z.string()),
  japanSignalHits: z.array(z.string()),
  generatedAt: z.string().datetime(),
});

export const placeCandidatesSchema = z.array(placeCandidateSchema);
export type PlaceCandidate = z.infer<typeof placeCandidateSchema>;

export const locationResolutionSchema = z.object({
  id: z.string().min(1),
  sourceVideoId: z.string().min(1),
  sourceCommentId: z.string().min(1).optional(),
  candidateName: z.string().min(1),
  resolvedName: z.string().min(1),
  country: z.literal("JP"),
  city: z.string().min(1),
  area: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  googleMapsSearchUrl: z.string().url(),
  sourceVideoUrl: z.string().url(),
  evidenceUrls: z.array(z.string().url()),
  evidenceNotes: z.string().min(1),
  coordinateSource: z.string().min(1),
  resolvedBy: z.literal("hermes"),
  resolvedAt: z.string().datetime(),
  confidence: z.number().min(0).max(1),
  status: z.literal("resolved"),
});

export const locationResolutionsSchema = z.array(locationResolutionSchema);
export type LocationResolution = z.infer<typeof locationResolutionSchema>;

export const geocodedCandidateSchema = placeCandidateSchema.extend({
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  geocodeProvider: z.string().optional(),
  geocodeQuery: z.string().optional(),
  geocodeConfidence: z.number().min(0).max(1).optional(),
});

export const geocodedCandidatesSchema = z.array(geocodedCandidateSchema);
export type GeocodedCandidate = z.infer<typeof geocodedCandidateSchema>;
