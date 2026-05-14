import { readJsonFile } from "./utils/files.js";
import { dataStatusSchema, publicPlacesSchema } from "./utils/schema.js";

const places = publicPlacesSchema.parse(await readJsonFile("public/data/places.json", []));
const status = dataStatusSchema.parse(
  await readJsonFile("public/data/data_status.json", {
    dataGenerated: false,
    reason: "YOUTUBE_API_KEY not provided",
    generatedAt: null,
    videosScanned: 0,
    likelyShorts: 0,
    ownerCommentCandidates: 0,
    japanCandidates: 0,
    geocoded: 0,
    published: 0,
    excludedNegativeSignal: 0,
    needsGeocode: 0,
    heldBack: 0,
  }),
);

for (const place of places) {
  if (place.country !== "JP") {
    throw new Error(`${place.id}: non-JP place cannot be public`);
  }
}

if (status.published !== places.length) {
  throw new Error(
    `data_status published count ${status.published} does not match places ${places.length}`,
  );
}

console.log(
  JSON.stringify(
    {
      valid: true,
      published: places.length,
      dataGenerated: status.dataGenerated,
      reason: status.reason,
    },
    null,
    2,
  ),
);
