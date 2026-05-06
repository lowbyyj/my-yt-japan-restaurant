import { describe, expect, it } from "vitest";
import {
  NEGATIVE_SIGNALS,
  findNegativeSignals,
  parseOwnerComment,
  scoreOwnerLocationComment,
} from "../scripts/utils/parseOwnerComment.js";

describe("parseOwnerComment", () => {
  it("extracts synthetic owner location comment fields", () => {
    const parsed = parseOwnerComment(
      [
        "상호: FAKE_TEST_SHOP_ALPHA",
        "주소: 東京都テスト区 1-2-3",
        "위치 https://www.google.com/maps/place/Fake/@35.681236,139.767125,17z",
        "라멘 꼭 가",
      ].join("\n"),
      "도쿄 synthetic 라멘 Shorts",
    );

    expect(parsed.nameKoOrOriginal).toBe("FAKE_TEST_SHOP_ALPHA");
    expect(parsed.addressCandidate).toContain("東京都");
    expect(parsed.city).toBe("Tokyo");
    expect(parsed.googleMapsUrl).toContain("google.com/maps");
    expect(parsed.categoryTags).toContain("라멘");
    expect(parsed.positiveSignalHits).toContain("꼭 가");
  });

  it("scores owner location comments above plain owner comments", () => {
    const locationScore = scoreOwnerLocationComment(
      [
        "상호: FAKE_TEST_SHOP_BETA",
        "주소: 大阪府テスト市 4-5-6",
        "https://www.google.com/maps/place/Fake",
      ].join("\n"),
    );
    const plainScore = scoreOwnerLocationComment("오늘 영상 봐주셔서 감사합니다");

    expect(locationScore).toBeGreaterThan(plainScore);
    expect(locationScore).toBeGreaterThanOrEqual(60);
  });
});

describe("negative signal detection", () => {
  it.each(NEGATIVE_SIGNALS)("detects negative signal: %s", (signal) => {
    expect(findNegativeSignals(`테스트 문장 ${signal} 테스트`)).toContain(signal);
  });

  it("detects all configured negative Korean phrases together", () => {
    const detected = findNegativeSignals(NEGATIVE_SIGNALS.join(" / "));

    expect(detected).toEqual(NEGATIVE_SIGNALS);
  });
});
