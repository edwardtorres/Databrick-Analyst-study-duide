# Lakehouse Quest: Build Audit

**Audit date:** 2026-10-03
**Scope:** commit `8487562`, branch `claude/databricks-exam-study-game-ck55dn`
**Exam guide version targeted:** Oct 30, 2025
**Overall:** the scaffold and Chapter 4 are complete and tested. 8 of 9 chapters and 3 of 6 labs are still to build. One real bug was found: Boss Battle XP can be farmed (see F1). The commit has **not been pushed** to GitHub because access was denied.

---

## 1. Requirements traceability

Legend: ✅ done · 🟡 partial · ⬜ not started

### Exam facts and home screen
| Requirement | Status | Where |
|---|---|---|
| 45 scored MCQ, 90 min, online or test-center proctored | ✅ | `src/data/examInfo.js`, `src/pages/Home.jsx` |
| Guide version Oct 30, 2025 is shown | ✅ | Home → "The exam" card |
| "Re-check the guide 2 weeks before your exam" note | ✅ | Home. If you set an exam date, it calculates the exact re-check date and turns red inside the 2-week window. |

### Chapters (one per exam section)
| # | Chapter | Status |
|---|---|---|
| 1 | Data Intelligence Platform | ⬜ topic list only ("coming soon") |
| 2 | Managing Data | ⬜ topic list only |
| 3 | Importing Data | ⬜ topic list only |
| 4 | Executing Queries with Databricks SQL & SQL Warehouses | ✅ complete (see §2) |
| 5 | Analyzing Queries | ⬜ topic list only |
| 6 | Dashboards & Visualizations | ⬜ topic list only |
| 7 | AI/BI Genie Spaces | ⬜ topic list only |
| 8 | Data Modeling | ⬜ topic list only |
| 9 | Securing Data | ⬜ topic list only |

Every chapter page has lesson cards, subsections you can check off, and an end-of-chapter test. All of this works for Chapter 4. The other chapters will use the same template.

### Interactive elements
| Element | Status | Notes |
|---|---|---|
| SQL Sandbox (in-browser engine, sample dataset with dirty rows, graded challenges) | ✅ | sql.js (SQLite 3.49), 4 tables, 19 challenges graded by comparing result sets |
| Fix-the-broken-query challenges (missing GROUP BY, wrong join, HAVING vs WHERE) | ✅ | 5 fix challenges; see F4 for the GROUP BY caveat |
| Join Visualizer | ✅ | 7 join types (incl. SEMI/ANTI/CROSS), predict-the-row-count game, plus a Set Ops lab |
| Scenario Picker | 🟡 | Built as a question style (`scenario: true`, 15 questions in Ch 4), not a separate mode. Chart-type and ingestion scenarios belong to Chapters 3 and 6. |
| Namespace Builder | ⬜ | Planned for Chapter 9 (placeholder in Labs) |
| Medallion Sorter | ⬜ | Planned for Chapter 8 (placeholder) |
| Genie Space Builder | ⬜ | Planned for Chapter 7 (placeholder) |
| Time Travel Timeline | ✅ | VERSION/TIMESTAMP AS OF, `@v`, RESTORE, DML, VACUUM with retention and the safety check, a 7-day fast-forward, 4 missions |

### Game mechanics
| Requirement | Status | Notes |
|---|---|---|
| XP, levels, daily streak | ✅ | Plus a daily XP goal (60) and level titles |
| Per-chapter mastery meter | ✅ | 60% question mastery + 25% subsections checked + 15% challenges solved (`src/lib/mastery.js`) |
| Missed questions come back more often | ✅ | Leitner boxes 0–5. A missed question returns immediately and gets weight 8; correct answers space it out to 4h, 1d, 3d, 7d, 14d. |
| Boss Battle: 45 Q, 90-min timer, per-section breakdown | 🟡 | The engine is complete, and the timer and answers survive a reload. With 42 questions in the bank, it runs as a 42-question "mini-boss" (84 min). It becomes the full 45/90 automatically once more chapters exist. |
| Every option explains why it is right or wrong | ✅ | Enforced by a test (`tests/content.test.js`) |

### Content rules
| Rule | Status |
|---|---|
| Original, scenario-style questions; nothing copied | ✅ All written for this app |
| Facts that may have changed are flagged "verify in Databricks docs" | ✅ 19 flags (see §3) |

### Tech
| Requirement | Status |
|---|---|
| React + Vite + Tailwind, client-side only, no backend | ✅ React 19, Vite 8, Tailwind 4 |
| Progress saved in localStorage | ✅ Key `lakehouse-quest:v1`, plus export/import in Settings |
| Mobile-friendly | ✅ Designed for a 390px-wide phone screen: bottom nav, tap-to-insert SQL keywords, sticky Continue button |
| Deployable as a static site on a subdomain | ✅ Relative asset paths and hash routing, so no server rewrite rules are needed |

---

## 2. Chapter 4 content inventory

| Level | Lesson cards | Questions (scenario) | SQL challenges | Labs |
|---|---|---|---|---|
| Databricks Assistant | 3 | 3 (0) | 0 | none |
| SQL Warehouses | 3 | 5 (3) | 0 | none |
| Federated Queries | 2 | 3 (2) | 0 | none |
| Views, MVs & Streaming Tables | 3 | 5 (3) | 1 (DDL) | none |
| Aggregations | 3 | 5 (1) | 6 (5 write, 1 fix) | none |
| Joins & Set Operations | 3 | 6 (3) | 6 (4 write, 2 fix) | Join Visualizer, Set Ops |
| Filtering & Sorting | 2 | 4 (0) | 4 (2 write, 2 fix) | none |
| Creating Tables | 3 | 6 (2) | 2 (DDL) | none |
| Delta Time Travel | 2 | 5 (1) | 0 | Time Travel Timeline |
| **Total** | **24** | **42 (15)** | **19** | **3** |

- Every question appears in a level. 15 of the 19 challenges appear in a level. The other 4 are only in the SQL Arena: `c4-sql-avg-region`, `c4-sql-stats`, `c4-sql-orphans`, `c4-sql-union`.
- Thin spots: Assistant, Federation and Time Travel have no SQL challenges because the SQLite engine can't run those features. The Time Travel lab covers that topic hands-on instead.

---

## 3. Facts to re-verify before the exam

These are already flagged in the app. They are the facts most likely to have changed since the Oct 2025 guide.

| Item | What to check |
|---|---|
| Assistant slash commands (`/explain`, `/fix`, `/doc`, `/optimize`) and the "Diagnose error" button | Current command list and names. `/optimize` is the one I am least sure of. |
| SQL warehouse types (Serverless / Pro / Classic) | Which features require Pro or Serverless |
| Lakehouse Federation | Supported sources, `CREATE CONNECTION` option syntax, required warehouse or runtime |
| Materialized views | `SCHEDULE` syntax, incremental refresh support, Lakeflow vs DLT naming |
| `GROUP BY ALL` | Minimum runtime or warehouse version |
| NULL sort order (ASC → NULLS FIRST) and `ILIKE` | Databricks defaults |
| Notebook "Data Profile" | UI location |
| Managed tables | Predictive optimization defaults; DROP/UNDROP retention windows |
| External table prerequisites | Exact privilege names (e.g., `CREATE EXTERNAL TABLE`) |
| `CREATE OR REPLACE` | Whether grants and the table ID survive |
| VACUUM | 7-day default retention; whether predictive optimization runs VACUUM automatically |

**Not flagged, but worth knowing:**
- Error messages in the Time Travel simulator (`[DELTA_TIMESTAMP_GREATER_THAN_COMMIT]`, `[FAILED_READ_FILE]`, etc.) are illustrative, not word-for-word Databricks output.
- The simulator does not show the `VACUUM START` / `VACUUM END` entries that Databricks may record in `DESCRIBE HISTORY`.
- Error class names quoted in SQL hints (`MISSING_AGGREGATION`, `INVALID_WHERE_CONDITION`, `UNRESOLVED_COLUMN`, `TABLE_OR_VIEW_NOT_FOUND`) are correct to my knowledge but not re-verified.
- The passing score is deliberately not stated. The app says "aim for 80%+" and points to the official exam page.
- The Boss spreads questions evenly across built chapters. It does **not** copy the official per-section weighting.

---

## 4. Findings

| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| F1 | **Medium (bug)** | **Boss Battle XP can be farmed.** Starting a Boss and immediately choosing "Submit early" grants the completion bonus (+25 for the mini-boss, +100 for the full one) every time, even with zero answers. `src/pages/Boss.jsx` → `submit()`. | Only pay the bonus if most questions were answered, or only on the first completion per day. |
| F2 | Low | **Importing a malformed progress file can break the app.** Import checks only that `xp` is a number, then merges at the top level. A file with e.g. `boss: {}` would crash the Boss page. `src/pages/Settings.jsx`, `store.jsx` | Validate the shape of nested fields, or deep-merge with `emptyProgress()`. |
| F3 | Low | **The sandbox engine is SQLite, not Databricks SQL.** Known differences: `7/2` returns 3 (Databricks returns 3.5); `LIKE` ignores case (Databricks is case-sensitive); there is no `QUALIFY`, `LEFT SEMI/ANTI JOIN` or time-travel syntax. All of these are listed in the in-app "Sandbox vs real Databricks SQL" note. | Possible future switch to DuckDB-WASM (closer dialect, about 10× larger download). |
| F4 | Low | **The missing-GROUP-BY challenge can't show the real error.** SQLite quietly accepts the broken query instead of failing. The app detects "same output as the broken query" and shows the Databricks error message, but the learner never sees a real error. | Acceptable as is. A lint check for this pattern would make it stricter. |
| F5 | Low | **The DDL syntax check is strict.** `c4-ddl-ctas` requires `AS` directly after the table name, so a CTAS that lists columns first is rejected. | Loosen the regex. |
| F6 | Low | **The Boss timer only acts while the Boss page is open.** If time runs out while you are on another page, the exam auto-submits when you return to Boss. The score is still correct. | Check for expiry in the app shell. |
| F7 | Info | Answer options reshuffle if you reload mid-Boss. Answers are stored by original index, so scoring is unaffected. | Store the option order in the saved Boss state. |
| F8 | Info | XP toasts merge within a 2.2-second window, so one toast can sum gains from two screens. Cosmetic only. | None needed |
| F9 | Info | The progress reducer calls `Date.now()` and `dayKey()`, so it isn't strictly pure. It has no visible effect, even in development mode where React runs reducers twice. | Pass timestamps in through the action payload. |
| F10 | Info | The Time Travel simulator rewrites every row into a new file on any UPDATE/DELETE/INSERT. Real Delta rewrites only the affected files. The teaching point is unaffected. | None needed |
| F11 | Process | **Push to GitHub failed with a 403** because the Claude GitHub App has no access to the repo. The commit exists only locally, plus a backup git bundle in the session scratchpad. | Reconnect GitHub or install the app at https://claude.ai/connect-github, then push. |

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm test` | **30 / 30 pass**: every challenge's reference solution passes; every starter broken query fails; shims work; wrong row order is detected; `mustMatch` rejects DROP + CREATE; each question has exactly one correct answer and an explanation for every option; every quiz ID resolves to a real question |
| `npm run build` | Succeeds. JS 433 kB (138 kB gzip), CSS 50 kB (8 kB gzip), SQL engine `.wasm` 658 kB (326 kB gzip). Total download about 470 kB gzipped. |
| `npm audit` | 0 vulnerabilities |
| Browser test (Chromium, 390×844) | All main pages load with **0 console errors**. Tested: solving a challenge, a wrong attempt showing the custom message, Free-play queries, a level step-through, a join prediction, Time Travel (VACUUM → v1 fails as expected; TIMESTAMP AS OF returns the correct 5 rows), answering a question, starting a Boss, and XP saving to localStorage. |
| Not tested | Real iOS Safari or Android devices, screen readers or keyboard-only navigation, very old browsers (needs WebAssembly), slow networks, a full 42-question Boss run through to timer expiry |

---

## 6. Security and privacy

- No backend and no network calls after load. All data stays in the browser's localStorage.
- No `dangerouslySetInnerHTML`. Lesson text formatting is parsed into React elements, and the content is hard-coded in the source anyway.
- SQL runs in an isolated in-memory SQLite database inside the browser; nothing persists or leaves the device.
- The only data input is the progress-file import (see F2). The worst case is a broken app state, fixed by "Reset all progress".
- No analytics, cookies or third-party scripts. Fonts fall back to system fonts, so nothing is fetched from a CDN.

---

## 7. Recommended next steps

1. Fix GitHub access and push. **Do this first**: the commit lives only in a temporary session container.
2. Fix F1 (XP farming) and F2 (import validation). Both are small.
3. Build Chapter 9 (Securing Data) with the Namespace Builder, then Chapter 8 (Data Modeling) with the Medallion Sorter.
4. Add the chart-type and ingestion-method Scenario Picker sets with Chapters 6 and 3.
5. Two weeks before the exam: work through §3, then update the app's guide version if Databricks has published a newer guide.
