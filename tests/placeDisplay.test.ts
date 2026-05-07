import { describe, expect, it } from "vitest";
import {
  buildDisplayDescription,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsViewUrl,
} from "../src/placeDisplay.js";
import type { PublicPlace } from "../src/types.js";

function place(overrides: Partial<PublicPlace> = {}): PublicPlace {
  return {
    id: "p1",
    status: "published",
    country: "JP",
    nameKoOrOriginal: "도쿄 라멘",
    nameLocal: "麺屋 テスト",
    city: "Tokyo",
    area: "Ginza",
    lat: 35.123456,
    lng: 139.654321,
    categoryTags: ["ramen", "noodles"],
    commentKoAuto: "Hermes가 공개 웹 근거로 위치를 확인했습니다.",
    verdict: "auto_recommended",
    confidence: 0.91,
    negativeSignalHits: [],
    sourceVideoId: "abc",
    sourceVideoTitle: "도쿄에서 한정판 라멘을 주문하면 생기는 일",
    sourceVideoUrl: "https://www.youtube.com/watch?v=abc",
    thumbnailUrl: "https://example.com/thumb.jpg",
    sourceCommentId: "comment",
    sourceKind: "owner_location_comment_candidate",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=%EB%8F%84%EC%BF%84%EC%97%90%EC%84%9C%20%ED%95%9C%EC%A0%95%ED%8C%90%20%EB%9D%BC%EB%A9%98%EC%9D%84%20%EC%A3%BC%EB%AC%B8",
    generatedAt: "2026-05-07T00:00:00Z",
    ...overrides,
  };
}

describe("place display helpers", () => {
  it("uses coordinates for primary Google Maps view URL even when a comment-derived URL exists", () => {
    expect(buildGoogleMapsViewUrl(place())).toBe(
      "https://www.google.com/maps/search/?api=1&query=35.123456%2C139.654321",
    );
  });

  it("builds a coordinate-based Google Maps directions URL", () => {
    expect(buildGoogleMapsDirectionsUrl(place())).toBe(
      "https://www.google.com/maps/dir/?api=1&destination=35.123456%2C139.654321",
    );
  });

  it("falls back to a readable name/city search only when coordinates are missing", () => {
    expect(buildGoogleMapsViewUrl({ ...place(), lat: Number.NaN, lng: Number.NaN })).toBe(
      "https://www.google.com/maps/search/?api=1&query=%E9%BA%BA%E5%B1%8B%20%E3%83%86%E3%82%B9%E3%83%88%20Tokyo%20Japan",
    );
  });

  it("generates a user-facing description without internal provenance wording", () => {
    const description = buildDisplayDescription(place());

    expect(description).toBe("도쿄에서 소개된 라멘 가게.");
    expect(description).not.toMatch(/Hermes|자동 추출|owner comment|confidence|coordinateSource/i);
  });

  it("uses city and area fallback when video title is not descriptive", () => {
    expect(
      buildDisplayDescription(
        place({ sourceVideoTitle: "2026년 4월 4일", city: "Fukuoka", area: "Tenjin" }),
      ),
    ).toBe("Fukuoka / Tenjin에서 소개된 가게.");
  });
});
