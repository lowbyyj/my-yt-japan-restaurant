# Mobile Handoff Summary

- Repo: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Latest commit: see the M2 final report after push.
- Display site: 탐닉 일본 맛집 지도
- Vite base path: `/my-yt-japan-restaurant/`

## What Happened In M2

- Windows Codex saw `YOUTUBE_API_KEY` without printing it.
- No-key checks passed.
- First real automated `@space_tamnik` ingestion ran with `MAX_VIDEOS=50`.
- Sanitized public data was generated.
- Published count: `1`.
- Held back count: `49`.

## Counts

- Videos scanned: `50`
- Likely Shorts: `50`
- Owner comment candidates: `50`
- Japan candidates: `38`
- Geocoded: `1`
- Published: `1`
- Excluded negative signal: `0`
- Held back missing geocode: `37`
- Held back non-Japan: `12`

## Hermes First Commands

```bash
git status
git pull --ff-only
npm ci
npm run data:doctor
npm run data:dry-run
npm run validate:data
npm run test
npm run build
```

## Do Not Do

- Do not use `/new` by default.
- Do not fabricate data.
- Do not ask dr.lowb for manual restaurant curation.
- Do not commit raw API dumps, caches, `.env`, tokens, `node_modules`, `dist`, or logs.
- Do not rerun `npm run data:all` unless dr.lowb explicitly asks for a refresh and `YOUTUBE_API_KEY` is available.

## Next Recommended Task

Hermes should pull the Windows M2 commit, verify the app/data state, and report whether Linux has `YOUTUBE_API_KEY` available for a future explicit refresh.
