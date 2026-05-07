# Milestones

## M0

Repo, app skeleton, Leaflet map UI, empty data state, static JSON loading, basic filters.

## M1

Automated YouTube owner-comment candidate ingestion.

## M2

Automated extraction, negative-signal filtering, geocoding, and public places build.

## M2.4

Agent-assisted public/free evidence resolution bridge through `data/location_resolutions.json`.

## M2.5

Second public-safe location resolution batch, raising published markers to 19.

## M3

First public GitHub Pages deployment at `https://lowbyyj.github.io/my-yt-japan-restaurant/` using the `gh-pages` branch fallback.

## M3.1

Public UX hotfix: coordinate-based Google Maps links, user-facing card copy, internal desktop list scroll, and improved basemap.

## M3.2

Enrichment and map-list focus sync:

- Adds `data/place_enrichments.json` for public-safe Korean display copy.
- Adds optional enrichment schema/type/UI fields: `placeTypeKo`, `signatureKo`, `whyKo`, `displayDescriptionKo`.
- Syncs marker selection to the left card list with internal auto-scroll/focus.
- Expands scan scope to `MAX_VIDEOS=300` and adds 8 vetted batch-3 location resolutions.
- Publishes 26 public-evidence-backed markers while holding back unsafe Google Maps URL-only and broad city-only geocode candidates.

## M3.3

Bulk marker expansion:

- Reuses the `MAX_VIDEOS=300` candidate pool.
- Screens address-bearing unresolved Japan owner-comment candidates in bulk.
- Adds 50 GSI-backed public/free location resolutions and matching enrichments.
- Publishes 75 total markers while keeping Google Maps search-only and ambiguous candidates held back.

## M3.4

Content cleanup and bulk marker expansion:

- Removes internal provenance/coordinate wording from public card descriptions.
- Simplifies the genre filter to `전체`, `밥`, `디저트`, `술`.
- Starts the map around Tokyo while keeping all cities visible by pan/zoom.
- Adds a 90-record GSI-backed resolution/enrichment batch from existing `@space_tamnik` candidates.
- Publishes 158 enriched markers.

## M4

Optional next step: add link from the separate `lowbyyj.github.io` homepage repo, only when explicitly requested.

## M5

Further data discovery: add more public/free evidence resolvers for held-back candidates without paid APIs or manual production records.

## M6

UX polish and filter improvements.

## M7

Data refresh automation.
