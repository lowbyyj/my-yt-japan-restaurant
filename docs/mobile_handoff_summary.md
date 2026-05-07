# Mobile Handoff Summary

- Repo: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Latest known milestone before M3: `084fbd5309f969f2ff7f8ed0473bbce648881d54`
- Display site: 탐닉 일본 맛집 지도
- Public site URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`
- Vite base path: `/my-yt-japan-restaurant/`
- Published markers after M2.5: `19`
- Hermes-resolved markers after M2.5: `18`

## What Happened Through M3

- M2 generated the first automated public dataset.
- M2.4 added `data/location_resolutions.json` as a public-safe evidence bridge.
- M2.5 expanded published markers from `8` to `19` with 11 additional public/free evidence resolutions.
- M3 deploys the static Vite/React/Leaflet app to free GitHub Pages from this repository.
- The repository was made public for free GitHub Pages deployment.
- GitHub Pages branch-source fallback publishes the built `dist/` output to `gh-pages`.
- The separate personal homepage repository `lowbyyj.github.io` was not modified in M3.

## Current Deployment

- URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`
- Hosting: GitHub Pages, free tier
- Pages source: `gh-pages` branch `/`
- Deployment checks used: `npm ci`, `npm run validate:data`, `npm run test`, `npm run build`
- Future GitHub Actions deployment requires a token with `workflow` scope.
- No backend, database, paid hosting, Google Maps JavaScript API, or Google Places API.

## Hermes First Commands

```bash
git status
git pull --ff-only
npm ci
npm run validate:data
npm run test
npm run build
```

## Do Not Do

- Do not use `/new` by default.
- Do not fabricate data.
- Do not ask dr.lowb for manual restaurant curation.
- Do not commit raw API dumps, caches, `.env`, tokens, `node_modules`, `dist`, or logs.
- Do not use Google Places API or Google Maps scraping for coordinate evidence.
- Do not modify the separate `lowbyyj.github.io` homepage repo unless explicitly instructed.

## Next Recommended Task

M4 should add a link/card from the separate personal homepage repo to the public map URL, after first verifying the M3 Pages deployment is live.
