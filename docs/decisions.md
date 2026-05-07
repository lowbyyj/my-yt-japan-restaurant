# Decisions

## Static-Only Architecture

Use Vite, React, TypeScript, Leaflet, and static JSON. This keeps hosting compatible with GitHub Pages and avoids backend/database operations.

## Owner Comment Candidate Language

The YouTube Data API path implemented here does not guarantee pinned-comment detection. The project uses owner-authored top-level comments ranked by relevance/time and location patterns, and labels them `owner_location_comment_candidate`.

## No Google Maps API

Google Maps is only used as outbound links and URL-coordinate parsing. The site does not use Google Maps JavaScript API or Google Places API.

## Nominatim Limits

Nominatim is only a fallback for small, cached, respectful one-time geocoding. No autocomplete, bulk POI scraping, or concurrent geocode workers.

## No Manual Real Data

Manual production restaurant data is forbidden. Synthetic tests are allowed only when clearly fake.

## Hermes Session Model

Hermes should keep the same Telegram DM as the manager/director session and switch work with `[작업 전환: <task-name>]`. Do not use `/new` by default. Separate implementation context by repo, folder, branch, worktree, or process.

## No-Key Readiness

The project includes `npm run data:doctor` and `npm run data:dry-run` so agents can verify pipeline readiness without a YouTube API key, without network calls, and without fabricating public restaurant data.

## Agent-Assisted Public Evidence Bridge

For M2.4, Hermes may resolve a small number of already-generated Japan candidates using public/free evidence, recorded in `data/location_resolutions.json`. This is not manual production curation: rows must be anchored to automated YouTube owner-comment candidates and must include public evidence URLs, coordinate source notes, and a confidence value. Ambiguous branches or candidates with only Google Maps redirect coordinates remain held back.
