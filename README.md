# GDScript Cookbook

Static site + feedback API, deployed on Vercel.

- `public/assets/data.js` – all recipes, setup guides, common mistakes (edit this to add recipes)
- `public/assets/engine.js` – previews, sliders, page rendering
- `build.mjs` – generates every page, sitemap.xml and robots.txt at build time
- `api/feedback.js` – stores feedback in Vercel Blob (private); inbox at `/admin/`

Vercel settings: Build command `node build.mjs`, output directory `public`.
Env vars: `ADMIN_KEY`, `SITE`, `BLOB_READ_WRITE_TOKEN` (added automatically by the Blob store).
