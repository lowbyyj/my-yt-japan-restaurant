# Project State

- Project display name: 탐닉 일본 맛집 지도
- Operator identity: `dr.lowb`
- Current task: `M2.3 geocode unlock sprint`
- Repo name: `my-yt-japan-restaurant`
- Repo URL: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Starting commit before M2: `bf0112e7b3a3357fd5235ed7cca2a9f231e78dd7`
- Final commit after M2: see the M2 final report for the exact pushed commit hash.
- Vite base path: `/my-yt-japan-restaurant/`
- Future project URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`

## Data State

- Manual curation: forbidden.
- Real data source: automated `@space_tamnik` Shorts owner comment candidate extraction only.
- `YOUTUBE_API_KEY` visible to Windows Codex during M2: yes, value not printed.
- `data:all` ran during M2: yes.
- Public published count: `1`.
- Raw API dumps committed: no.
- Cache/raw paths committed: no.

## M2.3 Counts

- Videos scanned: `100`
- Likely Shorts: `100`
- Owner comment candidates: `100`
- Japan candidates: `80`
- Geocoded: `1`
- Published: `1`
- Excluded negative signal: `1`
- Held back total: `98`
- Held back low confidence: `0`
- Held back missing geocode: `78`
- Held back non-Japan: `20`
- Public-safe holdback breakdown:
  - `google_maps_search_query_only`: `77`
  - `maps_short_url_unresolved`: `1`

## M2 Counts

- Videos scanned: `50`
- Likely Shorts: `50`
- Owner comment candidates: `50`
- Japan candidates: `38`
- Geocoded: `1`
- Published: `1`
- Excluded negative signal: `0`
- Held back total: `49`
- Held back low confidence: `0`
- Held back missing geocode: `37`
- Held back non-Japan: `12`

## Verification

- `npm install`: up to date
- `npm run data:doctor`: passed
- `npm run data:dry-run`: passed with synthetic fixtures only
- `npm run data:all`: passed
- `npm run validate:data`: passed, published `1`
- `npm run test`: passed, 4 files / 26 tests
- `npm run build`: passed
- Local preview: `http://127.0.0.1:5174/my-yt-japan-restaurant/` returned `200 OK`, and HTTP public places count was `1`

## Current Blocker

- Geocode remains the active blocker after M2.3.
- The dominant public-safe pattern is generated Google Maps search URLs without embedded coordinates (`77` of the `78` Japan missing-geocode holdbacks).
- One additional Japan holdback is a short Google Maps URL that did not resolve to parseable coordinates in the automated resolver.
- Do not manually fix `places.json`; the next unlock needs better automated extraction or an approved geocoding/search provider.

## Hermes Next Task

Hermes should continue in the same Telegram manager session, not `/new`, and switch with `[작업 전환: my-yt-japan-restaurant]`. First pull and verify. Re-run real ingestion only if `YOUTUBE_API_KEY` is available on Linux and dr.lowb explicitly asks for a refresh.
