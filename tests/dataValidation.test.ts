import { describe, expect, it } from "vitest";
import {
  dataStatusSchema,
  publicPlaceSchema,
  publicPlacesSchema,
} from "../scripts/utils/schema.js";

const safeEmptyStatus = {
  dataGenerated: false,
  reason: "YOUTUBE_API_KEY not provided",
  generatedAt: null,
  videosScanned: 0,
  likelyShorts: 0,
  ownerCommentCandidates: 0,
  japanCandidates: 0,
  geocoded: 0,
  published: 0,
  excludedNegativeSignal: 0,
  needsGeocode: 0,
  heldBack: 0,
};

const validPublishedPlace = {
  id: "synthetic_public_place",
  status: "published",
  country: "JP",
  nameKoOrOriginal: "FAKE_TEST_SHOP_PUBLIC",
  city: "Tokyo",
  lat: 35.681236,
  lng: 139.767125,
  categoryTags: ["synthetic"],
  commentKoAuto: "Synthetic test record only.",
  sourceVideoId: "syntheticVideoId",
  sourceVideoUrl: "https://www.youtube.com/watch?v=syntheticVideoId",
  thumbnailUrl: "https://i.ytimg.com/vi/syntheticVideoId/hqdefault.jpg",
  generatedAt: "2026-05-06T00:00:00.000Z",
} as const;

describe("no-key public data behavior", () => {
  it("allows empty public places when dataGenerated=false", () => {
    expect(publicPlacesSchema.parse([])).toEqual([]);
    expect(dataStatusSchema.parse(safeEmptyStatus).dataGenerated).toBe(false);
  });
});

describe("public place validation", () => {
  it("accepts a fully sourced synthetic published record", () => {
    expect(publicPlaceSchema.parse(validPublishedPlace)).toMatchObject({
      id: "synthetic_public_place",
      country: "JP",
    });
  });

  it("requires coordinates for published records", () => {
    const { lat: _lat, ...missingLat } = validPublishedPlace;

    expect(() => publicPlaceSchema.parse(missingLat)).toThrow();
  });

  it("requires source video and thumbnail fields for published records", () => {
    const { sourceVideoUrl: _sourceVideoUrl, thumbnailUrl: _thumbnailUrl, ...missing } =
      validPublishedPlace;

    expect(() => publicPlaceSchema.parse(missing)).toThrow();
  });

  it("strips internal validation/provenance fields from public records", () => {
    const parsed = publicPlaceSchema.parse({
      ...validPublishedPlace,
      confidence: 0.82,
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=raw+comment+text",
      negativeSignalHits: ["비추"],
      sourceKind: "owner_location_comment_candidate",
      sourceVideoTitle: "Synthetic fake video title",
    });

    expect(parsed).not.toHaveProperty("confidence");
    expect(parsed).not.toHaveProperty("googleMapsUrl");
    expect(parsed).not.toHaveProperty("sourceVideoTitle");
  });
});
