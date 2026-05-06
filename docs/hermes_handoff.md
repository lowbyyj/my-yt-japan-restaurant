# Hermes Handoff

## Repository

- URL: `https://github.com/lowbyyj/my-yt-japan-restaurant`
- Branch: `main`
- Latest commit hash: see `docs/project_state.md` and the latest M2 final handoff report.

## Operator And Session Rules

- Operator identity: `dr.lowb`.
- Korean display/호칭 may remain 박사님.
- dr.lowb is product director and final tester, not a manual data-entry operator.
- Hermes should keep the same Telegram DM as the manager/director session.
- Do not use `/new` by default.
- Switch tasks with `[작업 전환: <task-name>]`.
- Separate actual coding context by repo, folder, branch, worktree, or process.

## Local Setup

```bash
git clone https://github.com/lowbyyj/my-yt-japan-restaurant.git
cd my-yt-japan-restaurant
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

No-key-safe readiness:

```bash
npm run data:doctor
npm run data:dry-run
npm run test
npm run validate:data
npm run build
```

Real ingestion, only when `YOUTUBE_API_KEY` exists:

```bash
npm run data:all
npm run validate:data
npm run test
npm run build
```

If `YOUTUBE_API_KEY` is missing, do not fabricate data and do not manually enter shops. Report the missing env var.

## Remaining Work

- Pull and verify the Windows M2 generated public dataset.
- Windows M2 generated `1` published public place from `50` scanned likely Shorts.
- Do not rerun real ingestion automatically. Run `npm run data:all` only if `YOUTUBE_API_KEY` is available and dr.lowb explicitly asks for a refresh.
- Later: enable GitHub Pages after repo visibility/deployment policy is finalized.

## Known Limitations

- YouTube API may not expose guaranteed pinned status in this flow.
- The project uses owner comment candidate heuristics.
- Geocoding may fail for ambiguous place names.
- No manual data entry is allowed.
