import { describe, expect, it } from "vitest";
import {
  buildDisplayDescription,
  buildGoogleMapsDirectionsUrl,
  buildGoogleMapsViewUrl,
  classifyBroadCategory,
  forbiddenPublicDescriptionPattern,
  friendlyCategoryTag,
  thumbnailAltText,
  thumbnailFallbackEmoji,
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
    commentKoAuto: "숏츠에서 저장해 둔 일본 가게입니다.",
    sourceVideoId: "abc",
    sourceVideoUrl: "https://www.youtube.com/watch?v=abc",
    thumbnailUrl: "https://example.com/thumb.jpg",
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

    expect(description).toBe("Tokyo / Ginza에서 들르기 좋은 라멘집.");
    expect(description).not.toMatch(/Hermes|자동 추출|owner comment|confidence|coordinateSource/i);
  });

  it("uses city and category copy instead of source video title fallback", () => {
    expect(buildDisplayDescription(place({ city: "Fukuoka", area: "Tenjin" }))).toBe(
      "Fukuoka / Tenjin에서 들르기 좋은 라멘집.",
    );
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

  it("uses source-neutral thumbnail alt text", () => {
    expect(thumbnailAltText(place())).toBe("麺屋 テスト 관련 영상 썸네일");
    expect(thumbnailAltText(place({ nameLocal: undefined }))).toBe(
      "도쿄 라멘 관련 영상 썸네일",
    );
  });

  it("chooses category placeholders when thumbnails fail", () => {
    expect(thumbnailFallbackEmoji(place({ broadCategoryKo: "밥" }))).toBe("🍜");
    expect(thumbnailFallbackEmoji(place({ broadCategoryKo: "디저트" }))).toBe("🍮");
    expect(thumbnailFallbackEmoji(place({ broadCategoryKo: "술" }))).toBe("🍶");
  });
});
