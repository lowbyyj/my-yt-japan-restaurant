# Agent Instructions

- dr.lowb is product director and final tester, not a data-entry operator.
- Do not ask dr.lowb to manually curate restaurant/shop data.
- Do not manually create real production place records.
- All real places must come from the automated YouTube owner-comment candidate pipeline.
- Use `pinnedCommentCandidate` or `ownerLocationCommentCandidate` language unless an official API field proves pinned status.
- Do not commit secrets, `.env`, API keys, tokens, raw API dumps, full comment dumps, caches, `node_modules`, `dist`, logs, or unrelated user data.
- Run tests, data validation, and build before reporting done.
- GitHub is the source of truth.
- When handing off to Hermes/Linux Codex, pull/fetch first and stop on conflicts or unexpected uncommitted changes.
- Work on `main` unless dr.lowb explicitly instructs otherwise.
- Hermes should not use `/new` by default. Keep the same Telegram DM as the manager/director chat and switch tasks with `[작업 전환: <task-name>]`.
- Separate actual coding work by repository, folder, branch, worktree, or process rather than by opening a new Telegram manager session.
