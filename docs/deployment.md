# Deployment

This milestone prepares the site for future GitHub Pages deployment but does not modify `lowbyyj.github.io` and does not set up paid hosting.

## Current Build Setting

`vite.config.ts` uses:

```ts
base: "/my-yt-japan-restaurant/"
```

This matches the future public URL:

```text
https://lowbyyj.github.io/my-yt-japan-restaurant/
```

## Later GitHub Pages Steps

1. Make the repository public when ready.
2. Enable GitHub Pages in repository settings.
3. Choose either GitHub Actions deployment or a static branch strategy.
4. Run `npm ci`, `npm run test`, `npm run validate:data`, and `npm run build` before deploying.

No Google Maps API key, backend server, database, or paid host is required.

## Operator/Handoff Note

dr.lowb is the product director and final tester. Deployment and data-refresh agents must not ask dr.lowb for manual restaurant curation. Hermes should keep the same Telegram DM and switch tasks with `[작업 전환: <task-name>]` instead of using `/new` by default.
