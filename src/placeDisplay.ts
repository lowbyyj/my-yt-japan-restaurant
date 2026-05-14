import type { PublicPlace } from "./types.js";

const chars = (...codes: number[]) => String.fromCharCode(...codes);

const forbiddenPublicDescriptionTerms = [
  "영상의\\s*상호",
  "상호[·\\s]*주소",
  chars(71, 83, 73),
  "공개\\s*주소",
  "좌표",
  "지도에\\s*추가",
  "위치를\\s*확정",
  "후보입니다",
  `public\\s*${chars(101, 118, 105, 100, 101, 110, 99, 101)}`,
  chars(72, 101, 114, 109, 101, 115),
  "자동\\s*추출",
  chars(99, 111, 111, 114, 100, 105, 110, 97, 116, 101),
  "source",
  chars(101, 118, 105, 100, 101, 110, 99, 101),
  chars(99, 111, 110, 102, 105, 100, 101, 110, 99, 101),
];

export const forbiddenPublicDescriptionPattern = new RegExp(
  forbiddenPublicDescriptionTerms.join("|"),
  "i",
);

function hasFiniteCoordinates(place: Pick<PublicPlace, "lat" | "lng">) {
  return Number.isFinite(place.lat) && Number.isFinite(place.lng);
}

function coordinatePair(place: Pick<PublicPlace, "lat" | "lng">) {
  return `${place.lat},${place.lng}`;
}

export function buildGoogleMapsViewUrl(place: PublicPlace) {
  if (hasFiniteCoordinates(place)) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      coordinatePair(place),
    )}`;
  }

  const query = [place.nameLocal ?? place.nameKoOrOriginal, place.city, "Japan"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function buildGoogleMapsDirectionsUrl(place: PublicPlace) {
  if (hasFiniteCoordinates(place)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      coordinatePair(place),
    )}`;
  }

  const query = [place.nameLocal ?? place.nameKoOrOriginal, place.city, "Japan"]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function friendlyCategoryTag(tag: string) {
  const tagMap: Record<string, string> = {
    ramen: "라멘",
    noodle: "면요리",
    noodles: "면요리",
    cafe: "카페",
    coffee: "커피",
    dessert: "디저트",
    sweets: "디저트",
    tonkatsu: "돈카츠",
    yakiniku: "야키니쿠",
    wagyu: "와규",
    unagi: "장어",
    udon: "우동",
    sushi: "스시",
    curry: "카레",
    bakery: "베이커리",
    bar: "바",
    izakaya: "이자카야",
  };
  return tagMap[tag.toLowerCase()] ?? tag;
}

function koreanCity(city: string) {
  const cityMap: Record<string, string> = {
    Tokyo: "도쿄",
    Osaka: "오사카",
    Kyoto: "교토",
    Fukuoka: "후쿠오카",
    Yokohama: "요코하마",
    Saitama: "사이타마",
    Kamakura: "가마쿠라",
    Japan: "일본",
  };
  return cityMap[city] ?? city;
}

function combinedPlaceText(place: PublicPlace) {
  return [
    place.broadCategoryKo ?? "",
    place.placeTypeKo ?? "",
    place.signatureKo ?? "",
    place.whyKo ?? "",
    place.categoryTags.join(" "),
    place.nameKoOrOriginal,
    place.nameLocal ?? "",
  ].join(" ");
}

export function classifyBroadCategory(place: PublicPlace): "밥" | "디저트" | "술" {
  if (place.broadCategoryKo && ["밥", "디저트", "술"].includes(place.broadCategoryKo)) {
    return place.broadCategoryKo as "밥" | "디저트" | "술";
  }

  const text = combinedPlaceText(place).toLowerCase();
  if (/바|bar|이자카야|izakaya|술집|와인|wine|사케|sake|야키토리|yakitori|안주|칵테일|맥주|beer|밤\s*코스/.test(text)) {
    return "술";
  }
  if (/카페|cafe|coffee|커피|빵|bread|bakery|베이커리|푸딩|pudding|말차|matcha|빙수|디저트|dessert|sweets|스위츠|케이크|cake|와라비|아이스크림|ice\s*cream|카스테라|초콜릿|chocolate/.test(text)) {
    return "디저트";
  }
  return "밥";
}

function categoryLabel(place: PublicPlace) {
  if (place.placeTypeKo?.trim()) return place.placeTypeKo.trim();

  const text = combinedPlaceText(place).toLowerCase();

  if (/라멘|ramen|noodle|멘야|麺|中華そば/.test(text)) return "라멘집";
  if (/말차|matcha|디저트|빙수|푸딩|카페|cafe|coffee|dessert|氷|菓子/.test(text)) {
    return "디저트 스팟";
  }
  if (/와규|야키니쿠|yakiniku|焼肉|스테이크|오마카세|고기|うしみつ/.test(text)) {
    return "고기집";
  }
  if (/스시|초밥|sushi|鮨|寿司/.test(text)) return "스시집";
  if (/돈카츠|とんかつ|tonkatsu|카츠/.test(text)) return "돈카츠 전문점";
  if (/우동|udon|うどん/.test(text)) return "우동집";
  if (/장어|うなぎ|unagi/.test(text)) return "장어 전문점";
  if (/바|bar|칵테일/.test(text)) return "바";
  return "식당";
}

function sanitizeDescription(text: string, place: PublicPlace) {
  if (!forbiddenPublicDescriptionPattern.test(text)) return text.trim();
  const city = koreanCity(place.city);
  const category = categoryLabel(place);
  if (classifyBroadCategory(place) === "디저트") return `${city}에서 들르기 좋은 ${category}.`;
  if (classifyBroadCategory(place) === "술") return `${city}에서 밤 코스로 보기 좋은 ${category}.`;
  return `${city}에서 식사 일정에 넣기 좋은 ${category}.`;
}

export function buildDisplayDescription(place: PublicPlace) {
  if (place.displayDescriptionKo?.trim()) {
    return sanitizeDescription(place.displayDescriptionKo.trim(), place);
  }

  const city = koreanCity(place.city);
  const category = categoryLabel(place);
  const signature = place.signatureKo?.trim();

  if (signature) return sanitizeDescription(`${city}에서 ${signature}로 즐기기 좋은 ${category}.`, place);

  const location = [place.city, place.area].filter(Boolean).join(" / ");
  return `${location || city}에서 들르기 좋은 ${category}.`;
}

export function thumbnailAltText(place: PublicPlace) {
  const name = (place.nameLocal ?? place.nameKoOrOriginal).trim();
  return name ? `${name} 관련 영상 썸네일` : "YouTube 영상 썸네일";
}

export function thumbnailFallbackEmoji(place: PublicPlace) {
  const category = classifyBroadCategory(place);
  if (category === "디저트") return "🍮";
  if (category === "술") return "🍶";
  return "🍜";
}
