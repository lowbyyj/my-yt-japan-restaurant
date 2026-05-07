# Deployment

The site is deployed as a free static GitHub Pages site from this repository only.

- Public site URL: `https://lowbyyj.github.io/my-yt-japan-restaurant/`
- Hosting: GitHub Pages, free tier
- Build source used in M3: local `npm run build` output pushed to the `gh-pages` branch
- Pages source: `gh-pages` branch, `/` path
- Vite base path: `/my-yt-japan-restaurant/`
- Personal homepage repo `lowbyyj.github.io`: not modified by M3

## Build Setting

`vite.config.ts` uses:

```ts
base: "/my-yt-japan-restaurant/"
```

This matches the public URL path:

```text
https://lowbyyj.github.io/my-yt-japan-restaurant/
```

## M3 Deployment Flow

The preferred future deployment flow is GitHub Actions, but the current GitHub OAuth token only has `repo`, `read:org`, and `gist` scopes. GitHub rejected a push that created `.github/workflows/deploy-pages.yml` because the token lacks `workflow` scope.

To complete the free public deployment without blocking M3, Hermes used the GitHub Pages branch-source fallback:

1. Run `npm ci`.
2. Run `npm run validate:data`.
3. Run `npm run test`.
4. Run `npm run build`.
5. Copy `dist/` into a temporary clean repository.
6. Force-push only that static build output to the `gh-pages` branch.
7. Configure GitHub Pages source as `gh-pages` branch `/`.

This keeps the deployment free and does not touch the separate `lowbyyj.github.io` homepage repository.

## Future GitHub Actions Upgrade

When a GitHub token with `workflow` scope is available, M4/M5 can replace the branch-source fallback with an Actions workflow that:

- runs on push to `main` and `workflow_dispatch`;
- grants `contents: read`, `pages: write`, and `id-token: write` permissions;
- runs `npm ci`, `npm run validate:data`, `npm run test`, and `npm run build`;
- uploads `dist/` with `actions/upload-pages-artifact`;
- deploys with `actions/deploy-pages`;
- switches Pages source to GitHub Actions.

## Data and Secret Safety

The deployed app uses sanitized static files under `public/data/`.

Do not commit:

- `.env`
- API keys or tokens
- `data/raw/`
- `data/cache/`
- `node_modules/`
- `dist/`
- logs

`data/location_resolutions.json` is tracked intentionally because it is a public-safe evidence bridge tied to generated YouTube candidates. It must contain public evidence URLs and coordinate-source notes, not secrets or raw comment dumps.

## Verification Commands

Before deploying or reporting done:

```bash
npm ci
npm run validate:data
npm run test
npm run build
```

After deployment, smoke-check:

```bash
curl -I https://lowbyyj.github.io/my-yt-japan-restaurant/
curl -fsS https://lowbyyj.github.io/my-yt-japan-restaurant/data/places.json
```

The current M3 expected published marker count is `19`.

## Next Step

M4 can add a link from the separate personal homepage repository, but M3 intentionally does not modify `lowbyyj.github.io`.
