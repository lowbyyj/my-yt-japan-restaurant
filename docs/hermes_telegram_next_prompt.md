[작업 전환: my-yt-japan-restaurant]

Hermes, continue in this same Telegram manager session. Do not use `/new` by default. Separate actual coding context by repo, folder, branch, worktree, or process.

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

Stop immediately on conflicts or unexpected uncommitted local changes.

First verify the Windows M2 state:

```bash
npm ci
npm run data:doctor
npm run data:dry-run
npm run validate:data
npm run test
npm run build
```

M2 Windows result to expect:

- videos scanned: 50
- likely Shorts: 50
- owner comment candidates: 50
- Japan candidates: 38
- geocoded: 1
- published: 1
- excluded negative signal: 0
- held back total: 49
- held back missing geocode: 37
- held back non-Japan: 12

Check whether `YOUTUBE_API_KEY` is available on Linux, but do not print the value.

If `YOUTUBE_API_KEY` is available on Linux and dr.lowb explicitly asks for a refresh, run:

```bash
npm run data:all
npm run validate:data
npm run test
npm run build
```

Otherwise do not re-run real ingestion automatically.

Do not fabricate data. Do not ask dr.lowb for manual restaurant curation. Do not commit raw API dumps, raw comment dumps, caches, `.env`, tokens, `node_modules`, `dist`, or logs.

Report back:

- branch
- HEAD commit
- whether it matches or descends from the Windows M2 commit
- verification results
- public published count
- blockers
- next recommended task
