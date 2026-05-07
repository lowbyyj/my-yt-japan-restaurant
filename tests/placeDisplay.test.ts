import { describe, expect, it } from "vitest";
import {
  buildDisplayDescription,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsViewUrl,
  classifyBroadCategory,
  forbiddenPublicDescriptionPattern,
  friendlyCategoryTag,
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

const forbiddenDescriptionWords =
  /영상의 상호|상호·주소|GSI|공개 주소|좌표|지도에 추가|위치를 확정|후보입니다|public evidence|Hermes|자동 추출|coordinate|source|evidence|confidence/i;

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

    expect(description).toBe("도쿄에서 소개된 라멘집.");
    expect(description).not.toMatch(/Hermes|자동 추출|owner comment|confidence|coordinateSource/i);
  });

  it("uses city and area fallback when video title is not descriptive", () => {
    expect(
      buildDisplayDescription(
        place({ sourceVideoTitle: "2026년 4월 4일", city: "Fukuoka", area: "Tenjin" }),
      ),
    ).toBe("Fukuoka / Tenjin에서 소개된 가게.");
  });

  it("prefers curated public-safe enrichment text when available", () => {
    expect(
      buildDisplayDescription(
        place({
          placeTypeKo: "카페",
          signatureKo: "말차 프렌치토스트",
          displayDescriptionKo: "후쿠오카 텐진에서 말차 프렌치토스트로 소개된 카페.",
        }),
      ),
    ).toBe("후쿠오카 텐진에서 말차 프렌치토스트로 소개된 카페.");
  });

  it("normalizes English category tags for Korean card chips", () => {
    expect(friendlyCategoryTag("ramen")).toBe("라멘");
    expect(friendlyCategoryTag("yakiniku")).toBe("야키니쿠");
    expect(friendlyCategoryTag("unknown-tag")).toBe("unknown-tag");
  });

  it("classifies meal genres into 밥", () => {
    expect(classifyBroadCategory(place({ categoryTags: ["ramen"] }))).toBe("밥");
    expect(classifyBroadCategory(place({ categoryTags: ["sushi"] }))).toBe("밥");
    expect(classifyBroadCategory(place({ categoryTags: ["yakiniku"] }))).toBe("밥");
  });

  it("classifies dessert genres into 디저트", () => {
    expect(classifyBroadCategory(place({ categoryTags: ["cafe"] }))).toBe("디저트");
    expect(classifyBroadCategory(place({ categoryTags: ["dessert"] }))).toBe("디저트");
    expect(classifyBroadCategory(place({ categoryTags: ["bakery"] }))).toBe("디저트");
  });

  it("classifies drinking genres into 술", () => {
    expect(classifyBroadCategory(place({ placeTypeKo: "바" }))).toBe("술");
    expect(classifyBroadCategory(place({ placeTypeKo: "이자카야" }))).toBe("술");
    expect(classifyBroadCategory(place({ signatureKo: "사케와 야키토리" }))).toBe("술");
  });

  it("exposes a shared forbidden public description pattern", () => {
    expect("영상의 상호·주소를 기준으로 GSI 공개 주소 좌표를 확인해 지도에 추가했습니다.").toMatch(
      forbiddenPublicDescriptionPattern,
    );
    expect("도쿄에서 라멘 일정을 짤 때 넣기 좋은 라멘집.").not.toMatch(
      forbiddenPublicDescriptionPattern,
    );
  });

  it("does not return forbidden wording from enriched descriptions", () => {
    const description = buildDisplayDescription(
      place({
        displayDescriptionKo:
          "영상의 상호·주소를 기준으로 GSI 공개 주소 좌표를 확인해 지도에 추가했습니다.",
      }),
    );

    expect(description).not.toMatch(forbiddenDescriptionWords);
  });
});
