# M3.2 Data and Enrichment Manifest

This repo does not use binary asset packs for the restaurant map. M3.2's “asset” equivalent is the generated public data and public-safe enrichment layer used by the static UI.

## Generated / Tracked Public-Safe Inputs

- `data/location_resolutions.json`
  - Purpose: vetted public/free evidence coordinates for generated YouTube owner-comment candidates.
  - Total records after M3.2: `26`.
  - Generation mode: mixed automated candidate pipeline + Hermes public/free evidence resolution.
  - External copyright assets: none.

- `data/place_enrichments.json`
  - Purpose: public-safe Korean display copy for published places.
  - Total records after M3.2: `26`.
  - Fields: `placeTypeKo`, `signatureKo`, `whyKo`, `displayDescriptionKo`.
  - Generation mode: Hermes-authored summaries from public-safe candidate context and public evidence, not raw comment dumps.
  - External copyright assets: none.

## Generated Public Outputs

- `public/data/places.json`
  - Purpose: sanitized public dataset used by the Leaflet/React app.
  - Published places after M3.2: `26`.
  - Direct editing policy: do not edit directly to add production records; regenerate via `npm run build:data`.

- `public/data/data_status.json`
  - Purpose: public-safe aggregate status counters.
  - M3.2 scan scope: `MAX_VIDEOS=300`.
  - Published places: `26`.

## Batch 3 Newly Resolved Places

- `銀座はるちゃんラーメン`
- `#Hirokiya Roppongi`
- `うなぎ 串料理 いづも ルクア`
- `ramen hisui`
- `喫茶サテラ`
- `Shinjuku Ushimitsu`
- `肉匠なか田 本店`
- `IDATEN`

## Safety Notes

- No Google Places API or Google Maps JavaScript API was added.
- Google Maps links remain outbound coordinate-based links only.
- Google Maps URL-parsed coordinates and broad city-only geocodes are not accepted as standalone publish evidence.
- Raw API dumps, raw comments, cache files, secrets, `node_modules`, `dist`, and logs must not be committed.
