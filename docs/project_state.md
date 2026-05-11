# Project State

- Project display name: 탐닉 일본 맛집 지도
- Operator identity: `dr.lowb`
- Current task: `M3.5 source-channel marker completion`
- Repo name: `my-yt-japan-restaurant`
- Repo URL: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Starting commit before M2: `bf0112e7b3a3357fd5235ed7cca2a9f231e78dd7`
- M2.5 starting commit: `53f972db9ab08419c572daab926d7c67aa79341f`
- M3 starting commit: `084fbd5309f969f2ff7f8ed0473bbce648881d54`
- M3.1 starting commit: `cccb1a2286e0041487eb928e59047efbad8c95d3`
- M3.2 starting commit: `a161024a2d6fa6ab4456c639b0654fc357b7c248`
- M3.3 starting commit: `c224c202c7425d70a94e450537ecdba522c16d1d`
- M3.4 starting commit: `47b3458a26b61e7202fb28e67b0e2422b4a12aae`
- M3.5 starting commit: `cd283c59a20635ddf2c71aa3af6a5325afb7286c`
- Vite base path: `/my-yt-japan-restaurant/`
- Public project URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`
- GitHub Pages hosting: free, `gh-pages` branch deployment from this repo.
- Separate personal homepage repo `lowbyyj.github.io`: not modified in M3/M3.2.

## Data State

- Manual curation: forbidden.
- Real data source: automated `@space_tamnik` Shorts owner comment candidate extraction only.
- Agent-assisted resolutions: allowed only when tied to an automated candidate and backed by public/free evidence in `data/location_resolutions.json`.
- Public enrichment: allowed only as public-safe Korean display copy in `data/place_enrichments.json`; never edit `public/data/places.json` directly to add real records.
- Public published count after M3.5: `250`.
- Published records resolved by public-safe evidence: `250`.
- Automatic geocode-only published records after M3.2: `0`.
- Public enrichment records after M3.5: `277` tracked records; all `250` published places have enrichment and `broadCategoryKo`.
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

## M3 Deployment State

- Repository visibility: changed from private to public for free GitHub Pages deployment.
- Pages source: `gh-pages` branch `/`.
- Deployment workflow: branch-source fallback. A GitHub Actions workflow was attempted but not pushed because the current OAuth token lacks `workflow` scope.
- Deployment trigger: manual local build pushed to `gh-pages` branch. Future Actions deployment needs a GitHub token with `workflow` scope.
- Deployment checks used: `npm ci`, `npm run validate:data`, `npm run test`, `npm run build`, then push static `dist/` output to `gh-pages`.
- Public URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`.
- Hosting/API constraints: no paid hosting, no Google Places API, no Google Maps JavaScript API.

## M3.1 Public UX Hotfix

- Main cards now show user-facing one-line descriptions instead of internal extraction/provenance wording.
- Primary Google Maps links are coordinate-based from published `lat`/`lng`; directions links use coordinate destinations.
- Left place list uses internal scrolling on desktop so the page does not become a very long document.
- Map basemap defaults to CARTO Voyager, with Positron and OSM style selector fallback options.
- Card layout emphasizes thumbnail, shop name, city/area, tags, description, and actions: `영상 보기`, `Google Maps에서 보기`, `길찾기`.
- Published marker count remained `19`; no new real places were added in M3.1.

## M3.2 Enrichment and Map-List Focus Sync

- Current milestone: `M3.2 enrich places and sync map list focus`.
- Marker click now syncs the selected place with the left card list and scrolls the internal `.cards` container to the selected card.
- Desktop viewport-fit behavior remains intact: preview smoke kept `document.scrollingElement.scrollTop` at `0` while `.cards.scrollTop` changed.
- `data/place_enrichments.json` adds public-safe Korean copy for all 26 published places using:
  - `placeTypeKo`
  - `signatureKo`
  - `whyKo`
  - `displayDescriptionKo`
- `scripts/build-public-places.ts` applies enrichment at build time and preserves fallback generated descriptions when enrichment is absent.
- `scripts/utils/schema.ts`, `src/types.ts`, `src/placeDisplay.ts`, and tests were updated for the enrichment fields.
- Build-time publish gates now avoid unsafe automatic records when the only coordinate source is Google Maps URL parsing or broad city-only Nominatim style queries.
- Agent-assisted/public-evidence resolutions override unsafe auto-geocode/base candidates during merge/dedupe.
- `MAX_VIDEOS=300` scan produced `298` owner-comment candidates and `237` Japan candidates; only vetted public-evidence records were published.
- Batch 3 added 8 newly resolved places:
  - `銀座はるちゃんラーメン`
  - `#Hirokiya Roppongi`
  - `うなぎ 串料理 いづも ルクア`
  - `ramen hisui`
  - `喫茶サテラ`
  - `Shinjuku Ushimitsu`
  - `肉匠なか田 本店`
  - `IDATEN`
- Published marker count increased from `19` to `26` because one prior automatic-only record is now held back unless backed by public evidence, while 8 vetted batch-3 records were added.
- Current fallback structure: enrichment fields are optional; UI falls back to generated user-facing description logic when enrichment is missing.
- Next recommended step: add more public/free evidence resolvers for held-back candidates, then add a homepage link from the separate `lowbyyj.github.io` repo only when explicitly requested.

## M3.3 Bulk Marker Expansion

- Current milestone: `M3.3 bulk expand map markers`.
- Starting commit: `c224c202c7425d70a94e450537ecdba522c16d1d`.
- Candidate pool: reused the existing `MAX_VIDEOS=300` generated data because it already contained enough unresolved Japan candidates.
- Investigated unresolved Japan candidates with exact owner-comment addresses; `156` address-bearing unique Japan candidates were screened for bulk resolution.
- Japan GSI public address search (`https://msearch.gsi.go.jp/address-search/AddressSearch`) was used as the public/free coordinate source for the bulk pass.
- Added `50` new `data/location_resolutions.json` records tied to generated YouTube owner-comment candidates.
- Added `50` matching `data/place_enrichments.json` records.
- Published markers increased from `26` to `75`; all `75` published places are Hermes/public-evidence resolved and enriched.
- City counts after M3.3: Tokyo `39`, Fukuoka `14`, Osaka `12`, Kyoto `7`, Saitama `1`, Yokohama `1`, Kamakura `1`.
- The +50 resolution batch resulted in +49 published markers because one tracked resolution does not add an extra marker after current build matching/dedupe.
- Skip/holdback policy remains unchanged: branch-unclear chains, product-only entries, broad city-only geocodes, Google Maps search-only candidates, and candidates without public/free coordinate evidence remain held back.
- Next recommended step: M3.4 can add another GSI-backed or Tabelog/Mapion-backed batch, but should first improve duplicate/branch reporting so the number of new resolutions and newly published markers is easier to predict.

## M3.4 Content Cleanup and Bulk Marker Expansion

- Current milestone: `M3.4 clean descriptions and bulk expand places`.
- Starting commit: `47b3458a26b61e7202fb28e67b0e2422b4a12aae`.
- Scope stayed limited to content cleanup, broad genre simplification, Tokyo initial view, and bulk expansion from the existing channel candidate pool.
- No other YouTubers were added and the separate `lowbyyj.github.io` personal homepage repo was not modified.
- Public card descriptions were rewritten to remove internal provenance/coordinate wording such as GSI, Hermes, evidence, confidence, source, and coordinate.
- Added `broadCategoryKo` with only three UI filter values: `밥`, `디저트`, `술`.
- The genre filter UI now shows only `전체`, `밥`, `디저트`, `술`; detailed category tags remain small card chips only.
- Initial map config now starts around Tokyo (`35.681236, 139.767125`, zoom `11`) without hiding non-Tokyo markers.
- Reused `MAX_VIDEOS=300`; no other channel and no `MAX_VIDEOS=500` refresh was needed.
- Added `90` new GSI-backed `data/location_resolutions.json` records and matching enrichment records from generated owner-comment candidates.
- Published markers increased from `75` to `158`.
- Broad category counts after build: `밥 85`, `디저트 60`, `술 13`.
- Description scan after build: `158/158` descriptions present, forbidden wording count `0`.
- Data status after `MAX_VIDEOS=300 npm run data:all`: `ownerCommentCandidates=298`, `japanCandidates=237`, `published=158`, `heldBack=134`.
- Next recommended step: if more markers are needed, add a reusable candidate-to-GSI address conversion helper and duplicate/net-new report before the next bulk pass.

## M3.5 Source-Channel Marker Completion

- Current milestone: `M3.5 source-channel marker completion`.
- Starting commit: `cd283c59a20635ddf2c71aa3af6a5325afb7286c`.
- Scope stayed limited to existing `@space_tamnik` owner-comment candidates; no other YouTubers, no paid Google/Places APIs, no unrelated homepage repo changes, and no UI restructure.
- Candidate scan was expanded from `MAX_VIDEOS=300` to `MAX_VIDEOS=700`; the channel currently yielded `557` likely Shorts and `550` owner-comment candidates.
- `MAX_VIDEOS=500 npm run data:all` timed out at geocoding, so the final pass used `MAX_VIDEOS=700 npm run data:all` after cache/candidate expansion.
- Final data status: `videosScanned=557`, `ownerCommentCandidates=550`, `japanCandidates=471`, `geocoded=17`, `published=250`, `excludedNegativeSignal=20`, `heldBack=280`.
- Added `111` new public/free Tabelog-backed location resolutions/enrichment records tied to automated candidates; total tracked location resolutions/enrichments are `277`/`277`.
- Published markers increased from `158` to `250` (`+92` net published markers).
- Broad category counts after M3.5: `밥 117`, `디저트 108`, `술 25`.
- City counts after M3.5: Tokyo 125, Osaka 48, Fukuoka 35, Kyoto 22, Kamakura 4, Nagoya 4, Kawasaki 3, Yokohama 3, Nara 2, Chiba 1, Saitama 1, Shizuoka 1, Zushi 1.
- Description scan after build/local preview: `250/250` descriptions present, forbidden public wording count `0`.
- Local preview smoke passed: site/data/status HTTP `200`, marker count `250`, Google Maps card links are coordinate-based, genre filter remains exactly `전체`, `밥`, `디저트`, `술`, marker click scrolls the internal `.cards` list while body scroll remains `0`.
- Remaining candidates are held back when branch/name matching is ambiguous, the search result points to a different region/shop, or no public/free coordinate evidence is available.

## Resolved Places

M2.4 resolved places:

- `ピノキオ`
- `きつねや`
- `ヘッケルン`
- `めん馬鹿一代`
- `とんかつ 成蔵`
- `丸亀製麺 京都市役所前店`
- `先斗町焼肉 きらく`

M2.5 batch 2 resolved places:

- `CORDUROY cafe`
- `まほろば囲炉裏 心斎橋`
- `MENSHO District`
- `とんかつ 丸七 銀座店`
- `中華そば 辻`
- `麺屋 さくら井`
- `石村萬盛堂 本店`
- `2050 Coffee`
- `おいしい氷屋 天神南店`
- `まるもち家 伏見稲荷本店`
- `炭焼きうなぎの魚伊 本店`

M3.2 batch 3 resolved places:

- `銀座はるちゃんラーメン`
- `#Hirokiya Roppongi`
- `うなぎ 串料理 いづも ルクア`
- `ramen hisui`
- `喫茶サテラ`
- `Shinjuku Ushimitsu`
- `肉匠なか田 本店`
- `IDATEN`

## Verification

- `npm ci`: passed at M3.2 start.
- `MAX_VIDEOS=300 npm run data:all`: attempted; the full chained command timed out after ingestion/extraction/geocode work, so final public data was rebuilt with staged `build:data` and strict publish gates.
- `npm run build:data && npm run validate:data`: passed, published `26`.
- `npm run validate:data && npm run test && npm run build`: passed.
- M3.3 `MAX_VIDEOS=300 npm run data:all`: passed, published `75`.
- Local preview after M3.2: passed, `200 OK`; preview public places count `26`; marker count `26`; card count `26`; marker click moved `.cards.scrollTop` from `5` to over `6380`; desktop body scroll stayed `0`; selected card was visible.

## Current Blocker

- Remaining Japan candidates still require public/free coordinate evidence before publication.
- Ambiguous, chain/branch-unclear, broad city-only geocode, Google Maps URL-only, or insufficiently evidenced candidates should remain held back.
- GitHub Actions Pages workflow still needs a GitHub token with `workflow` scope; branch-source `gh-pages` deployment remains the working fallback.

## Hermes Next Task

Hermes should continue in the same Telegram manager session, not `/new`, and switch with `[작업 전환: my-yt-japan-restaurant]`. First pull and verify. Keep `data/location_resolutions.json` and `data/place_enrichments.json` public-safe and do not commit raw/cache/secret files.
