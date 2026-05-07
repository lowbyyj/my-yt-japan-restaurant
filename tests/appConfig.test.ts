import { describe, expect, it } from "vitest";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "../src/mapConfig.js";

describe("initial map view", () => {
  it("starts around Tokyo without hiding other cities", () => {
    expect(DEFAULT_CENTER).toEqual([35.681236, 139.767125]);
    expect(DEFAULT_ZOOM).toBeGreaterThanOrEqual(10);
    expect(DEFAULT_ZOOM).toBeLessThanOrEqual(12);
  });
});
