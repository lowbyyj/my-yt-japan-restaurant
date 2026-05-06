# Project Brief

Build a static GitHub Pages-friendly map of Japan restaurants/shops recommended in `@space_tamnik` YouTube Shorts.

The product requirement is automation-first: no manual production restaurant curation. The channel owner usually writes the actual place/shop details in a pinned Shorts comment, but the implemented API path treats this as an owner comment candidate rather than a guaranteed pinned comment.

## Stack

- Vite
- React
- TypeScript
- Leaflet / react-leaflet
- Static JSON in `public/data/`
- Node/TypeScript scripts for ingestion and data generation

## Non-goals

- Backend server
- Database
- Paid hosting
- Google Maps JavaScript API
- Google Places API
- Manual restaurant spreadsheet work
