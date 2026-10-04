# Lakehouse Quest: Build Audit (v5)

**Audit date:** 2026-10-04
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `df05c19`, plus this audit commit
**Exam guide version targeted:** Oct 30, 2025
**Overall:** 5 of 9 chapters are complete (4, 5, 6, 7, 9) and 9 of 10 labs are built. S1–S4 from v4 are fixed. The e2e suite now also runs against the production build. `npm run verify` passed before this push: 94 unit tests, 39 e2e tests (20 dev + 19 prod), and the build. Open bugs: one Low that matters for iPhone users (T1).

---

## 0. Changes since audit v4

| Commit | Change |
|---|---|
| `ef9f123` | **S1 fixed:** a failed chapter download shows **"Couldn't load this chapter"** with **Retry** and **Reload** instead of an endless spinner. The new e2e test found that browsers cache a failed `import()`, so a plain retry can never succeed. Retry now re-imports the chunk URL with a cache-busting query. |
| `382eb72` | **S2 fixed:** a second Playwright project, `prod`, builds the app and runs the suite against `vite preview`. The dev-only crash test is skipped there. Both projects run in `npm run test:e2e` and `npm run verify`. |
| `c41e70d` | **S3 fixed:** tap (or Enter/Space on) any Chart Picker mark to show its value label. Other marks dim; tap again or tap the background to hide. |
| `f19a29e` | **Tap-only rule** recorded in the README and the lab registry: new labs use taps, selects and checkboxes; the Namespace Builder keeps its existing drag (tap-to-place covers it). |
| `7a30cbb` | **Chapter 5 (Analyzing Queries):** Query Profile Detective lab, Cache lab, 6 wrong-result fix challenges, 26 questions |
| `df05c19` | **S4 fixed:** new Ch 6 scenario where embedded credentials are wrong (per-viewer row filters), plus a rule in the sharing lesson |

**Process note:** while making `df05c19`, one commit was created with a failing unit test (an escaping slip in the new question). My command checked the test output with `grep` instead of the exit code. I caught it before pushing, fixed the question and amended the unpushed commit. Commits and pushes are now gated on exit codes. Nothing broken was pushed.

---

## 1. Requirements traceability

Legend: ✅ done · 🟡 partial · ⬜ not started

### Chapters
| # | Chapter | Status |
|---|---|---|
| 1 | Data Intelligence Platform | ⬜ topic list only |
| 2 | Managing Data | ⬜ topic list only |
| 3 | Importing Data | ⬜ topic list only |
| 4 | Executing Queries | ✅ |
| 5 | Analyzing Queries | ✅ new |
| 6 | Dashboards & Visualizations | ✅ (28 questions) |
| 7 | AI/BI Genie Spaces | ✅ |
| 8 | Data Modeling | ⬜ topic list only |
| 9 | Securing Data | ✅ |

### Chapter 5 requirements
| Requirement | Status | Where |
|---|---|---|
| Photon: what it is, benefits, supported workloads, what it doesn't accelerate | ✅ | Level "Photon" (2 cards, 4 questions) |
| Slow queries: Query History, Query Insights, Query Profile | ✅ | Level "Finding Slow Queries" (2 cards incl. how to read the signature, 6 questions) |
| Delta for auditing: DESCRIBE HISTORY, validating results, comparing versions | ✅ | Level "Delta for Auditing" (2 cards, 4 questions) |
| Query history & caching: result cache vs disk cache, when each helps | ✅ | Level "Query History & Caching" (2 cards, 4 questions) |
| Liquid Clustering: when, choosing columns, vs partitioning and Z-ORDER | ✅ | Level "Liquid Clustering" (2 cards, 5 questions) |
| Fixing a query to get the right result | ✅ | Level "Fixing Wrong Results" (2 cards, 6 challenges, 3 questions) |
| **Query Profile Detective**, ≥ 6 cases | ✅ | **7 cases:** no pruning → Liquid Clustering; spill → bigger size; skew → handle the hot key; exploding join → full join key; function on filter column → range filter; result-cache invalidation → refresh after load; Python UDF outside Photon → built-in functions. Operator tree with rows, time share, bytes, files read/pruned, spill and task skew. Diagnose → fix → after profile → explanation. |
| **Cache lab** | ✅ | Three queries (one non-deterministic), an INSERT that bumps the table version, HIT/MISS predictions, a log showing seconds and GB from cloud vs SSD, and 4 missions (hit, invalidation, bypass, disk-cache help) |
| **6+ fix-the-query challenges with wrong results (not errors)** | ✅ | 6: join double counting, NOT IN with NULL, `<>` dropping NULLs, average at the wrong grain, COUNT vs COUNT(DISTINCT), WHERE vs HAVING level. A unit test checks each broken query **runs** and shows its explanation. |
| 25+ questions, scenario-heavy, every option explained, verify flags | ✅ | 26 questions (15 scenario), 18 verify flags |
| Labs and challenges in e2e | ✅ | `tests/e2e/ch5.spec.js` (Detective solve + wrong path, Cache lab full cycle, two challenges, chapter page) |
| Tap-based | ✅ | Both labs |

### Interactive elements
| Element | Status |
|---|---|
| SQL Sandbox: 25 graded challenges (19 in Ch 4, 6 in Ch 5) | ✅ |
| Join Visualizer, Set Ops, Time Travel | ✅ |
| Query Profile Detective, Cache Lab | ✅ new |
| Chart Picker (now tap-to-read values), Dashboard Config | ✅ |
| Genie Space Builder, Namespace Builder | ✅ |
| Scenario Picker | 🟡 67 scenario questions plus the Chart Picker; an ingestion set comes with Ch 3 |
| Medallion Sorter | ⬜ Chapter 8 (will be tap-based) |

### Engineering
| Item | Status |
|---|---|
| Failed chunk → Retry/Reload | ✅ tested in dev and prod (Chromium only, see T1) |
| E2E against the production build | ✅ `prod` project |
| `npm run verify` before every push | ✅ ran, exit 0 |
| Main bundle | 356 kB (113 kB gzip), no warning |

---

## 2. Content inventory

| Ch | Levels | Cards | Questions (scenario) | SQL | Verify flags | Labs |
|---|---|---|---|---|---|---|
| 4 | 9 | 24 | 42 (15) | 19 | 19 | Join Visualizer, Set Ops, Time Travel |
| 5 | 6 | 12 | 26 (15) | 6 | 18 | Query Profile Detective, Cache Lab |
| 6 | 5 | 15 | 28 (13) | 0 | 26 | Chart Picker, Dashboard Config |
| 7 | 4 | 11 | 31 (15) | 0 | 27 | Genie Space Builder |
| 9 | 4 | 11 | 21 (9) | 0 | 15 | Namespace Builder |
| **Total** | **28** | **73** | **148 (67)** | **25** | **105** + 5 in-lab notes | **9** |

### Boss weighting with chapters 4, 5, 6, 7, 9 built
| Section | Exam weight | Rescaled share | Questions (of 45) | Pool |
|---|---|---|---|---|
| 4. Querying | 15.75% (assumed) | 22.2% | 10 | 42 |
| 5. Analyzing | 15.75% (assumed) | 22.2% | 10 | 26 |
| 6. Dashboards | 15.75% (assumed) | 22.2% | 10 | 28 |
| 7. Genie | 15.75% (assumed) | 22.2% | 10 | 31 |
| 9. Securing | 8% (given) | 11.3% | 5 | 21 |

---

## 3. Facts to re-verify before the exam

Content flags: **105** (Ch 4: 19 · Ch 5: 18 · Ch 6: 26 · Ch 7: 27 · Ch 9: 15), plus in-lab notes (Namespace INSERT/MODIFY, Genie simulation, Dashboard Config simplifications, Detective skew/cache/UDF cases, Cache lab model).

### Chapter 5 (new)
| Item | What to check |
|---|---|
| Photon | Defaults per compute type; the supported and unsupported operation list; which UDF types it supports |
| Query Insights | What it contains and where it appears in Query History and the profile |
| Query Profile | Metric names (files pruned, spill, task-time skew) and how adaptive execution reports skewed joins |
| DESCRIBE HISTORY | `operationMetrics` key names; system tables for workspace-wide auditing (e.g., `system.access.audit`) |
| Result cache | What counts as "the same query"; per-warehouse vs remote/persistent cache on serverless; lifetime |
| Disk cache | Naming and defaults on SQL warehouses |
| Liquid Clustering | Recommended number of keys; `CLUSTER BY AUTO`; compatibility with partitioning and Z-ORDER; whether predictive optimization runs OPTIMIZE |

### Chapter 6 (1 new flag)
How row filters and column masks are evaluated for dashboards published with embedded credentials.

### Chapters 4, 7 and 9
Unchanged from v4.

---

## 4. Findings

### New in v5
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| T1 | **Low (matters on iPhone)** | **Retry may fail on Safari.** Retry relies on the browser putting the chunk URL in the import error ("Failed to fetch dynamically imported module: <url>"). Chromium and Firefox do this. Safari's message ("Importing a module script failed.") has no URL, so Safari falls back to re-importing the same URL, which the browser may still treat as failed. **Reload** still works everywhere. The e2e suite runs Chromium only, and no WebKit browser is installed in this environment. | Derive chunk URLs at build time (e.g., from Vite's manifest) instead of parsing the error, and add a WebKit Playwright project where WebKit is available. |
| T2 | Info | **Tap-to-read values aren't screen-reader tested.** Chart marks are focusable buttons with `aria-label`s, but the value label isn't announced as a live region. | Add `aria-live="polite"` to the value label and test with VoiceOver or TalkBack. |
| T3 | Info | **Cache lab progress isn't saved.** It resets when you leave (mission XP is kept). Intentional, since it's a short exercise. | None needed |
| T4 | Info (content) | **Detective and Cache lab numbers are illustrative.** Profiles and timings are mock-ups and operator names are shortened. Flagged in both labs. | None needed |

### Carried over
| ID | Severity | Finding | Status |
|---|---|---|---|
| S1 | Medium | Endless spinner on a failed chunk | ✅ Fixed in `ef9f123` (see T1 for Safari) |
| S2 | Low | E2E dev-only | ✅ Fixed in `382eb72` |
| S3 | Low | Chart values unreadable on touch | ✅ Fixed in `c41e70d` |
| S4 | Low (content) | Embedded credentials looked universal | ✅ Fixed in `df05c19` |
| S5 | Info | Brief 0% / spinner while chunks load | Open |
| S6 | Info | Noisy e2e output from the crash test | Open |
| R5 | Low (content) | Genie lab scores instructions by keyword | Open |
| R6 | Info | Weights for sections 4–7 assumed (15.75% each), now 4 built chapters | Open |
| R7 | Info | Readiness estimate shows coverage only | Open (as requested) |
| N4 | Low (content) | Simplified Unity Catalog access model | Open; flagged |
| N5 | Low | Touch drag untested on a real phone | **Closed by decision:** all new labs are tap-based; the Namespace Builder's tap-to-place covers its drag |
| F3 | Low | Sandbox is SQLite, not Databricks SQL | Open; documented. The Ch 5 wrong-result traps (NULL logic, join fan-out, grain) behave the same in Databricks. |
| F4, F6 | Low | GROUP BY detection; Boss timer only on the Boss page | Open |
| F7–F10 | Info | Minor UI and model simplifications | Open |

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm run verify` (exit 0) | Unit tests, e2e (dev + prod) and build all passed before this push |
| `npm test` | **94 / 94 pass.** New: Ch 5 challenge solutions; each broken Ch 5 query runs and shows its explanation; Detective cases (≥ 6, valid diagnoses, one correct fix, every fix explained, a hot operator, an after profile); Cache lab (miss → hit → invalidated with disk-cache help, non-deterministic bypass, separate entries per query text, missions); Ch 5 minimums |
| `npm run test:e2e` | **39 / 39 pass** (20 dev + 19 prod). New: chunk failure → message → Retry recovers (chapter page and Boss, both projects); Chart Picker tap shows and hides value labels; Detective solve and wrong path; Cache lab full cycle with prediction score; Ch 5 challenge broken → explained → fixed; Ch 5 page |
| `npm run build` | No warnings. Main 356 kB (113 kB gzip). Chunks: ch4 58 kB, ch5 32 kB, ch6 26 kB, ch7 30 kB, ch9 22 kB; Detective 17 kB, Cache Lab 8 kB |
| `npm audit` | 0 vulnerabilities |
| Visual check (390 px) | Chart Picker value label (clamped, others dimmed); Detective operator tree; Cache lab log |
| Not tested | Safari/WebKit (T1), real phones, screen readers (T2), a full Boss run to timer expiry |

---

## 6. Security and privacy

No changes to the model: no backend, no network calls after load except same-origin lazy chunks, no analytics, localStorage only. Retry re-imports only same-origin chunk URLs taken from the browser's own error.

---

## 7. Recommended next steps

1. **T1:** make Retry independent of error-message format (build-time chunk URLs), and add WebKit tests if you can run them locally. Worth doing if you study on an iPhone.
2. Build **Chapter 8 (Data Modeling)** with a tap-based Medallion Sorter, then Chapters 1, 2 and 3.
3. Two weeks before the exam: work through §3. Chapters 5–7 have the most product-specific details.
