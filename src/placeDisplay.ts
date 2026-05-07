import type { PublicPlace } from "./types.js";

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

function categoryLabel(place: PublicPlace) {
  if (place.placeTypeKo?.trim()) return place.placeTypeKo.trim();

  const text = `${place.sourceVideoTitle} ${place.categoryTags.join(" ")} ${
    place.nameKoOrOriginal
  } ${place.nameLocal ?? ""}`.toLowerCase();

  if (/라멘|ramen|noodle|멘야|麺|中華そば/.test(text)) return "라멘집";
  if (/말차|matcha|디저트|빙수|푸딩|카페|cafe|coffee|dessert|氷|菓子/.test(text)) {
    return "디저트 카페";
  }
  if (/와규|야키니쿠|yakiniku|焼肉|스테이크|오마카세|고기|うしみつ/.test(text)) {
    return "식당";
  }
  if (/스시|초밥|sushi|鮨|寿司/.test(text)) return "스시집";
  if (/돈카츠|とんかつ|tonkatsu|카츠/.test(text)) return "돈카츠 전문점";
  if (/우동|udon|うどん/.test(text)) return "우동집";
  if (/장어|うなぎ|unagi/.test(text)) return "장어 전문점";
  if (/바|bar|칵테일/.test(text)) return "바";
  return "가게";
}

export function buildDisplayDescription(place: PublicPlace) {
  if (place.displayDescriptionKo?.trim()) return place.displayDescriptionKo.trim();

  const city = koreanCity(place.city);
  const category = categoryLabel(place);
  const signature = place.signatureKo?.trim();
  const why = place.whyKo?.trim();

  if (signature && why) return `${city}에서 ${signature}로 소개된 ${category}.`;
  if (signature) return `${city}에서 ${signature}로 소개된 ${category}.`;

  const title = place.sourceVideoTitle.trim();
  if (/에서/.test(title) && /주문|소개|먹/.test(title)) {
    return `${city}에서 소개된 ${category}.`;
  }

  const location = [place.city, place.area].filter(Boolean).join(" / ");
  return `${location || city}에서 소개된 가게.`;
}
