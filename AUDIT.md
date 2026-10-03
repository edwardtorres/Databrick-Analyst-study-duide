# Lakehouse Quest: Build Audit (v2)

**Audit date:** 2026-10-03
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `0e31b83` (confirmed on GitHub)
**Exam guide version targeted:** Oct 30, 2025
**Overall:** 2 of 9 chapters are complete (4 and 9), and 4 of 6 labs are built. The Boss Battle is now a full 45-question / 90-minute exam. Everything from the first audit except the Chapter 1–3 and 5–8 content is fixed or done. There are 6 new low-severity findings and no open bugs above Low.

---

## 0. Changes since audit v1

| Commit | Change |
|---|---|
| `dde8353` | **F1 fixed:** the Boss completion bonus requires ≥ 80% of questions answered and is paid at most once per calendar day |
| `a46b3b6` | **F2 fixed:** imported and stored progress is deep-merged with `emptyProgress()` and checked field by field. Bad files are rejected with a friendly message. |
| `072ff40` | **F5 fixed:** `CREATE TABLE t (cols) AS SELECT` is accepted. The sandbox rewrites it so SQLite can run it. |
| `15572ec` | **Chapter 9** plus the **Namespace Builder** lab |
| `0e31b83` | Audit v1 status update |
| *(push)* | **F11 fixed:** GitHub access restored; all commits are on GitHub |

**Corrections to my earlier summary:** Chapter 9 has **11** lesson cards, not 12, and **15** "verify" flags in its content, not 18. The Namespace Builder adds one more in-lab verify note, about INSERT/MODIFY.

---

## 1. Requirements traceability

Legend: ✅ done · 🟡 partial · ⬜ not started

### Exam facts and home screen
| Requirement | Status | Where |
|---|---|---|
| 45 scored MCQ, 90 min, online or test-center proctored | ✅ | `src/data/examInfo.js`, Home |
| Guide version Oct 30, 2025 is shown | ✅ | Home → "The exam" |
| Re-check the guide 2 weeks before the exam | ✅ | Home. Calculates the re-check date from your exam date and turns red inside the 2-week window. |

### Chapters
| # | Chapter | Status |
|---|---|---|
| 1 | Data Intelligence Platform | ⬜ topic list only |
| 2 | Managing Data | ⬜ topic list only |
| 3 | Importing Data | ⬜ topic list only |
| 4 | Executing Queries with Databricks SQL & SQL Warehouses | ✅ complete |
| 5 | Analyzing Queries | ⬜ topic list only |
| 6 | Dashboards & Visualizations | ⬜ topic list only |
| 7 | AI/BI Genie Spaces | ⬜ topic list only |
| 8 | Data Modeling | ⬜ topic list only |
| 9 | Securing Data | ✅ complete |

### Interactive elements
| Element | Status | Notes |
|---|---|---|
| SQL Sandbox + graded challenges | ✅ | sql.js (SQLite 3.49) with Databricks-style shims; 19 challenges (Ch 4) |
| Fix-the-broken-query challenges | ✅ | 5 (missing GROUP BY, HAVING vs WHERE, wrong join type, WHERE on an outer join, `= NULL`) |
| Join Visualizer | ✅ | 7 join types, predict the row count; plus a Set Ops lab |
| Time Travel Timeline | ✅ | VERSION/TIMESTAMP AS OF, `@v`, RESTORE, DML, VACUUM with the retention safety check |
| Namespace Builder | ✅ | Drag or tap-to-place catalog → schema → table/volume; GRANT builder; "can user X run Y?" checks with the missing privilege and the fixing GRANT; least-privilege mission |
| Scenario Picker | 🟡 | A question style (24 scenario questions across Ch 4 and 9). Chart-type and ingestion scenario sets come with Ch 6 and 3. |
| Medallion Sorter | ⬜ | Chapter 8 |
| Genie Space Builder | ⬜ | Chapter 7 |

### Game mechanics
| Requirement | Status | Notes |
|---|---|---|
| XP, levels, daily streak | ✅ | Plus a daily XP goal |
| Per-chapter mastery meter | ✅ | 60% question mastery + 25% subsections + 15% challenges. Chapters without challenges use 70/30. |
| Missed questions come back more often | ✅ | Leitner boxes 0–5 |
| Boss Battle: 45 Q, 90 min, per-section breakdown | ✅ | Full exam now that the bank has 63 questions. The bonus rules are tested. |
| Every option explained | ✅ | Enforced by tests for both chapters |

### Content rules and tech
| Requirement | Status |
|---|---|
| Original scenario-style questions | ✅ |
| "Verify in Databricks docs" flags | ✅ 34 in content (Ch 4: 19, Ch 9: 15) + 1 in the Namespace Builder lab |
| React + Vite + Tailwind, client-side, localStorage, mobile, static deploy | ✅ |

---

## 2. Content inventory

| Ch | Level | Cards | Questions (scenario) | SQL challenges | Labs |
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
| 9 | The 3-Level Namespace | 3 | 4 (1) | 0 | Namespace Builder |
| 9 | Privileges & Roles | 3 | 8 (4) | 0 | none |
| 9 | Table Ownership | 2 | 4 (1) | 0 | none |
| 9 | Protecting PII | 3 | 5 (3) | 0 | none |
| | **Total** | **35** | **63 (24)** | **19** | **4** |

- 4 Chapter 4 challenges are only in the SQL Arena, not in a level: `c4-sql-avg-region`, `c4-sql-stats`, `c4-sql-orphans`, `c4-sql-union`.
- Chapter 9 has no SQL challenges. GRANT and masking can't be run in SQLite, so the Namespace Builder covers that hands-on.

---

## 3. Facts to re-verify before the exam

### Chapter 4
| Item | What to check |
|---|---|
| Assistant slash commands (`/explain`, `/fix`, `/doc`, `/optimize`) and "Diagnose error" | Current names. `/optimize` is the least certain. |
| SQL warehouse types | Which features require Pro or Serverless |
| Lakehouse Federation | Sources, `CREATE CONNECTION` options, required compute |
| Materialized views | `SCHEDULE` syntax, incremental refresh, Lakeflow vs DLT naming |
| `GROUP BY ALL` | Minimum version |
| NULL sort order and `ILIKE` | Databricks defaults |
| Notebook Data Profile | UI location |
| Managed tables | Predictive optimization; DROP/UNDROP windows |
| External table prerequisites | Privilege names |
| `CREATE OR REPLACE` | Whether grants and the table ID survive |
| VACUUM | 7-day default; automatic VACUUM by predictive optimization |

### Chapter 9
| Item | What to check |
|---|---|
| Securable object types | The list keeps growing (models, functions, etc.) |
| Newer privileges | `BROWSE` and `MANAGE`, and whether the exam expects them |
| Admin roles | Account / metastore / workspace admin responsibilities |
| Ownership | Parent-owner rights; whether owners still need USE CATALOG / USE SCHEMA (the lab assumes yes) |
| `ALTER … OWNER TO` | Exact syntax per object type |
| No DENY in Unity Catalog | Still true? |
| Views | Readers need SELECT on the view only; owner requirements for base tables |
| Row filters and column masks | Compute and version requirements |
| `is_account_group_member` vs `is_member` | Current recommendation |
| Tags / ABAC | Tag-driven policies may now enforce masks from tags |
| INSERT vs UPDATE/DELETE (lab note) | The lab treats INSERT as needing MODIFY only; UPDATE/DELETE/MERGE also need SELECT |

**Also worth knowing:**
- Time Travel error messages are illustrative, not word-for-word Databricks output, and the lab doesn't show VACUUM START/END history rows.
- The passing score is deliberately not stated.
- The Boss splits questions evenly across built chapters, not by official section weights.

---

## 4. Findings

### Open, new in v2
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| N1 | Low | **Damaged saved progress resets without telling you.** If the browser's saved progress fails validation on startup, the app starts fresh. The raw copy is kept under `lakehouse-quest:v1:damaged:<time>`, but no message is shown. `src/lib/store.jsx` → `load()` | Show a one-time notice with a "download damaged copy" option. |
| N2 | Low | **Per-correct XP can still be repeated.** The Boss and chapter tests pay 5 XP per correct answer on every run. The completion-bonus farming (F1) is fixed. This needs right answers, so the impact is small. | Cap test XP per day, or pay only for questions newly answered correctly. |
| N3 | Low | **Namespace Builder progress isn't saved.** The tree and grants reset when you leave the lab; only the XP is kept. | Save the lab state in progress, with a Reset button. |
| N4 | Low (content) | **The lab's access model is simplified:** no owner rights over child objects, INSERT = MODIFY only, no BROWSE/MANAGE, no metastore-admin role. Flagged in the lab and lessons. | Extend the model if the docs confirm more rules. |
| N5 | Low | **Touch drag is untested on a real phone.** It was tested with a mouse in Chromium; touch dragging uses `touch-action: none` and Pointer Events. Tap-to-place is the fallback. | Test on iOS Safari and Android Chrome. |
| N6 | Info | **Boss question mix ≠ exam weighting.** Questions are spread evenly across built chapters (about 22–23 from each of Ch 4 and 9). | Weight by the official section percentages once all chapters exist. |
| N7 | Info | **No error boundary.** An unexpected runtime error blanks the whole app instead of showing a recovery screen. | Add a top-level React error boundary with "Back to Home". |

### Carried over from v1
| ID | Severity | Finding | Status |
|---|---|---|---|
| F1 | Medium | Boss XP farming | ✅ Fixed in `dde8353` |
| F2 | Low | Malformed import could crash the app | ✅ Fixed in `a46b3b6` |
| F3 | Low | Sandbox is SQLite, not Databricks SQL (`7/2`, `LIKE` case, no QUALIFY/SEMI/ANTI/time travel) | Open; documented in the app |
| F4 | Low | Missing-GROUP-BY challenge shows the Databricks error by detection, not a real error | Open; acceptable |
| F5 | Low | CTAS with a column list was rejected | ✅ Fixed in `072ff40` |
| F6 | Low | Boss timer only auto-submits when the Boss page is open | Open |
| F7 | Info | Boss options reshuffle on reload | Open; scoring unaffected |
| F8 | Info | XP toasts can merge across screens | Open; cosmetic |
| F9 | Info | Reducer reads the clock (`Date.now`, `dayKey`) | Open; no visible effect |
| F10 | Info | Time Travel DML rewrites every row into a new file | Open; teaching point unaffected |
| F11 | Process | Push blocked by GitHub access | ✅ Fixed; all commits pushed |

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm test` | **45 / 45 pass.** Covers SQL challenges and shims; CTAS with a column list; Boss bonus rules (80% answered, once per day, mini vs full); progress import (round trip, deep merge, malformed nested fields, non-JSON); Unity Catalog access logic (missing USE grants, inheritance, group membership, owner still needs USE, least-privilege mission); content integrity for Ch 4 and 9; unique question IDs across chapters |
| `npm run build` | Succeeds. JS 478 kB (152 kB gzip), CSS 54 kB (9 kB gzip), `.wasm` 658 kB (326 kB gzip) |
| `npm audit` | 0 vulnerabilities |
| Browser test (Chromium, 390×844) | 0 console errors. Namespace Builder: an invalid drop explained the rule, the drag-built and tap-placed tree completed, a denied access check showed the correct fixing GRANTs, and the least-privilege mission completed. Settings: a malformed import showed a friendly error. Boss: the full 45-question exam started; an empty early submit gave no bonus, with the reason shown. Chapter 4 checks from v1 still pass. |
| Not tested | Real iOS/Android devices (touch drag), screen readers and keyboard-only use, a full 45-question Boss run to timer expiry, very old browsers |

---

## 6. Security and privacy

- No backend and no network calls after load. All data stays in this browser's localStorage.
- Imported files are now validated before use (F2). Damaged stored data is set aside, not used (see N1).
- No `dangerouslySetInnerHTML`, no analytics, cookies or third-party scripts.
- SQL runs in an in-memory SQLite database inside the browser.

---

## 7. Recommended next steps

1. Quick fixes: N1 (notice for reset progress), N7 (error boundary), N3 (save the lab state).
2. Build Chapter 8 (Data Modeling) with the Medallion Sorter, then Chapter 7 (Genie Space Builder).
3. Then Chapters 1, 2, 3, 5 and 6, adding the ingestion and chart-type Scenario Picker sets.
4. Test touch drag on your phone (N5). Tell me if the Namespace Builder scrolls instead of dragging.
5. Two weeks before the exam: work through §3 and check whether there is a newer exam guide.
