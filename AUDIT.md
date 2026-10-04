# Lakehouse Quest: Build Audit (v4)

**Audit date:** 2026-10-04
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `de8f7dd`, plus this audit commit
**Exam guide version targeted:** Oct 30, 2025
**Overall:** 4 of 9 chapters are complete (4, 6, 7, 9) and 7 of 8 labs are built. R2, R3 and R4 from v3 are fixed. Browser (e2e) tests are now in the repo and run before every push via `npm run verify`. The main bundle is down from 524 kB to 353 kB. 75 unit tests and 13 e2e tests pass. One new **Medium** finding: a failed chapter download leaves a loading spinner forever (S1).

---

## 0. Changes since audit v3

| Commit | Change |
|---|---|
| `541ef25` | **R2 fixed:** Playwright e2e suite in `tests/e2e/` with `npm run test:e2e`, plus `npm run verify` (unit + e2e + build). A shared fixture fails any test that logs a console error. The Namespace Builder now also saves its current access check, so a prediction survives a reload. |
| `1708afc` | **R4 fixed:** every lab is a lazy chunk (`React.lazy` + `Suspense`) and every chapter's content is a lazy chunk (`import()`), with a small loading state. Main bundle 524 kB → **353 kB** (167 → 112 kB gzip). No Vite size warning. |
| `4219054` | **R3 fixed:** Chapter 7 grew from 18 to **31** questions (13 new, scenario-heavy). The Boss draws 13 of the 31, so no single Boss shows every Genie question. A content test enforces at least 30. |
| `de8f7dd` | **Chapter 6 (Dashboards & Visualizations)** with the **Chart Picker** and **Dashboard Config** labs, both covered by e2e tests |

**`npm run verify` was run before this push:** 75 unit tests passed, 13 e2e tests passed, and the build succeeded.

---

## 1. Requirements traceability

Legend: ✅ done · 🟡 partial · ⬜ not started

### Chapters
| # | Chapter | Status |
|---|---|---|
| 1 | Data Intelligence Platform | ⬜ topic list only |
| 2 | Managing Data | ⬜ topic list only |
| 3 | Importing Data | ⬜ topic list only |
| 4 | Executing Queries with Databricks SQL & SQL Warehouses | ✅ |
| 5 | Analyzing Queries | ⬜ topic list only |
| 6 | Dashboards & Visualizations | ✅ new |
| 7 | AI/BI Genie Spaces | ✅ (grown to 31 questions) |
| 8 | Data Modeling | ⬜ topic list only |
| 9 | Securing Data | ✅ |

### Chapter 6 requirements
| Requirement | Status | Where |
|---|---|---|
| AI/BI dashboards: multi-page layouts, multiple datasets, widgets (visualizations, text, images) | ✅ | Level "AI/BI Dashboards" (3 cards, 6 questions) |
| Visualizations in notebooks and the SQL editor | ✅ | Level "Visualizations & Chart Choice" |
| Query and dashboard parameters (define, configure, test) | ✅ | Level "Parameters" (3 cards incl. parameter vs field filter, 5 questions) |
| Sharing: users and groups, links/external users, embedding | ✅ | Level "Sharing & Schedules" (embedded vs viewer credentials, embedding) |
| Scheduled refresh | ✅ | Same level (schedules + subscriptions) |
| SQL alerts: threshold, condition, destination | ✅ | Level "SQL Alerts" (3 cards, 5 questions) |
| Picking the right chart type | ✅ | Lessons, 5 questions, and the Chart Picker lab |
| **Chart Picker lab** | ✅ | 8 scenarios × 8 chart types. Your pick is drawn from the same data next to the best one, with an explanation for every type. |
| **Dashboard Config lab** | ✅ | Parameter wiring, schedule, alert (operator, threshold, destination), credentials and sharing. A "simulate the morning" run gives 6 explained outcomes (APAC loads? fresh at 08:00? Slack notified? Maya / Omar / Priya access). |
| Taps, selects and checkboxes only (no drag) | ✅ | Both labs |
| 25+ questions, every option explained, verify flags | ✅ | 27 questions (12 scenario), 25 verify flags |
| Both labs in e2e tests | ✅ | `tests/e2e/ch6.spec.js` |

### Interactive elements
| Element | Status |
|---|---|
| SQL Sandbox + 19 graded challenges | ✅ |
| Join Visualizer, Set Ops, Time Travel | ✅ |
| Chart Picker | ✅ new |
| Dashboard Config | ✅ new |
| Genie Space Builder | ✅ |
| Namespace Builder | ✅ (saves the current check too) |
| Scenario Picker | 🟡 51 scenario questions across 4 chapters, plus the Chart Picker. An ingestion set comes with Ch 3. |
| Medallion Sorter | ⬜ Chapter 8 |

### Engineering
| Item | Status |
|---|---|
| E2E tests in the repo + `npm run test:e2e` | ✅ 13 tests |
| Run e2e before every push | ✅ `npm run verify`, documented in the README |
| Main bundle under Vite's 500 kB warning | ✅ 353 kB |

---

## 2. Content inventory

| Ch | Levels | Cards | Questions (scenario) | SQL | Verify flags | Labs |
|---|---|---|---|---|---|---|
| 4 | 9 | 24 | 42 (15) | 19 | 19 | Join Visualizer, Set Ops, Time Travel |
| 6 | 5 | 15 | 27 (12) | 0 | 25 | Chart Picker, Dashboard Config |
| 7 | 4 | 11 | 31 (15) | 0 | 27 | Genie Space Builder |
| 9 | 4 | 11 | 21 (9) | 0 | 15 | Namespace Builder |
| **Total** | **22** | **61** | **121 (51)** | **19** | **86** + 3 in-lab notes | **7** |

### Boss weighting with chapters 4, 6, 7, 9 built
| Section | Exam weight | Rescaled share | Questions (of 45) | Pool |
|---|---|---|---|---|
| 4. Querying | 15.75% (assumed) | 28.5% | 13 | 42 |
| 6. Dashboards | 15.75% (assumed) | 28.5% | 13 | 27 |
| 7. Genie | 15.75% (assumed) | 28.5% | 13 | 31 |
| 9. Securing | 8% (given) | 14.5% | 6 | 21 |

Every chapter's pool is now at least twice its Boss share.

---

## 3. Facts to re-verify before the exam

Content flags: **86** (Ch 4: 19 · Ch 6: 25 · Ch 7: 27 · Ch 9: 15), plus in-lab notes (Namespace Builder INSERT/MODIFY, Genie simulation, Dashboard Config simplifications).

### Chapter 6 (new)
| Item | What to check |
|---|---|
| Widgets | Exact widget list; how images are added (Markdown text widget?) |
| Pages & filters | Multi-page support; cross-page and cross-filter scope |
| Draft vs published | Workflow and naming |
| Parameter syntax | Named `:param` markers vs legacy `{{ param }}`; type names; query-based dropdowns |
| Publishing credentials | "Embed credentials" naming and behaviour (queries run as the publisher) vs viewer credentials |
| Sharing beyond the workspace | Link sharing, iframe embedding, embedding for external users, allowed-domain admin settings |
| Schedules & subscriptions | Options, snapshot formats (PDF/image), who can subscribe |
| Alerts | State names (OK / TRIGGERED), condition and aggregation options, schedule options, destination types and who creates them |
| Visualization types | Current list in the notebook and SQL editor UIs |

### Chapter 7 (6 new flags)
Inspecting generated SQL, trusted-asset parameters, instruction length limits, row filters with Genie, Genie on dashboards, the review-request workflow. The v3 list still applies.

### Chapters 4 and 9
Unchanged from v3.

---

## 4. Findings

### New in v4
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| S1 | **Medium** | **A failed chapter download leaves a spinner forever.** `loadChapter()` has no error handling. If a content chunk fails to load (offline, flaky network, or a redeploy that replaced the hashed files while the app was open), the promise rejects. Pages that need content then show "Loading…" indefinitely and an unhandled rejection is logged. Labs are safer: a failed `React.lazy` load reaches the error boundary's recovery screen. | Catch and clear the pending promise so it can retry, show "Couldn't load. Retry / Reload", and add an e2e test that blocks a chunk. |
| S2 | Low | **E2E tests run against the dev server, not the production build.** Lazy chunk loading under `base: './'` was checked in the production preview by hand once (cold loads of Home, a level lab, Time Travel, Boss and a chapter test, with 0 errors), not by the suite. | Add a second Playwright project against `vite preview` (skipping the dev-only crash test). |
| S3 | Low | **Chart values can't be read on a phone.** Chart Picker values show on hover via SVG `<title>`, which touch devices don't show. On a phone the only way to read values is the "View the data" table. | Add a tap-to-show value label, or a table toggle under each chart. |
| S4 | Low (content) | **Embedded credentials may look like the universal answer.** The Dashboard Config lab treats them as the correct way to let Omar (no SELECT) see data. That's the standard pattern, but it's a security trade-off: viewers see whatever the publisher's queries return. The lesson card and question explain the trade-off. | Optional: add a scenario where embedded credentials are the wrong choice. |
| S5 | Info | **Brief loading states.** Home and the Chapters list briefly show 0% mastery (and gated pages a spinner) while content chunks arrive after first paint. Barely visible on a normal connection. | Optional skeleton bars. |
| S6 | Info | **Noisy e2e output.** The crash test's expected errors are printed by Vite's console forwarding. The test opts out of the console-error check, so this is cosmetic. | Filter the webServer output, or accept it. |

### Carried over
| ID | Severity | Finding | Status |
|---|---|---|---|
| R1 | Medium | Namespace prediction reset | ✅ Fixed in v3; now covered by e2e |
| R2 | Low | No UI tests in the repo | ✅ Fixed in `541ef25` |
| R3 | Low | Every Boss showed all of Ch 7 | ✅ Fixed in `4219054` |
| R4 | Low | Bundle over 500 kB | ✅ Fixed in `1708afc` |
| R5 | Low (content) | Genie lab scores instructions by keyword | Open |
| R6 | Info | Weights for sections 4–7 are assumed (15.75% each) | Open; now affects 3 built chapters |
| R7 | Info | Readiness estimate shows coverage only | Open (as requested) |
| N4 | Low (content) | Simplified Unity Catalog access model | Open; flagged in the app |
| N5 | Low | Touch drag untested on a real phone | **Open.** Still waiting on your phone test. Ch 6 labs avoid drag as requested. |
| F3 | Low | Sandbox is SQLite, not Databricks SQL | Open; documented |
| F4 | Low | Missing-GROUP-BY challenge detects the error instead of raising it | Open |
| F6 | Low | Boss timer only auto-submits on the Boss page | Open |
| F7–F10 | Info | Option reshuffle on reload, toast merging, reducer reads the clock, Time Travel DML rewrites all rows | Open |

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm test` | **75 / 75 pass.** New: Chart Picker (every scenario explains all 8 chart types; every dataset converts to every chart spec; the best choice always renders; histogram bins count every value); Dashboard Config (the right setup meets all requirements; a field filter can't drive `:region`; a missing parameter errors; alert operator, threshold and destination; individual credentials block Omar; sharing with everyone lets Priya in; hourly isn't the complete answer; sanitizer); Ch 6 and Ch 7 minimum question counts |
| `npm run test:e2e` | **13 / 13 pass:** all main pages load with 0 console errors; SQL challenge solve; fix-challenge hint; Time Travel VACUUM → FAILED_READ_FILE; Namespace prediction persists 500 ms after clicking and after reload; invalid drop rejected; Genie full setup = 100 with Trusted and Declined answers; Boss draws 45 unique questions matching the weighted mix (computed from the same weights); empty Boss → no bonus and readiness line; crash → recovery screen → Home; Chart Picker poor pick shows two charts then the best pick; Dashboard Config wrong setup explained, right setup completes and persists; Ch 6 page and an in-level lab load |
| `npm run build` | Succeeds, **no size warning**. Main JS 353 kB (112 kB gzip). Lazy chunks: ch4 58 kB, ch6 25 kB, ch7 30 kB, ch9 22 kB, labs 3–22 kB each. `.wasm` 658 kB (326 kB gzip). |
| `npm audit` | 0 vulnerabilities |
| Visual check (dataviz step 7) | All 8 Chart Picker scenarios rendered at 390 px and inspected. Fixed label collisions at the last x-tick, text that shrank to ~5 px in the two-column layout (charts now stack on phones), and coarse histogram bins. The palette (3 categorical slots) passes every validator check against the card surface `#121a33`. |
| Not tested | Real iOS/Android devices (N5, S3), screen readers and keyboard-only use, production build in the automated suite (S2), a failed chunk load (S1) |

---

## 6. Security and privacy

No changes to the model: no backend, no network calls after load except the app's own lazy chunks from the same origin, no analytics, localStorage only. New saved state (`labState.dashboardConfig`, the Namespace check) is sanitized on read and validated on import.

---

## 7. Recommended next steps

1. **Fix S1** (retry and message on a failed chunk load) and add an e2e test that blocks a chunk. It's small and worth doing before you rely on the deployed site.
2. **Test touch drag on your phone (N5)** before Chapter 8's Medallion Sorter, or build that lab with taps like Chapter 6.
3. Build **Chapter 8 (Data Modeling)**, then Chapters 1, 2, 3 and 5.
4. Add a production-preview e2e project (S2).
5. Two weeks before the exam: work through §3. Chapters 6 and 7 move fastest.
