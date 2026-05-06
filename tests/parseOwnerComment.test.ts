import { describe, expect, it } from "vitest";
import {
  findNegativeSignals,
  parseOwnerComment,
  scoreOwnerLocationComment,
} from "../scripts/utils/parseOwnerComment.js";

describe("parseOwnerComment", () => {
  it("extracts synthetic owner location comment fields", () => {
    const parsed = parseOwnerComment(
      [
        "📍상호: 테스트가게",
        "주소: 東京都테스트区 1-2-3",
        "위치 https://www.google.com/maps/place/Test/@35.681236,139.767125,17z",
        "라멘 꼭 가",
      ].join("\n"),
      "도쿄 테스트 라멘 Shorts",
    );

    expect(parsed.nameKoOrOriginal).toBe("테스트가게");
    expect(parsed.addressCandidate).toContain("東京都");
    expect(parsed.city).toBe("Tokyo");
    expect(parsed.googleMapsUrl).toContain("google.com/maps");
    expect(parsed.categoryTags).toContain("라멘");
    expect(parsed.positiveSignalHits).toContain("꼭 가");
  });

  it("scores map and address comments above plain comments", () => {
    const locationScore = scoreOwnerLocationComment(
      "📍상호: 테스트가게\n주소: 大阪府테스트市\nhttps://www.google.com/maps/place/Test",
    );
    const plainScore = scoreOwnerLocationComment("오늘 영상 봐주셔서 감사합니다");

    expect(locationScore).toBeGreaterThan(plainScore);
  });
});

describe("negative signal detection", () => {
  it("detects configured negative Korean phrases", () => {
    expect(findNegativeSignals("웨이팅 대비 아쉽고 재방문은 안 할 듯")).toEqual([
      "아쉽",
      "웨이팅 대비",
      "재방문은 안",
    ]);
  });
});
