# Agent Instructions

- Dr. Low is product director and final tester, not a data-entry operator.
- Do not ask Dr. Low to manually curate restaurant/shop data.
- Do not manually create real production place records.
- All real places must come from the automated YouTube owner-comment candidate pipeline.
- Use `pinnedCommentCandidate` or `ownerLocationCommentCandidate` language unless an official API field proves pinned status.
- Do not commit secrets, `.env`, API keys, tokens, raw API dumps, full comment dumps, caches, `node_modules`, `dist`, logs, or unrelated user data.
- Run tests, data validation, and build before reporting done.
- GitHub is the source of truth.
- When handing off to Hermes/Linux Codex, pull/fetch first and stop on conflicts or unexpected uncommitted changes.
- Work on `main` unless Dr. Low explicitly instructs otherwise.
