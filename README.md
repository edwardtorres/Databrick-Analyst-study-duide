# Lakehouse Quest 🏰

A game-style study app for the **Databricks Certified Data Analyst Associate** exam (guide version dated Oct 30, 2025, still current as of Oct 2026).
React + Vite + Tailwind, fully client-side. Progress is saved in `localStorage`.

## What's in it

- **9 chapters**, one per exam-guide section. Each chapter has levels (lesson cards → labs → SQL challenges → quiz) and a 12-question chapter test.
- **SQL Arena**: real SQL in the browser (sql.js / SQLite with Databricks-style shims) on a deliberately dirty retail dataset. Write-the-query, fix-the-broken-query, and DDL challenges are graded by comparing your result set with a reference solution.
- **Labs** (15, all tap-based except the Namespace Builder's optional drag): Platform Match, Catalog Explorer (certified tables, managed vs external, tags, lineage), Ingestion Picker, Upload Wizard, Medallion Sorter, Star Schema Builder, Join Visualizer, Set Operations, Time Travel Timeline (VERSION/TIMESTAMP AS OF, RESTORE, VACUUM), Query Profile Detective, Cache Lab, Chart Picker, Dashboard Config, Namespace Builder (Unity Catalog grants), Genie Space Builder.
- **Game mechanics**: XP, levels, daily streak, daily XP goal, per-chapter mastery, Leitner spaced repetition (missed questions come back more often), and the timed **Boss Battle** mock exam (45 Q / 90 min, weighted by the section weights on the official exam page, per-section breakdown).
- Every question explains why the right answer is right and why each wrong answer is wrong. Facts were checked against docs.databricks.com in Oct 2026 (see `FACTCHECK.md`); the two that docs don't settle are still flagged **"Verify in Databricks docs"**. Where products were renamed after the guide, the app uses the exam's name and shows the current one.

**Status: complete.** All 9 chapters are built: 252 questions, 39 SQL challenges and 15 labs. The Boss Battle draws the full 45 questions weighted across every exam section. See `AUDIT.md` for details and the facts to re-verify before the exam.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests: SQL challenges, content integrity, lab logic
npm run test:e2e # Playwright browser tests: dev server + production build (vite preview)
npm run build    # static site in dist/
npm run verify   # all three. Run this before every push.
```

The e2e tests use Playwright's Chromium. A third project, `webkit` (Safari's engine on an iPhone 13 profile), runs automatically when WebKit is installed. On a Mac, run `npx playwright install webkit` once to enable it; elsewhere it is skipped. On a new machine, install it once with `npx playwright install chromium`. The `dev` project runs against the Vite dev server; the `prod` project builds the app and runs the same suite against `vite preview` (the dev-only crash test is skipped there). Every e2e test fails on any console error unless it opts out with `test.use({ allowConsoleErrors: true })`.

## Deploy (static hosting on a subdomain)

`npm run build` and upload the `dist/` folder to any static host (Netlify, Cloudflare Pages, GitHub Pages, S3 + CloudFront, nginx…).

- Asset paths are relative (`base: './'`) and routing is hash-based (`#/chapter/4`), so no server rewrite rules are needed and it works at a subdomain root or in a sub-folder.
- The SQL engine's `.wasm` file is bundled into `dist/assets/`. If your host sets MIME types manually, serve `.wasm` as `application/wasm`.

## Adding a chapter

1. Create `src/data/chN/` with `questions.js`, `challenges.js` (optional), and `index.js` (subsections made of `card`, `widget`, `challenge`, and `quiz` blocks). Use `src/data/ch4/` as the template.
2. Set `content: chN` on the chapter in `src/data/chapters.js`.
3. Add the chapter to `tests/content.test.js` and run `npm test`.

The Boss Battle pulls from every built chapter automatically. It runs as a shorter "mini-boss" until the question bank reaches 45.

## Lab interaction rule

**Labs are tap-based.** New labs use taps, selects and checkboxes only. No drag-and-drop, because drag on phones hasn't been confirmed on a real device. The one exception is the Namespace Builder: it keeps its existing drag, and tap-to-place (tap a piece, then tap where it goes) does the same thing.

## Content note

All questions and lessons are original practice material, not official Databricks or third-party exam questions.
