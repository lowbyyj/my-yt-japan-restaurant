# Hermes Handoff

## Repository

- URL: `https://github.com/lowbyyj/space-tamnik-japan-map`
- Branch: `main`
- Latest commit hash: `TO_BE_FILLED_AFTER_COMMIT`

## Local Setup

```bash
git clone https://github.com/lowbyyj/space-tamnik-japan-map.git
cd space-tamnik-japan-map
npm ci
```

If the repo already exists locally:

```bash
git status
git pull --ff-only
```

Stop on conflicts or unexpected uncommitted changes.

## Environment Variables

```bash
export YOUTUBE_API_KEY="..."
export YOUTUBE_CHANNEL_HANDLE="@space_tamnik"
export MAX_VIDEOS="100"
export GEOCODE_PROVIDER="nominatim"
```

## Commands

```bash
npm run data:all
npm run test
npm run validate:data
npm run build
```

If `YOUTUBE_API_KEY` is missing, do not fabricate data and do not manually enter shops. Report the missing env var.

## Remaining Work

- Run the first real ingestion from Linux/Hermes if `YOUTUBE_API_KEY` is available.
- Review generated count summaries and confidence behavior.
- Commit and push sanitized `public/data/places.json` and `public/data/data_status.json` if successful.
- Later: enable GitHub Pages after repo visibility/deployment policy is finalized.

## Known Limitations

- YouTube API may not expose guaranteed pinned status in this flow.
- The project uses owner comment candidate heuristics.
- Geocoding may fail for ambiguous place names.
- No manual data entry is allowed.
