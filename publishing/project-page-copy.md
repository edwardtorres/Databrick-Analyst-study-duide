# Databricks Study

**Category:** DATABRICKS · LEARNING TOOL

A game-style study app for the Databricks Certified Data Analyst Associate exam. Learn through short lessons, experiment with SQL on a retail dataset, explore interactive labs, and test your preparation in a timed Boss Battle.

**Technology line:** React · JavaScript · Vite · Tailwind CSS · SQL.js

## Project snapshot

**Study, experiment, review, and practice under exam conditions**

- Type: Interactive certification study app
- Status: Prepared for publication; browser-local progress
- Technologies: React 19, JavaScript, Vite, Tailwind CSS, SQL.js, Playwright
- 9 chapters covering every exam section
- 252 original questions with explanations for every answer
- 39 SQL challenges on a deliberately messy retail dataset
- 15 interactive labs for catalog navigation, ingestion, joins, dashboards, Genie, modeling, and permissions
- XP, daily goals, streaks, and spaced repetition
- 45-question, 90-minute mock exam weighted by the official exam sections
- Progress export/import for moving a save between browsers

## Technical details

The app runs entirely in the browser. SQL.js provides a SQLite engine with selected Databricks-style SQL adaptations. Chapter content, labs, and SQL practice are split into separate downloads. Progress files are validated before import, and the app warns when the browser cannot save progress. Hash routing and relative asset paths support hosting under a subfolder on edwardtorres.dev without special route rewrites.

## Progress & limitations

Progress stays in each browser and does not automatically sync across devices. Export a backup before clearing site storage or moving devices. The SQL sandbox and labs are learning simulations; they do not connect to a Databricks workspace or reproduce every Databricks SQL behavior. This is independent practice material, and an 80% mock-exam target is an app study target, not an official passing score. The app targets the October 30, 2025 exam guide; recheck official sources before taking the exam. Full offline support is not implemented.

## Publishing handoff

- Suggested app path: `/databricks/` (proposed; not published)
- Suggested project page: `/projects/databricks-study.html`
- Card snippet: `work-card.html`, using the exact classes observed on the existing AZ-900 card
- Cover: `lakehouse-quest-home.jpg`
- Additional screenshot: `lakehouse-quest-chapters.jpg`
- Add the card near AZ-900 Study, then update neighboring Previous/Next project links if the site uses them.
- Preserve the guide's distinction from Databricks-owned material and its local-progress/SQLite limitations.
