# Lakehouse Quest: Build Audit (v3)

**Audit date:** 2026-10-03
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `ba1bdae`, plus this audit commit
**Exam guide version targeted:** Oct 30, 2025
**Overall:** 3 of 9 chapters are complete (4, 7, 9) and 5 of 6 labs are built. The Boss Battle is now weighted by exam section. All quick fixes from v2 (N1, N2, N3, N7) are done, and N6 is resolved by the weighting. One regression appeared during this round; it was caught by the browser checks and fixed (`ba1bdae`). 63 automated tests pass. No open bugs above Low.

---

## 0. Changes since audit v2

| Commit | Change |
|---|---|
| `8ed17c4` | **N7 fixed:** error boundaries. An outer one catches app-level crashes; an inner one around each page keeps the nav bar and resets on navigation. The recovery screen has Back to Home, Reload, and a progress-backup download. |
| `3580d48` | **N1 fixed:** if saved progress fails validation on startup, a one-time dialog explains it and offers **Download damaged copy**. The raw copy is also kept under a backup key. |
| `c7a5772` | **N3 fixed:** the Namespace Builder tree, grants and tab are saved in progress (`labState`), sanitized on read, with a **Reset** button that keeps earned XP |
| `796cde5` | **N2 fixed:** per-correct XP in chapter tests and the Boss is paid only the first time a question is answered correctly each day. Both share one daily ledger, and repeats are explained on the results screen. |
| `adc07a5` | **Chapter 7 (AI/BI Genie Spaces)** plus the **Genie Space Builder** lab |
| `9b0aef8` | **Boss weighted by exam section** (N6 resolved); readiness estimate on the results screen |
| `ba1bdae` | **Regression fix:** Namespace Builder predictions reset right after you made them (caused by N3; see R1) |

**Step 2 (touch drag) was not done:** the phone result in your instructions was still the placeholder text, so I didn't change the drag code. Nothing new depends on dragging: the Genie lab uses taps, checkboxes and typing. See N5.

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
| 6 | Dashboards & Visualizations | ⬜ topic list only |
| 7 | AI/BI Genie Spaces | ✅ new |
| 8 | Data Modeling | ⬜ topic list only |
| 9 | Securing Data | ✅ |

### Interactive elements
| Element | Status | Notes |
|---|---|---|
| SQL Sandbox + graded challenges | ✅ | 19 challenges (Ch 4) |
| Join Visualizer / Set Ops | ✅ | Ch 4 |
| Time Travel Timeline | ✅ | Ch 4 |
| Namespace Builder | ✅ | Ch 9. Now saves progress, with Reset. |
| Genie Space Builder | ✅ new | Ch 7. Warehouse, tables, instructions (typed or snippets), sample questions, trusted assets. 100-point score with per-section explanations, plus 5 simulated user questions (Trusted / Correct / Shaky / Failed / Declined) that depend on your setup. Saves progress, with Reset. |
| Scenario Picker | 🟡 | 33 scenario questions across 3 chapters. Chart-type and ingestion sets will come with Ch 6 and 3. |
| Medallion Sorter | ⬜ | Chapter 8 |

### Game mechanics
| Requirement | Status | Notes |
|---|---|---|
| XP, levels, streak, daily goal | ✅ | |
| Mastery meter per chapter | ✅ | |
| Spaced repetition | ✅ | Leitner boxes 0–5 |
| Boss Battle: 45 Q / 90 min / per-section breakdown | ✅ | **Weighted by exam section** (see §2b), with a "Readiness estimate: X of 9 chapters built" line |
| Anti-farming | ✅ | Completion bonus: ≥ 80% answered, once a day. Per-correct XP: once per question per day. |
| Every option explained | ✅ | Enforced by tests for all 3 chapters |

### Robustness
| Item | Status |
|---|---|
| Error boundary with recovery screen | ✅ |
| Damaged-progress notice + download | ✅ |
| Import validation (deep merge + shape checks) | ✅ (now also covers `testXp` and `labState`) |

---

## 2. Content inventory

| Ch | Level | Cards | Questions (scenario) | SQL | Labs |
|---|---|---|---|---|---|
| 4 | Databricks Assistant | 3 | 3 (0) | 0 | none |
| 4 | SQL Warehouses | 3 | 5 (3) | 0 | none |
| 4 | Federated Queries | 2 | 3 (2) | 0 | none |
| 4 | Views, MVs & Streaming Tables | 3 | 5 (3) | 1 | none |
| 4 | Aggregations | 3 | 5 (1) | 6 | none |
| 4 | Joins & Set Operations | 3 | 6 (3) | 6 | Join Visualizer, Set Ops |
| 4 | Filtering & Sorting | 2 | 4 (0) | 4 | none |
| 4 | Creating Tables | 3 | 6 (2) | 2 | none |
| 4 | Delta Time Travel | 2 | 5 (1) | 0 | Time Travel |
| 7 | Purpose & Components | 3 | 4 (1) | 0 | none |
| 7 | Creating a Space | 3 | 6 (4) | 0 | Genie Space Builder |
| 7 | Permissions & Sharing | 2 | 4 (2) | 0 | none |
| 7 | Improving a Space | 3 | 4 (2) | 0 | none |
| 9 | The 3-Level Namespace | 3 | 4 (1) | 0 | Namespace Builder |
| 9 | Privileges & Roles | 3 | 8 (4) | 0 | none |
| 9 | Table Ownership | 2 | 4 (1) | 0 | none |
| 9 | Protecting PII | 3 | 5 (3) | 0 | none |
| | **Total** | **46** | **81 (33)** | **19** | **5** |

### 2b. Boss weighting (with chapters 4, 7, 9 built)
| Section | Exam weight | Source | Rescaled share | Questions (of 45) |
|---|---|---|---|---|
| 4. Querying | 15.75% | even split of the remaining 63% | 39.9% | 18 |
| 7. Genie | 15.75% | even split of the remaining 63% | 39.9% | 18 |
| 9. Securing | 8% | given | 20.3% | 9 |

The weights for sections 4–7 are an **assumption** (an even split of what's left after the known weights), not figures from the guide. Verify them against the current guide.

---

## 3. Facts to re-verify before the exam

"Verify in Databricks docs" flags in content: **55** (Ch 4: 19 · Ch 7: 21 · Ch 9: 15), plus 2 in-lab notes (Namespace Builder INSERT/MODIFY; Genie simulation disclaimer).

### Chapter 7 (new). Genie changes fastest, so this is the highest-priority list.
| Item | What to check |
|---|---|
| Configuration options | SQL expressions, join definitions, knowledge store, value sampling: which exist and what they are called now |
| Tables per space | Current maximum and the recommended starting size |
| Warehouse types | The lab assumes **Pro or Serverless only** (Classic fails). Confirm. |
| Trusted assets | Supported types (parameterized SQL, UC functions) and how the "Trusted" label appears |
| Read-only behaviour | Confirm Genie never runs DML |
| Permissions | Space permission level names (CAN RUN / CAN EDIT / CAN MANAGE); confirm queries run as the asking user |
| Sharing beyond the UI | Conversation API status, embedding options, chat-tool integrations |
| Monitoring & benchmarks | Names and locations of the monitoring view and benchmark features |
| Metadata refresh | How and when a space picks up changed UC metadata |

### Chapters 4 and 9
Unchanged from v2: Assistant commands, warehouse types, Federation, MV syntax, `GROUP BY ALL`, NULL ordering, managed tables and VACUUM defaults, `BROWSE`/`MANAGE`, admin roles, ownership rules, `OWNER TO` syntax, no DENY, view and base-table access, row filters and column masks, `is_account_group_member`, tags/ABAC, INSERT vs UPDATE privileges.

---

## 4. Findings

### New in v3
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| R1 | Medium → ✅ fixed | **Namespace Builder predictions reset immediately.** After N3, the grants list was rebuilt on every render, so the effect that clears a prediction fired after every click. Caught by the browser check and fixed in `ba1bdae`. | Done. See R2 for prevention. |
| R2 | Low | **No browser (UI) tests in the repo.** R1 was caught only because I re-ran ad-hoc Playwright scripts kept outside the repo. Node tests cover logic, not React behaviour. | Add the Playwright smoke tests to `tests/e2e/` with an `npm run test:e2e` script. |
| R3 | Low | **Every Boss includes all of Chapter 7.** Ch 7 has exactly 18 questions and its share is 18, so you'll see every Genie question in every Boss and could start memorising them. | Grow Ch 7 to 30+ questions. |
| R4 | Low | **The JS bundle is over Vite's 500 kB warning** (524 kB, 167 kB gzip). It still builds and loads, but first load on a slow phone connection gets heavier with each chapter. | Lazy-load labs and chapter content with `React.lazy` / dynamic `import()`. |
| R5 | Low (content) | **The Genie lab scores instructions by keyword.** Correct instructions in other words ("turnover" instead of "revenue", "FY" instead of "fiscal") may not be recognised. | Widen the keyword lists, or add "this counts as…" tags to typed lines. |
| R6 | Info | **Weights for sections 4–7 are assumed.** 15.75% each (see §2b). | Replace with figures from the guide if published. |
| R7 | Info | **"Readiness estimate" shows coverage only** ("X of 9 chapters built"). It doesn't combine your score and coverage into one readiness number. This matches the request. | Optional: score × coverage indicator. |

### Carried over
| ID | Severity | Finding | Status |
|---|---|---|---|
| N1 | Low | Silent reset of damaged progress | ✅ Fixed in `3580d48` |
| N2 | Low | Repeatable per-correct XP | ✅ Fixed in `796cde5` |
| N3 | Low | Namespace Builder state not saved | ✅ Fixed in `c7a5772` (+ `ba1bdae`) |
| N4 | Low (content) | Simplified Unity Catalog access model in the lab | Open; flagged in the app |
| N5 | Low | Touch drag not tested on a real phone | **Open.** No result was supplied this round. Tap-to-place still works as a fallback. |
| N6 | Info | Boss mix didn't follow exam weights | ✅ Resolved in `9b0aef8` |
| N7 | Info | No error boundary | ✅ Fixed in `8ed17c4` |
| F3 | Low | Sandbox is SQLite, not Databricks SQL | Open; documented in the app |
| F4 | Low | Missing-GROUP-BY challenge detects the error instead of raising it | Open; acceptable |
| F6 | Low | Boss timer only auto-submits on the Boss page | Open |
| F7 | Info | Boss options reshuffle on reload | Open |
| F8 | Info | XP toasts can merge across screens | Open |
| F9 | Info | Reducer reads the clock | Open |
| F10 | Info | Time Travel DML rewrites all rows | Open |

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm test` | **63 / 63 pass.** New: Genie scoring and simulation (perfect = 100 with all good outcomes; empty = 0; missing instructions → shaky; noise and HR tables penalised; Classic warehouse or a cluster fails; a hard-coded "trusted" query is penalised; sanitizer); Boss weights (known values, even split, sum to 100, rescaling, 18/18/9 allocation, shortfall redistribution, never over-draws); daily per-correct ledger; Namespace lab sanitizer and `labState` validation; Ch 7 content integrity |
| `npm run build` | Succeeds with a chunk-size **warning** (R4). JS 524 kB (167 kB gzip), CSS 56 kB (9 kB gzip), `.wasm` 658 kB (326 kB gzip). |
| `npm audit` | 0 vulnerabilities |
| Browser checks (Chromium, 390×844, dev server) | **Error boundary:** the dev-only `#/__crash` route shows the recovery screen; nav stays visible; Back to Home works; the crash route is absent from the production bundle. **Damaged progress:** dialog shown, download works, backup key kept, not shown again after reload. **Namespace Builder:** state survives leaving and reloading; Reset clears it; predictions show results (after the R1 fix). **Genie lab:** empty space scores 0; a missing-instruction answer is "Shaky"; the full setup scores 100; 2 Trusted + 1 Declined answers; state survives reload; both lab XP awards granted. **Boss:** lobby shows the weighted mix; a 45-question exam drew 18/18/9 with no duplicates; the results screen shows "Readiness estimate: 3 of 9 chapters built". **Regression runs** of the Chapter 4 and Chapter 9 checks from v1 and v2: 0 errors. |
| Not tested | Real iOS/Android devices (N5), screen readers and keyboard-only use, a full Boss run to timer expiry, very old browsers |

---

## 6. Security and privacy

No changes to the model: no backend, no network calls after load, no analytics, localStorage only. New stored fields (`testXp`, `labState`) are validated on import and sanitized on read. Free-text Genie instructions are stored only in this browser.

---

## 7. Recommended next steps

1. **Tell me how touch drag behaves on your phone** (N5). If it fails, I'll extract a shared drag component before building the Medallion Sorter.
2. Add Playwright UI tests to the repo (R2). That would have caught R1 automatically.
3. Build **Chapter 8 (Data Modeling)** with the Medallion Sorter.
4. Grow Chapter 7 to 30+ questions (R3), and lazy-load labs to shrink first load (R4).
5. Then Chapters 1, 2, 3, 5 and 6.
6. Two weeks before the exam: work through §3, Genie first.
