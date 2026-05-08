# DSA Grind Tracker

A static, local-first single-page app for tracking LeetCode/DSA progress, Striver/NeetCode sheets, spaced revision, weekly contests, hackathons, LeetCode stats, job applications, referrals, mock interviews, and weekly execution planning.

## Run Locally

Install dependencies once, build Tailwind, then run the included zero-dependency static server:

```bash
npm install
npm run build
npm start
```

The app will be available at `http://127.0.0.1:4173`.

All tracker data is stored in browser `localStorage`. Use **Export All Data** and **Import All Data** inside the app for backups.

## Deploy to Vercel

Option 1: Drag and drop this folder into Vercel.

Option 2: Push the folder to GitHub, import it in Vercel, and deploy with the default static settings.

Vercel settings:

- Framework preset: **Other**
- Build command: `npm run build`
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
- AI Coach now supports coach modes: Execution Coach, DSA Mentor, Career Strategist, Monthly Reviewer, and Strict Accountability. It sends tracker summaries, sheet progress, weak topics, due revisions, follow-ups, mock logs, and health load into a structured prompt.
- The Resume tab lets you upload/paste a master resume, paste a job description, generate an AI-tailored ATS-friendly draft, and view a heuristic ATS confidence score with matched/missing keywords. Resume data stays in localStorage unless you export all data.
- The Weekly Plan tab follows the May 8-August 31 schedule, detects the current week in real time, and rolls unsolved previous-week problems into the current carryover queue.
- The FAANG Review tab prioritizes due/flagged revisions and high-frequency patterns before random hard problems.
- Tailwind is compiled during `npm run build`; the app no longer depends on the Tailwind browser CDN.
- Sheet data lives in `data/sheets.json` with source metadata and is validated by `npm run check`. NeetCode is enforced at 150 entries; Striver is ready for a canonical 191-problem export and currently uses a broad verified subset plus metadata.
- Hackathon refresh uses a free Vercel serverless function at `/api/hackathons`. Devpost RSS is fetched server-side; Devfolio/Unstop can be added inside the same function if you later find stable public endpoints or acceptable scraping rules.

## Free Backend Approach on Vercel

You do not need a separate backend. Use Vercel Serverless Functions in the `api/` folder:

- `api/ai-coach.js` hides your OpenRouter key via `OPENROUTER_API_KEY`.
- `api/hackathons.js` fetches Devpost RSS server-side so browser CORS is not a blocker.
- Add more providers by creating or extending files under `api/`.

Free-tier pattern:

1. Keep secrets in Vercel Environment Variables.
2. Use `/api/...` routes for external APIs, RSS feeds, scraping-safe pages, and key-protected AI calls.
3. Keep user data in `localStorage` unless you later need login/sync.
4. If you need a free database later, use Vercel KV/Neon/Supabase free tier, but this app does not require it yet.
