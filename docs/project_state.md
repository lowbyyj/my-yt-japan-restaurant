# Project State

- Project display name: 탐닉 일본 맛집 지도
- Operator identity: `dr.lowb`
- Current task: `M2.5 location resolution batch 2`
- Repo name: `my-yt-japan-restaurant`
- Repo URL: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Starting commit before M2: `bf0112e7b3a3357fd5235ed7cca2a9f231e78dd7`
- M2.4 starting commit: `bcf6dda19686d2a996cb904d1f28a8f6b4392440`
- M2.5 starting commit: `53f972db9ab08419c572daab926d7c67aa79341f`
- Vite base path: `/my-yt-japan-restaurant/`
- Future project URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`

## Data State

- Manual curation: forbidden.
- Real data source: automated `@space_tamnik` Shorts owner comment candidate extraction only.
- Agent-assisted resolutions: allowed only when tied to an automated candidate and backed by public/free evidence in `data/location_resolutions.json`.
- `YOUTUBE_API_KEY` available on Linux during M2.5: yes, value not printed.
- `data:all` ran during M2.5: yes.
- Public published count: `19`.
- Raw API dumps committed: no.
- Cache/raw paths committed: no.

## M2.5 Counts

- Videos scanned: `100`
- Likely Shorts: `100`
- Owner comment candidates: `100`
- Japan candidates: `80`
- Automated geocoded: `1`
- Agent-assisted resolved total: `18`
- Batch 2 newly resolved: `11`
- Published: `19`
- Excluded negative signal: `1`
- Held back total: `80`
- Held back low confidence: `0`
- Held back missing geocode: `78`
- Held back non-Japan: `20`
- Public-safe holdback breakdown:
  - `google_maps_search_query_only`: `77`
  - `maps_short_url_unresolved`: `1`

## M2.4 Resolved Places

- `ピノキオ` — Mapion public phonebook coordinates, OSM cross-check.
- `きつねや` — Mapion public phonebook coordinates, OSM/Tabelog cross-check.
- `ヘッケルン` — Mapion public phonebook coordinates, Tabelog cross-check.
- `めん馬鹿一代` — Mapion public phonebook coordinates, OSM/Tabelog cross-check.
- `とんかつ 成蔵` — Mapion public phonebook coordinates, Tabelog map cross-check.
- `丸亀製麺 京都市役所前店` — Mapion public phonebook coordinates.
- `先斗町焼肉 きらく` — generated bracket match plus Mapion public phonebook coordinates and Tabelog map cross-check.

## M2.5 Batch 2 Resolved Places

- `CORDUROY cafe` — Tabelog public coordinates, OSM/Nominatim cross-check.
- `まほろば囲炉裏 心斎橋` — official site address, Tabelog public coordinates.
- `MENSHO District` — Tabelog public coordinates.
- `とんかつ 丸七 銀座店` — Tabelog public map/detail coordinates.
- `中華そば 辻` — Tabelog public coordinates, OSM/Nominatim cross-check.
- `麺屋 さくら井` — Tabelog public coordinates, OSM/Nominatim cross-check.
- `石村萬盛堂 本店` — generated main-store match, Tabelog public map/detail coordinates.
- `2050 Coffee` — Tabelog public coordinates, OSM/Nominatim cross-check.
- `おいしい氷屋 天神南店` — generated branch match, Tabelog public coordinates.
- `まるもち家 伏見稲荷本店` — generated main-store match, Tabelog public coordinates.
- `炭焼きうなぎの魚伊 本店` — Tabelog public coordinates, OSM/Nominatim cross-check.

## Verification

- `npm ci`: passed.
- `npm run data:doctor`: passed.
- `npm run data:all`: passed, published `19`.
- `npm run validate:data`: passed, published `19`.
- `npm run test`: passed, 5 files / 36 tests.
- `npm run build`: passed.
- Local preview: passed, `200 OK`; preview public places count `19`, Hermes-resolved count `18`.

## Current Blocker

- Most remaining Japan candidates still only have generated Google Maps search URLs without embedded coordinates.
- Ambiguous, chain/branch-unclear, or insufficiently evidenced candidates were skipped instead of being forced onto the map.
- Future unlocks need either more reliable public source discovery or improved extraction from owner comments, without asking dr.lowb to manually curate restaurant rows.

## Hermes Next Task

Hermes should continue in the same Telegram manager session, not `/new`, and switch with `[작업 전환: my-yt-japan-restaurant]`. First pull and verify. Keep `data/location_resolutions.json` public-safe and do not commit raw/cache/secret files.
