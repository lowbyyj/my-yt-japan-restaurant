# Data Pipeline

## No-Network Readiness

`npm run data:doctor`

- Checks local Node/npm/git/data readiness.
- Confirms `YOUTUBE_API_KEY` presence without printing its value.
- Validates `public/data/places.json` and `public/data/data_status.json`.
- Confirms `data/raw` and `data/cache` are ignored by git.
- Confirms the Vite base path is `/my-yt-japan-restaurant/`.
- Does not call YouTube, Nominatim, or any other network service.
- Does not modify public data.

`npm run data:dry-run`

- Uses synthetic fake videos/comments only.
- Exercises owner comment parsing, negative signal exclusion, Japan hint checks, coordinate parsing, and held-back behavior.
- Does not use real `@space_tamnik` data.
- Does not call YouTube or Nominatim.
- Does not write `public/data/places.json`.

`npm run data:all` is the real ingestion path. Run it only when `YOUTUBE_API_KEY` is available through the environment.

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

Raw API dumps, full comment dumps, secrets, and caches must not be committed.

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
