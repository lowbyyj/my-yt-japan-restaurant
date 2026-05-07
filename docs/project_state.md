# Project State

- Project display name: 탐닉 일본 맛집 지도
- Operator identity: `dr.lowb`
- Current task: `M3.1 public UX hotfix`
- Repo name: `my-yt-japan-restaurant`
- Repo URL: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Starting commit before M2: `bf0112e7b3a3357fd5235ed7cca2a9f231e78dd7`
- M2.5 starting commit: `53f972db9ab08419c572daab926d7c67aa79341f`
- M3 starting commit: `084fbd5309f969f2ff7f8ed0473bbce648881d54`
- M3.1 starting commit: `cccb1a2286e0041487eb928e59047efbad8c95d3`
- Vite base path: `/my-yt-japan-restaurant/`
- Public project URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`
- GitHub Pages hosting: free, `gh-pages` branch deployment from this repo.
- Separate personal homepage repo `lowbyyj.github.io`: not modified in M3.

## Data State

- Manual curation: forbidden.
- Real data source: automated `@space_tamnik` Shorts owner comment candidate extraction only.
- Agent-assisted resolutions: allowed only when tied to an automated candidate and backed by public/free evidence in `data/location_resolutions.json`.
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
- Card layout now emphasizes thumbnail, shop name, city/area, tags, description, and clear actions: `영상 보기`, `Google Maps에서 보기`, `길찾기`.
- Published marker count remains `19`; no new real places were added in M3.1.

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

## Verification

- `npm ci`: passed.
- `npm run data:doctor`: passed.
- `npm run data:all`: last data refresh passed in M2.5, published `19`.
- `npm run validate:data`: passed, published `19`.
- `npm run test`: passed, 6 files / 41 tests.
- `npm run build`: passed.
- Local preview after M3.1: passed, `200 OK`; preview public places count `19`; desktop body scroll `0`; left cards list scrolls internally; main card text does not expose internal extraction/provenance wording.

## Current Blocker

- Remaining Japan candidates still require public/free coordinate evidence before publication.
- Ambiguous, chain/branch-unclear, or insufficiently evidenced candidates should remain held back.
- M4 can add a link from the separate `lowbyyj.github.io` homepage repo, but M3 intentionally does not modify it.

## Hermes Next Task

Hermes should continue in the same Telegram manager session, not `/new`, and switch with `[작업 전환: my-yt-japan-restaurant]`. First pull and verify. Keep `data/location_resolutions.json` public-safe and do not commit raw/cache/secret files.
