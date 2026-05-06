# Data Pipeline

## 1. YouTube Ingestion

`npm run ingest:youtube`

- Reads `YOUTUBE_API_KEY`, `YOUTUBE_CHANNEL_HANDLE`, and `MAX_VIDEOS`.
- Resolves the channel through YouTube Data API `channels.list` with `forHandle`.
- Reads the uploads playlist and recent video details.
- Treats videos as likely Shorts when duration is 90 seconds or less, or title metadata indicates Shorts.
- Calls `commentThreads.list` for each likely Short.
- Prefers top-level comments authored by the channel owner.
- Ranks comments by relevance/time order and place/address/map text patterns.
- Stores sanitized owner comment candidate data under `data/generated/`.

Raw API dumps and caches must not be committed.

## 2. Place Extraction

`npm run extract:places`

- Parses the best `ownerLocationCommentCandidate`.
- Extracts name, address, city hint, category hints, Google Maps URL, source video metadata, and confidence.
- Applies positive and negative signal detection.
- Publishes no candidate with negative signals.
- Marks unclear Japan/geocode candidates as `needs_geocode`.

## 3. Geocoding

`npm run geocode:places`

- Parses coordinates from Google Maps URL forms first:
  - `/@lat,lng`
  - `!3dLAT!4dLNG`
  - `query=lat,lng`
- Preserves outbound Google Maps links.
- Uses Nominatim only as small, cached, one-at-a-time fallback with `countrycodes=jp`.
- Caches fallback results in `data/cache/geocode_cache.json`, which is ignored by git.

## 4. Public Build

`npm run build:data`

Writes `public/data/places.json` only for candidates that are:

- `country === "JP"`
- geocoded with `lat` and `lng`
- sourced to a YouTube video/comment
- `verdict === "auto_recommended"`
- free of negative signals
- above the confidence threshold

`public/data/data_status.json` contains aggregate counts, not excluded place details.
