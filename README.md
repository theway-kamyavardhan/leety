# DSA Grind Tracker

A static, local-first single-page app for tracking LeetCode/DSA progress, Striver/NeetCode sheets, spaced revision, weekly contests, hackathons, LeetCode stats, job applications, referrals, mock interviews, and weekly execution planning.

## Run Locally

Open `index.html` directly in a browser, or use the included zero-dependency static server:

```bash
npm start
```

The app will be available at `http://127.0.0.1:4173`.

All tracker data is stored in browser `localStorage`. Use **Export All Data** and **Import All Data** inside the app for backups.

## Deploy to Vercel

Option 1: Drag and drop this folder into Vercel.

Option 2: Push the folder to GitHub, import it in Vercel, and deploy with the default static settings.

Vercel settings:

- Framework preset: **Other**
- Build command: leave empty
- Output directory: `.`
- Environment variable: `OPENROUTER_API_KEY=your_fresh_openrouter_key`
- Optional environment variable: `OPENROUTER_MODEL=openrouter/auto`

`vercel.json` rewrites all routes to `index.html` so refreshes work for the SPA.

The AI Coach uses `/api/ai-coach`, a Vercel serverless function, so your OpenRouter key is not shipped inside `index.html`.

## Premium Deployment Checklist

- Replace demo/mock hackathon refresh with a small backend proxy before public launch.
- Keep using Export/Import for user backups because localStorage is browser-specific.
- For a commercial version, compile Tailwind instead of using the CDN so only used classes ship.
- Add custom icons to `manifest.webmanifest` if you want installable PWA branding.

## Notes

- Charts use Chart.js from a CDN.
- Styling uses Tailwind CSS from a CDN.
- Icons use Font Awesome 6 Free from a CDN.
- LeetCode stats use `https://leetcode-stats-api.herokuapp.com/{username}` and may fail if the public proxy is unavailable.
- Hackathon discovery includes realistic mock data and attempts Devpost RSS through a CORS helper. A production version should use a backend proxy for Devpost, Devfolio, and Unstop.
- The Planner tab turns the full prep strategy into a weekly checklist, monthly review, referral tracker, mock interview log, and health load check.
- The AI Coach tab calls OpenRouter through `/api/ai-coach` when `OPENROUTER_API_KEY` is configured. A local browser key is still available as an optional dev fallback, but production should use the Vercel environment variable.
- The Sheets tab includes a built-in high-priority starter integration for NeetCode 150 and Striver SDE Sheet, with links back to the official/canonical sheet pages for the full lists.
