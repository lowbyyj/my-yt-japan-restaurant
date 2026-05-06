import {
  extractGoogleMapsUrls,
  parseCoordinatesFromGoogleMapsUrl,
} from "./utils/googleMapsUrl.js";
import {
  findJapanSignals,
  findNegativeSignals,
  findPositiveSignals,
  parseOwnerComment,
  scoreOwnerLocationComment,
} from "./utils/parseOwnerComment.js";

type DryRunScenario = {
  name: string;
  title: string;
  comment: string;
  expectedVerdict: "publishable" | "excluded_negative_signal" | "held_back";
};

type DryRunResult = {
  name: string;
  verdict: "publishable" | "excluded_negative_signal" | "held_back";
  confidence: number;
  coordinates: boolean;
  japanSignals: number;
  negativeSignals: string[];
  positiveSignals: string[];
};

const scenarios: DryRunScenario[] = [
  {
    name: "positive Japan owner location comment with coordinate URL",
    title: "Tokyo synthetic ramen short",
    comment: [
      "Store: FAKE_TEST_SHOP_ALPHA",
      "Address: 東京都テスト区 1-2-3",
      "Map: https://www.google.com/maps/place/Fake/@35.681236,139.767125,17z",
      "추천 테스트",
    ].join("\n"),
    expectedVerdict: "publishable",
  },
  {
    name: "negative signal owner comment is excluded",
    title: "Osaka synthetic cafe short",
    comment: [
      "Store: FAKE_TEST_SHOP_BETA",
      "Address: 大阪府テスト市 4-5-6",
      "Map: https://www.google.com/maps/place/Fake/data=!3m1!4b1!4m6!3d34.6937!4d135.5023",
      "웨이팅 대비 아쉽고 비추",
    ].join("\n"),
    expectedVerdict: "excluded_negative_signal",
  },
  {
    name: "non-Japan hint is held back",
    title: "Synthetic Seoul snack short",
    comment: [
      "Store: FAKE_TEST_SHOP_GAMMA",
      "Address: Seoul synthetic district",
      "Map: https://www.google.com/maps/search/?api=1&query=37.5665,126.9780",
      "맛있 테스트",
    ].join("\n"),
    expectedVerdict: "held_back",
  },
  {
    name: "Japan hint without coordinates is held back for geocode",
    title: "Kyoto synthetic dessert short",
    comment: [
      "Store: FAKE_TEST_SHOP_DELTA",
      "Address: 京都府テスト町",
      "Map: https://www.google.com/maps/search/?api=1&query=FAKE_TEST_SHOP_DELTA%20Kyoto",
      "추천 테스트",
    ].join("\n"),
    expectedVerdict: "held_back",
  },
  {
    name: "multiple links and noisy text does not crash",
    title: "Fukuoka synthetic market short",
    comment: [
      "noise ### FAKE_TEST_SHOP_EPSILON ###",
      "Link one: https://maps.app.goo.gl/fakeShortLink",
      "Link two: https://www.google.com/maps/search/?api=1&query=33.5902,130.4017",
      "福岡 테스트 꼭 가",
      "random symbols !!! ???",
    ].join("\n"),
    expectedVerdict: "publishable",
  },
];

function evaluateScenario(scenario: DryRunScenario): DryRunResult {
  const parsed = parseOwnerComment(scenario.comment, scenario.title);
  const combined = `${scenario.title}\n${scenario.comment}`;
  const googleMapsUrls = extractGoogleMapsUrls(scenario.comment);
  const coordinateHit = googleMapsUrls
    .map((url) => parseCoordinatesFromGoogleMapsUrl(url))
    .find(Boolean);
  const negativeSignals = findNegativeSignals(combined);
  const positiveSignals = findPositiveSignals(combined);
  const japanSignals = findJapanSignals(combined);
  const score = scoreOwnerLocationComment(scenario.comment);
  const confidence = Math.min(
    0.98,
    0.32 + Math.min(0.38, score / 240) + parsed.confidenceBoost,
  );

  let verdict: DryRunResult["verdict"] = "held_back";
  if (negativeSignals.length > 0) {
    verdict = "excluded_negative_signal";
  } else if (coordinateHit && japanSignals.length > 0 && confidence >= 0.55) {
    verdict = "publishable";
  }

  return {
    name: scenario.name,
    verdict,
    confidence,
    coordinates: Boolean(coordinateHit),
    japanSignals: japanSignals.length,
    negativeSignals,
    positiveSignals,
  };
}

const results = scenarios.map(evaluateScenario);
const failures = results.filter(
  (result, index) => result.verdict !== scenarios[index]?.expectedVerdict,
);

console.log("data:dry-run synthetic pipeline report");
console.log("source: synthetic fake fixtures only");
console.log("network: disabled by design");
console.log("");

for (const result of results) {
  console.log(
    [
      `[${result.verdict}]`,
      result.name,
      `confidence=${result.confidence.toFixed(2)}`,
      `coordinates=${result.coordinates}`,
      `japanSignals=${result.japanSignals}`,
      `negative=${result.negativeSignals.join("|") || "none"}`,
      `positive=${result.positiveSignals.join("|") || "none"}`,
    ].join(" "),
  );
}

if (failures.length > 0) {
  console.error("");
  console.error(`data:dry-run failed ${failures.length} scenario(s).`);
  for (const failure of failures) {
    console.error(`- ${failure.name}: got ${failure.verdict}`);
  }
  process.exit(1);
}

console.log("");
console.log("data:dry-run passed. No public data was written.");
