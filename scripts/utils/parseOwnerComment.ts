import {
  createGoogleMapsSearchUrl,
  extractGoogleMapsQuery,
  extractGoogleMapsUrls,
} from "./googleMapsUrl.js";

export const NEGATIVE_SIGNALS = [
  "아쉽",
  "별로",
  "비추",
  "실망",
  "굳이",
  "최악",
  "노맛",
  "가지마",
  "패스",
  "웨이팅 대비",
  "재방문은 안",
  "추천하지",
];

export const POSITIVE_SIGNALS = [
  "추천",
  "강추",
  "맛있",
  "최고",
  "인생",
  "또 갈",
  "미쳤",
  "꼭 가",
  "찐",
];

const LOCATION_HINTS = [
  "📍",
  "위치",
  "주소",
  "상호",
  "가게",
  "식당",
  "도쿄",
  "오사카",
  "후쿠오카",
  "교토",
  "삿포로",
  "나고야",
  "고베",
  "요코하마",
  "일본",
  "東京都",
  "大阪府",
  "京都府",
  "福岡",
  "〒",
];

const JAPAN_HINTS = [
  "일본",
  "도쿄",
  "오사카",
  "교토",
  "후쿠오카",
  "삿포로",
  "나고야",
  "고베",
  "요코하마",
  "히로시마",
  "나라",
  "오키나와",
  "Tokyo",
  "Osaka",
  "Kyoto",
  "Fukuoka",
  "Sapporo",
  "Nagoya",
  "Kobe",
  "Yokohama",
  "Japan",
  "東京都",
  "大阪府",
  "京都府",
  "福岡",
  "北海道",
  "愛知県",
  "兵庫県",
  "神奈川県",
  "日本",
  "〒",
];

const CITY_HINTS: Array<[string, string]> = [
  ["도쿄", "Tokyo"],
  ["東京", "Tokyo"],
  ["Tokyo", "Tokyo"],
  ["오사카", "Osaka"],
  ["大阪", "Osaka"],
  ["Osaka", "Osaka"],
  ["교토", "Kyoto"],
  ["京都", "Kyoto"],
  ["Kyoto", "Kyoto"],
  ["후쿠오카", "Fukuoka"],
  ["福岡", "Fukuoka"],
  ["Fukuoka", "Fukuoka"],
  ["삿포로", "Sapporo"],
  ["札幌", "Sapporo"],
  ["Sapporo", "Sapporo"],
  ["나고야", "Nagoya"],
  ["名古屋", "Nagoya"],
  ["Nagoya", "Nagoya"],
  ["고베", "Kobe"],
  ["神戸", "Kobe"],
  ["Kobe", "Kobe"],
  ["요코하마", "Yokohama"],
  ["横浜", "Yokohama"],
  ["Yokohama", "Yokohama"],
  ["히로시마", "Hiroshima"],
  ["広島", "Hiroshima"],
  ["Hiroshima", "Hiroshima"],
  ["오키나와", "Okinawa"],
  ["沖縄", "Okinawa"],
  ["Okinawa", "Okinawa"],
];

const CATEGORY_HINTS: Array<[string, string]> = [
  ["라멘", "라멘"],
  ["ramen", "라멘"],
  ["ラーメン", "라멘"],
  ["스시", "스시"],
  ["초밥", "스시"],
  ["寿司", "스시"],
  ["돈카츠", "돈카츠"],
  ["とんかつ", "돈카츠"],
  ["카츠", "돈카츠"],
  ["카페", "카페"],
  ["cafe", "카페"],
  ["커피", "카페"],
  ["우동", "우동"],
  ["うどん", "우동"],
  ["소바", "소바"],
  ["そば", "소바"],
  ["야키토리", "야키토리"],
  ["焼き鳥", "야키토리"],
  ["이자카야", "이자카야"],
  ["居酒屋", "이자카야"],
  ["오코노미야키", "오코노미야키"],
  ["お好み焼", "오코노미야키"],
  ["카레", "카레"],
  ["カレー", "카레"],
  ["덮밥", "덮밥"],
  ["동", "덮밥"],
  ["丼", "덮밥"],
  ["디저트", "디저트"],
  ["빵", "베이커리"],
  ["パン", "베이커리"],
  ["베이커리", "베이커리"],
  ["시장", "시장"],
  ["편의점", "편의점"],
  ["쇼핑", "쇼핑"],
];

export type ParsedOwnerComment = {
  nameKoOrOriginal?: string;
  nameLocal?: string;
  addressCandidate?: string;
  city?: string;
  area?: string;
  googleMapsUrl?: string;
  googleMapsQuery?: string;
  categoryTags: string[];
  commentKoAuto: string;
  confidenceBoost: number;
  japanSignalHits: string[];
  positiveSignalHits: string[];
  negativeSignalHits: string[];
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripLabel(value: string) {
  return normalize(
    value
      .replace(/^[📍\s-]*/u, "")
      .replace(/^(상호|가게|식당|주소|위치|매장|店名|住所|場所)\s*[:：-]\s*/iu, ""),
  );
}

function linesFromComment(text: string) {
  return text
    .split(/\r?\n/u)
    .map((line) => stripLabel(line))
    .filter(Boolean)
    .filter((line) => !line.startsWith("http"));
}

export function findSignalHits(text: string, signals: string[]) {
  const folded = text.toLowerCase();
  return signals.filter((signal) => folded.includes(signal.toLowerCase()));
}

export function findNegativeSignals(text: string) {
  return findSignalHits(text, NEGATIVE_SIGNALS);
}

export function findPositiveSignals(text: string) {
  return findSignalHits(text, POSITIVE_SIGNALS);
}

export function findJapanSignals(text: string) {
  return findSignalHits(text, JAPAN_HINTS);
}

export function scoreOwnerLocationComment(text: string, relevanceRank = 0) {
  const mapsUrls = extractGoogleMapsUrls(text);
  const locationHits = findSignalHits(text, LOCATION_HINTS);
  const japanHits = findJapanSignals(text);
  const positiveHits = findPositiveSignals(text);
  const negativeHits = findNegativeSignals(text);
  const addressLike =
    /(?:〒\d{3}-?\d{4}|[都道府県市区町村]|丁目|번지|주소|위치)/u.test(text);

  let score = Math.max(0, 20 - relevanceRank * 2);
  score += mapsUrls.length > 0 ? 40 : 0;
  score += locationHits.length * 8;
  score += japanHits.length * 5;
  score += positiveHits.length * 3;
  score += addressLike ? 15 : 0;
  score -= negativeHits.length * 6;
  return score;
}

export function detectCity(text: string) {
  for (const [hint, city] of CITY_HINTS) {
    if (text.toLowerCase().includes(hint.toLowerCase())) return city;
  }
  return undefined;
}

export function detectCategoryTags(text: string) {
  const folded = text.toLowerCase();
  const tags = CATEGORY_HINTS.filter(([hint]) =>
    folded.includes(hint.toLowerCase()),
  ).map(([, tag]) => tag);
  return Array.from(new Set(tags));
}

function findName(lines: string[], title: string) {
  const nameLine = lines.find(
    (line) =>
      !/(google|maps\.app|주소|위치|〒|https?:\/\/|営業時間|영업|예약)/iu.test(line) &&
      line.length <= 80,
  );
  if (nameLine) return nameLine;

  const titleCandidate = title
    .replace(/#\S+/gu, "")
    .replace(/[|｜].*$/u, "")
    .trim();
  return titleCandidate || undefined;
}

function findAddress(lines: string[]) {
  return lines.find((line) =>
    /(?:〒\d{3}-?\d{4}|東京都|大阪府|京都府|福岡|北海道|愛知県|兵庫県|神奈川県|住所|주소|위치|丁目|市|区|町)/u.test(
      line,
    ),
  );
}

function maybeLocalName(name?: string) {
  if (!name) return undefined;
  return /[\u3040-\u30ff\u3400-\u9fff]/u.test(name) ? name : undefined;
}

export function parseOwnerComment(
  commentText: string,
  sourceTitle = "",
): ParsedOwnerComment {
  const allText = `${sourceTitle}\n${commentText}`;
  const mapsUrl = extractGoogleMapsUrls(commentText)[0];
  const lines = linesFromComment(commentText);
  const addressCandidate = findAddress(lines);
  const nameKoOrOriginal = findName(lines, sourceTitle);
  const city = detectCity(allText);
  const categoryTags = detectCategoryTags(allText);
  const positiveSignalHits = findPositiveSignals(allText);
  const negativeSignalHits = findNegativeSignals(allText);
  const japanSignalHits = findJapanSignals(allText);
  const googleMapsQuery = mapsUrl ? extractGoogleMapsQuery(mapsUrl) : undefined;
  const resolvedMapsUrl =
    mapsUrl ??
    (nameKoOrOriginal || addressCandidate
      ? createGoogleMapsSearchUrl([nameKoOrOriginal, addressCandidate, city, "Japan"])
      : undefined);

  let confidenceBoost = 0;
  confidenceBoost += mapsUrl ? 0.2 : 0;
  confidenceBoost += addressCandidate ? 0.14 : 0;
  confidenceBoost += city ? 0.08 : 0;
  confidenceBoost += japanSignalHits.length > 0 ? 0.1 : 0;
  confidenceBoost += positiveSignalHits.length > 0 ? 0.04 : 0;
  confidenceBoost -= negativeSignalHits.length > 0 ? 0.2 : 0;

  return {
    nameKoOrOriginal,
    nameLocal: maybeLocalName(nameKoOrOriginal),
    addressCandidate,
    city,
    googleMapsUrl: resolvedMapsUrl,
    googleMapsQuery,
    categoryTags,
    commentKoAuto: "YouTube owner comment candidate에서 자동 추출한 장소입니다.",
    confidenceBoost,
    japanSignalHits,
    positiveSignalHits,
    negativeSignalHits,
  };
}
