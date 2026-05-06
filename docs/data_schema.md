# Data Schema

## Public Place

Each public record in `public/data/places.json` includes:

- `id`
- `status: "published"`
- `country: "JP"`
- `nameKoOrOriginal`
- `nameLocal`
- `city`
- `area`
- `lat`
- `lng`
- `categoryTags`
- `commentKoAuto`
- `verdict: "auto_recommended"`
- `confidence`
- `negativeSignalHits: []`
- `sourceVideoId`
- `sourceVideoTitle`
- `sourceVideoUrl`
- `thumbnailUrl`
- `sourceCommentId`
- `sourceKind: "owner_location_comment_candidate"`
- `googleMapsUrl`
- `generatedAt`

The public file must not include raw comment dumps, API keys, credentials, unrelated user data, or excluded place details.

## Data Status

`public/data/data_status.json` includes aggregate pipeline state:

- `dataGenerated`
- `reason`
- `generatedAt`
- `channelHandle`
- `videosScanned`
- `likelyShorts`
- `ownerCommentCandidates`
- `japanCandidates`
- `geocoded`
- `published`
- `excludedNegativeSignal`
- `needsGeocode`
- `heldBack`
