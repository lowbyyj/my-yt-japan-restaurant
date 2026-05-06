# Telegram Message To Hermes

[작업 전환: my-yt-japan-restaurant]

Hermes, keep this same Telegram DM as the manager/director session. Do not use `/new` by default. Switch tasks with `[작업 전환: <task-name>]`, and separate actual coding context by repo, folder, branch, worktree, or process.

Clone or pull:

```bash
git clone https://github.com/lowbyyj/my-yt-japan-restaurant.git
```

Work on `main` unless dr.lowb says otherwise.

If the repo already exists locally, run:

```bash
git status
git pull --ff-only
```

Stop immediately if there are conflicts or unexpected uncommitted local changes.

First run the no-key-safe verification:

```bash
npm ci
npm run data:doctor
npm run data:dry-run
npm run test
npm run validate:data
npm run build
```

Check whether `YOUTUBE_API_KEY` is available on Linux. Do not print the value.

If `YOUTUBE_API_KEY` is available, run:

```bash
npm run data:all
npm run validate:data
npm run test
npm run build
```

Commit and push sanitized generated public data only if `data:all` succeeds. Do not commit `.env`, API keys, raw API responses, raw comment dumps, cache files, `node_modules`, `dist`, logs, or full comment dumps.

If `YOUTUBE_API_KEY` is not available, do not fabricate data and do not manually enter shops. Just report that the env var is missing.

Do not ask dr.lowb for manual restaurant curation.

Report back in Telegram:

- videos scanned
- likely Shorts
- owner comment candidates found
- Japan candidates
- geocoded
- published
- excluded for negative signals
- held back due to geocode/low confidence
- verification command results
- commit hash
