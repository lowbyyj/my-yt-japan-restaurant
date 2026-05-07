import { describe, expect, it } from "vitest";
import { buildNominatimQueries, geocodePlace } from "../scripts/utils/geocode.js";

describe("geocodePlace URL-first behavior", () => {
  it("extracts coordinates and place query from a direct Google Maps URL without network fallback", async () => {
    const result = await geocodePlace(
      {
        name: "Long synthetic collection title that should not be trusted",
        googleMapsUrl:
          "https://www.google.com/maps/place/FAKE_TEST_SHOP_ZETA/@35.6423363,139.6664223,17z",
      },
      {},
      { provider: "none" },
    );

    expect(result).toMatchObject({
      lat: 35.6423363,
      lng: 139.6664223,
      country: "JP",
      googleMapsQuery: "FAKE_TEST_SHOP_ZETA",
    });
  });

  it("builds fallback Nominatim query variants from strongest to broadest", () => {
    expect(
      buildNominatimQueries(
        {
          name: "FAKE_TEST_SHOP_ZETA",
          address: "1-2-3 Fakecho Shibuya-ku Tokyo",
          city: "Tokyo",
        },
        "FAKE_TEST_SHOP_ZETA",
      ),
    ).toEqual([
      "1-2-3 Fakecho Shibuya-ku Tokyo FAKE_TEST_SHOP_ZETA Tokyo Japan",
      "1-2-3 Fakecho Shibuya-ku Tokyo Japan",
      "FAKE_TEST_SHOP_ZETA Tokyo Japan",
      "FAKE_TEST_SHOP_ZETA Japan",
    ]);
  });

  it("deduplicates fallback query variants and keeps Japan suffix", () => {
    expect(
      buildNominatimQueries(
        {
          name: "FAKE_TEST_SHOP_ZETA",
          city: "Tokyo",
        },
        "FAKE_TEST_SHOP_ZETA",
      ),
    ).toEqual(["FAKE_TEST_SHOP_ZETA Tokyo Japan", "FAKE_TEST_SHOP_ZETA Japan"]);
  });
});
