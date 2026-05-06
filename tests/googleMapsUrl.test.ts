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
        "https://www.google.com/maps/place/Fake/@35.681236,139.767125,17z",
      ),
    ).toMatchObject({ lat: 35.681236, lng: 139.767125, source: "/@lat,lng" });
  });

  it("parses !3dLAT!4dLNG coordinates", () => {
    expect(
      parseCoordinatesFromGoogleMapsUrl(
        "https://www.google.com/maps/place/Fake/data=!3m1!4b1!4m6!3d34.6937!4d135.5023",
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

  it("preserves shortened maps.app.goo.gl links when coordinates are not embedded", () => {
    const [url] = extractGoogleMapsUrls("map https://maps.app.goo.gl/fakeShortLink");

    expect(url).toBe("https://maps.app.goo.gl/fakeShortLink");
    expect(parseCoordinatesFromGoogleMapsUrl(url)).toBeUndefined();
  });

  it("extracts map urls and map place query", () => {
    const text =
      "위치: https://www.google.com/maps/place/FAKE_TEST_SHOP_ALPHA/@35.0,139.0,17z";
    const [url] = extractGoogleMapsUrls(text);
    expect(url).toContain("google.com/maps/place");
    expect(extractGoogleMapsQuery(url)).toBe("FAKE_TEST_SHOP_ALPHA");
  });
});
