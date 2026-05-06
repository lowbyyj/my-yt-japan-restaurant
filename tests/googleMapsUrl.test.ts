import { describe, expect, it } from "vitest";
import {
  extractGoogleMapsQuery,
  extractGoogleMapsUrls,
  parseCoordinatesFromGoogleMapsUrl,
} from "../scripts/utils/googleMapsUrl.js";

describe("Google Maps URL parsing", () => {
  it("parses /@lat,lng coordinates", () => {
    expect(
      parseCoordinatesFromGoogleMapsUrl(
        "https://www.google.com/maps/place/Test/@35.681236,139.767125,17z",
      ),
    ).toMatchObject({ lat: 35.681236, lng: 139.767125, source: "/@lat,lng" });
  });

  it("parses !3dLAT!4dLNG coordinates", () => {
    expect(
      parseCoordinatesFromGoogleMapsUrl(
        "https://www.google.com/maps/place/Test/data=!3m1!4b1!4m6!3d34.6937!4d135.5023",
      ),
    ).toMatchObject({ lat: 34.6937, lng: 135.5023, source: "!3d!4d" });
  });

  it("parses query coordinate pairs", () => {
    expect(
      parseCoordinatesFromGoogleMapsUrl(
        "https://www.google.com/maps/search/?api=1&query=33.5902,130.4017",
      ),
    ).toMatchObject({ lat: 33.5902, lng: 130.4017 });
  });

  it("extracts map urls and map place query", () => {
    const text =
      "위치: https://www.google.com/maps/place/%ED%85%8C%EC%8A%A4%ED%8A%B8%EA%B0%80%EA%B2%8C/@35.0,139.0,17z";
    const [url] = extractGoogleMapsUrls(text);
    expect(url).toContain("google.com/maps/place");
    expect(extractGoogleMapsQuery(url)).toBe("테스트가게");
  });
});
