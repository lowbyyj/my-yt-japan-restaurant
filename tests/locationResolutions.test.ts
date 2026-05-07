import { describe, expect, it } from "vitest";
import { buildResolvedPublicPlaces } from "../scripts/utils/locationResolutions.js";
import { locationResolutionSchema } from "../scripts/utils/schema.js";

const baseCandidate = {
  id: "candidate_1",
  videoId: "video_1",
  videoTitle: "Synthetic restaurant video",
  videoDescription: "",
  videoUrl: "https://www.youtube.com/watch?v=video_1",
  thumbnailUrl: "https://i.ytimg.com/vi/video_1/hqdefault.jpg",
  sourceCommentId: "comment_1",
  sourceCommentText: "synthetic fixture only",
  candidateScore: 72,
  sourceKind: "owner_location_comment_candidate" as const,
  nameKoOrOriginal: "FAKE_TEST_SHOP_ALPHA",
  city: "Tokyo",
  country: "JP" as const,
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=FAKE_TEST_SHOP_ALPHA+Tokyo+Japan",
  categoryTags: ["라멘"],
  commentKoAuto: "YouTube owner comment candidate에서 자동 추출한 장소입니다.",
  verdict: "needs_geocode" as const,
  confidence: 0.88,
  negativeSignalHits: [] as string[],
  positiveSignalHits: ["추천"],
  japanSignalHits: ["도쿄"],
  generatedAt: "2026-05-07T00:00:00.000Z",
};

const baseResolution = {
  id: "resolution_1",
  sourceVideoId: "video_1",
  sourceCommentId: "comment_1",
  candidateName: "FAKE_TEST_SHOP_ALPHA",
  resolvedName: "FAKE_TEST_SHOP_ALPHA Tokyo",
  country: "JP" as const,
  city: "Tokyo",
  address: "1-2-3 Fakecho, Tokyo",
  lat: 35.681236,
  lng: 139.767125,
  googleMapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=FAKE_TEST_SHOP_ALPHA+Tokyo",
  sourceVideoUrl: "https://www.youtube.com/watch?v=video_1",
  evidenceUrls: ["https://www.openstreetmap.org/node/123456789"],
  evidenceNotes: "Synthetic OSM/Nominatim fixture confirms name and Tokyo address.",
  coordinateSource: "osm",
  resolvedBy: "hermes" as const,
  resolvedAt: "2026-05-07T00:00:00.000Z",
  confidence: 0.86,
  status: "resolved" as const,
};

describe("agent-assisted location resolutions", () => {
  it("validates public-safe resolved records", () => {
    expect(locationResolutionSchema.parse(baseResolution)).toMatchObject({
      resolvedBy: "hermes",
      status: "resolved",
      country: "JP",
    });
  });

  it("publishes a resolved candidate with evidence metadata", () => {
    const places = buildResolvedPublicPlaces([baseCandidate], [baseResolution], {
      generatedAt: "2026-05-07T00:00:00.000Z",
      confidenceThreshold: 0.55,
    });

    expect(places).toHaveLength(1);
    expect(places[0]).toMatchObject({
      id: "candidate_1",
      nameKoOrOriginal: "FAKE_TEST_SHOP_ALPHA Tokyo",
      lat: 35.681236,
      lng: 139.767125,
      locationResolvedBy: "hermes",
      locationConfidence: 0.86,
      coordinateSource: "osm",
      evidenceUrls: ["https://www.openstreetmap.org/node/123456789"],
    });
  });

  it("does not publish negative-signal candidates even if a resolution exists", () => {
    const places = buildResolvedPublicPlaces(
      [
        {
          ...baseCandidate,
          verdict: "excluded_negative_signal" as const,
          negativeSignalHits: ["비추"],
        },
      ],
      [baseResolution],
      { generatedAt: "2026-05-07T00:00:00.000Z", confidenceThreshold: 0.55 },
    );

    expect(places).toEqual([]);
  });

  it("requires evidence URLs and coordinates before publishing", () => {
    expect(
      buildResolvedPublicPlaces(
        [baseCandidate],
        [{ ...baseResolution, evidenceUrls: [] }],
        { generatedAt: "2026-05-07T00:00:00.000Z", confidenceThreshold: 0.55 },
      ),
    ).toEqual([]);

    expect(
      buildResolvedPublicPlaces(
        [baseCandidate],
        [{ ...baseResolution, lat: undefined }],
        { generatedAt: "2026-05-07T00:00:00.000Z", confidenceThreshold: 0.55 },
      ),
    ).toEqual([]);
  });

  it("deduplicates repeated resolutions for the same source video", () => {
    const places = buildResolvedPublicPlaces(
      [baseCandidate, { ...baseCandidate, id: "candidate_duplicate" }],
      [baseResolution],
      { generatedAt: "2026-05-07T00:00:00.000Z", confidenceThreshold: 0.55 },
    );

    expect(places).toHaveLength(1);
  });
});
