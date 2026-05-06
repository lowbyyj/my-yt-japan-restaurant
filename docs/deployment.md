# Deployment

This milestone prepares the site for future GitHub Pages deployment but does not modify `lowbyyj.github.io` and does not set up paid hosting.

## Current Build Setting

`vite.config.ts` uses:

```ts
base: "/space-tamnik-japan-map/"
```

This matches the future public URL:

```text
https://lowbyyj.github.io/space-tamnik-japan-map/
```

## Later GitHub Pages Steps

1. Make the repository public when ready.
2. Enable GitHub Pages in repository settings.
3. Choose either GitHub Actions deployment or a static branch strategy.
4. Run `npm ci`, `npm run test`, `npm run validate:data`, and `npm run build` before deploying.

No Google Maps API key, backend server, database, or paid host is required.
