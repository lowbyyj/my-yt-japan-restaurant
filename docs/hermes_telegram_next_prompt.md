# Telegram Message To Hermes

Hermes, clone or pull `lowbyyj/space-tamnik-japan-map`.

Work on `main` unless Dr. Low says otherwise.

Run:

```bash
git status
git pull --ff-only
```

Stop immediately if there are conflicts or unexpected uncommitted changes.

Check whether `YOUTUBE_API_KEY` is available on Linux. If it is available, run:

```bash
npm ci
npm run data:all
npm run test
npm run build
```

If successful, commit and push only generated sanitized public data such as `public/data/places.json` and `public/data/data_status.json`. Do not commit `.env`, API keys, raw API dumps, cache files, `node_modules`, `dist`, logs, or full comment dumps.

If `YOUTUBE_API_KEY` is not available, do not fabricate data and do not manually enter shops. Just report that the env var is missing.

Report back in Telegram:

- videos scanned
- likely Shorts
- owner comment candidates found
- Japan candidates
- geocoded
- published
- excluded for negative signals
- held back due to geocode/low confidence
- commit hash
