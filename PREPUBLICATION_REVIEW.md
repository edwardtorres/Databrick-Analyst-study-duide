# Lakehouse Quest: review before publication

Reviewed October 5, 2026. Website: https://edwardtorres.dev/

The app is suitable for preparing a static-site release after the fixes below. The release build and Works-card draft are prepared locally. The live website has not been modified.

## Scope and content

Reviewed application structure, persistence, import validation, routing, SQL grading, mock-exam timing, accessibility basics, metadata, existing content tests, and the previous audit/fact-check records. Inspected the live Works gallery and AZ-900 project page to match their presentation. This was not a fresh line-by-line factual audit of all 252 questions or a complete assistive-technology audit.

The official [exam page](https://www.databricks.com/learn/certification/data-analyst-associate) still lists 45 scored multiple-choice questions, 90 minutes, and the section weights used by the app: 11/8/5/20/15/16/12/5/8 percent. Its linked [exam guide](https://www.databricks.com/sites/default/files/2025-10/databricks-certified-data-analyst-associate-oct-2025.pdf) is dated October 30, 2025. The nine chapters align with the nine sections. Automated content checks validate the question/explanation and challenge inventory.

## Fixed findings

| Finding | Improvement |
| --- | --- |
| SQL grading sorted the values inside every row, accepting inconsistent column swaps and confusing NULL with text `null`. | Accept reordered columns only when one consistent mapping preserves all row relationships and ordering requirements. |
| SQL syntax requirements could be satisfied by keywords in comments or quoted text. | Check executable SQL with comments, literals, and quoted identifiers masked. |
| The initial app bundle included SQL-related code even for visitors opening Home. | Load lesson, sandbox, and challenge pages on demand, isolating SQL code from the home-page download. |
| Browser storage failures were silently ignored. | Show a persistent warning with a link to export a backup, retaining current progress in memory. |
| Imported active exams accepted malformed question IDs, indexes, flags, and answer values. | Validate the active-exam shape and supply navigation defaults for older saves. Handle unavailable answer options without crashing. |
| An answer could be accepted after the deadline but before the next timer tick. | Check the deadline when updating an active exam and submit the existing answers when time is up. |
| Basic keyboard and motion preferences needed attention. | Add a working skip link, visible focus outlines, current-page navigation semantics, a home-page heading, and reduced-motion styles. |
| Publication metadata and official-source access were sparse. | Add descriptive title/social metadata, a JavaScript-disabled message, and direct links to the official exam page and guide. |
| Fact-check summary arithmetic was wrong. | Correct “159 resolved” to 160: 103 confirmed + 57 fixed. |

## Loading improvement

| Main JavaScript bundle | Before | After |
| --- | --- | --- |
| Uncompressed | 359.37 kB | 284.94 kB |
| Gzip | 114.60 kB | 88.51 kB |

The main bundle is about 21% smaller, or 23% smaller after gzip. This is a bundle-size measurement, not a measured page-load speed improvement. Chapter content still loads in the background because Home, Review, and the mock exam use the complete inventory. SQL's 658 kB WebAssembly file loads when SQL is used; it was already deferred before this review.

## Verification

- 153 unit tests passed, including all reference SQL solutions and new grading/import regressions.
- 77 browser tests passed across development and production builds in Chromium with a Pixel 7 viewport; 2 environment-specific tests were intentionally skipped.
- The browser run used existing local servers to avoid a Windows server-cleanup hang in the normal test harness. See `publishing/browser-checks.json` for the complete report.
- Fixed three pre-existing test timing races by waiting for lab rewards to be saved before asserting them.
- The mock-exam deadline test pauses the clock to verify an answer is rejected even without a countdown tick.
- Production build completed without bundle warnings. Dependency install reported zero known vulnerabilities.
- After the final quoted-identifier grading adjustment, reran the SQL, Chapter 2, and publication browser checks: 17 passed and 1 intentionally skipped.
- Visually inspected Home, Chapters, the existing portfolio, and the new card preview. Saved screenshots in `publishing/`.
- Safari/iPhone and screen-reader checks were not rerun in this review. Previous audit results remain historical evidence only.

## Remaining limitations and useful next improvements

1. **Keep the learning-simulation boundary visible.** SQL runs in SQLite with selected adaptations, and labs are simulations. Some Databricks-specific behavior is simplified. The two official-documentation ambiguities recorded in `FACTCHECK.md` remain flagged.
2. **Move SQL execution to a worker for heavy free-play queries.** SQL currently runs on the main browser thread; a very expensive query can freeze the interface. Worker execution with cancel/reset is a useful subsequent optimization.
3. **Add offline/PWA support if desired.** Unlike the AZ-900 project, this app has no service worker or complete offline cache. Do not label its card as an offline PWA yet.
4. **Improve mock-exam readiness feedback.** The existing readiness message reports section coverage. Trends across recent attempts and links to weak chapters would be more useful, while clearly distinguishing the app's 80% practice target from the real exam's passing score.
5. **Add per-lesson source links and review dates over time.** The existing fact-check record is detailed, but a public learner benefits from sources beside the relevant fact, especially for changing product names and interfaces.
6. **Complete dialog and assistive-technology testing.** Focus trapping/restoration in modal dialogs and VoiceOver/TalkBack behavior warrant a separate accessibility pass.

Progress remains browser-local, with export/import for transfers and backups. Cloud sync is not required to publish this static app. An expired Boss is finalized when its page is opened; the timer does not pause while navigating away.

## Website and Works-card handoff

The actual AZ-900 card uses `gallery-item`, `project-cue`, `project-title`, and `project-tagline`. `publishing/work-card.html` uses those same classes and a real screenshot of Lakehouse Quest.

- Preview: `publishing/work-card-preview.html`
- Card snippet: `publishing/work-card.html`
- Project copy: `publishing/project-page-copy.md`
- Pictures: `publishing/lakehouse-quest-home.jpg` and `publishing/lakehouse-quest-chapters.jpg`
- Suggested app location: `/databricks/`
- Suggested project page: `/projects/databricks-study.html`
- Upload package: `publishing/lakehouse-quest-site.zip` (contents of `dist/`, with `index.html` at the archive root)

Those locations are proposed, not live. Publish `dist/` through the existing website's deployment workflow, create the project page, copy the pictures, and add the gallery card. Update adjacent project navigation and the website sitemap if applicable. Check that `.wasm` is served correctly and that new builds replace the chapter map and assets together. Avoid long-lived caching for `index.html` and `chunk-map.json`; hashed assets can be cached immutably. Set absolute social-image/canonical URLs once the final public path is chosen.
