import { describe, expect, it } from "vitest";
import {
  extractGoogleMapsQuery,
  extractGoogleMapsUrls,
  isGoogleMapsRedirectCandidate,
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

  it("parses !2dLNG!3dLAT coordinates", () => {
    expect(
      parseCoordinatesFromGoogleMapsUrl(
        "https://www.google.com/maps/place/Fake/data=!4m6!3m5!1s0x0:0x0!8m2!2d135.5023!3d34.6937",
      ),
    ).toMatchObject({ lat: 34.6937, lng: 135.5023, source: "!2d!3d" });
  });

  it("parses supported query coordinate pairs", () => {
    for (const key of ["query", "q", "ll", "center", "destination"]) {
      expect(
        parseCoordinatesFromGoogleMapsUrl(
          `https://www.google.com/maps/search/?api=1&${key}=33.5902,130.4017`,
        ),
      ).toMatchObject({ lat: 33.5902, lng: 130.4017 });
    }
  });

  it("preserves shortened maps.app.goo.gl links and marks them as redirect candidates", () => {
    const [url] = extractGoogleMapsUrls("map https://maps.app.goo.gl/fakeShortLink");

    expect(url).toBe("https://maps.app.goo.gl/fakeShortLink");
    expect(isGoogleMapsRedirectCandidate(url)).toBe(true);
    expect(parseCoordinatesFromGoogleMapsUrl(url)).toBeUndefined();
  });

  it("marks coordinate-less Google Maps search/place URLs as redirect candidates", () => {
    expect(
      isGoogleMapsRedirectCandidate(
        "https://www.google.com/maps/search/?api=1&query=FAKE_TEST_SHOP_ALPHA+Tokyo+Japan",
      ),
    ).toBe(true);
    expect(
      isGoogleMapsRedirectCandidate("https://www.google.com/maps/place/FAKE_TEST_SHOP_ALPHA"),
    ).toBe(true);
  });

  it("does not mark already parseable coordinate URLs as redirect candidates", () => {
    expect(
      isGoogleMapsRedirectCandidate(
        "https://www.google.com/maps/place/Fake/@35.0,139.0,17z",
      ),
    ).toBe(false);
  });

  it("extracts map urls and map place query", () => {
    const text =
      "위치: https://www.google.com/maps/place/FAKE_TEST_SHOP_ALPHA/@35.0,139.0,17z";
    const [url] = extractGoogleMapsUrls(text);
    expect(url).toContain("google.com/maps/place");
    expect(extractGoogleMapsQuery(url)).toBe("FAKE_TEST_SHOP_ALPHA");
  });
});
