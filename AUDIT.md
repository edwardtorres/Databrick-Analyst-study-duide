# Lakehouse Quest: Build Audit (v6)

**Audit date:** 2026-10-04
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `8a0c583`, plus this audit commit
**Exam guide version targeted:** Oct 30, 2025
**Overall:** 7 of 9 chapters are complete (1, 2, 4, 5, 6, 7, 9) and 11 of 12 labs are built. T1 and T2 from v5 are fixed. `npm run verify` passed before this push: 122 unit tests, 54 e2e tests (27 dev + 27 prod), and the build. **iPhone result: not tested yet.** The WebKit project is ready but skipped here because WebKit isn't installed in this environment.

---

## 0. Changes since audit v5

| Commit | Change |
|---|---|
| `722d4bf` | **T1 fixed:** Retry no longer reads the URL from the error message. A Vite plugin writes `chunk-map.json` (chapter → hashed chunk file) at build time. Retry looks up the chunk there and re-imports it with a `?retry=N` query, so it works the same in every browser. In dev it uses the source module URL. A new **`webkit`** Playwright project (iPhone 13 profile) is added only when WebKit is installed. Otherwise it is skipped with a one-line message. |
| `2806ae3` | **T2 fixed:** each chart in the Chart Picker has a visually hidden `aria-live="polite"` region that announces the tapped value. It is always present, because a label that only mounts on tap isn't announced reliably. |
| `1e84470` | **Chapter 1 (Data Intelligence Platform):** 4 levels, 9 cards, 26 questions, and the **Platform Match** lab |
| `25b18dc` | **Chapter 2 (Managing Data):** 3 levels, 6 cards, 26 questions, 9 cleaning challenges, and the **Catalog Explorer** lab (shared with Chapter 1) |
| `cf2fcc6` | Six Chapter 1 questions rewritten as workplace scenarios (now 16 of 26). README status updated. |
| `8a0c583` | **`try_cast` works in the sandbox** and returns NULL for junk, as in Databricks. Catalog Explorer shows mission feedback next to the action buttons so phone users don't have to scroll up. |

---

## 1. Requirements traceability

Legend: ✅ done · 🟡 partial · ⬜ not started

### This round
| Requirement | Status | Where / notes |
|---|---|---|
| T1: Retry independent of error message | ✅ | `vite.config.js` (`chapterChunkMap` plugin), `src/data/chapters.js` (`chunkUrl`, `importChapter`). A prod e2e test checks `chunk-map.json` lists every built chapter and that each file loads. Both the chapter-page and Boss Retry tests pass in dev and prod. |
| T1: WebKit project, auto-skipped when missing | ✅ | `playwright.config.js`. On your Mac: `npx playwright install webkit`, then `npm run test:e2e`. |
| T1: iPhone result | ⬜ **Not tested yet** | You left the placeholder in the request. The fix doesn't rely on any Safari behavior, but it hasn't run on WebKit or a real iPhone. |
| T2: `aria-live="polite"` on Chart Picker values | ✅ | `src/components/MiniChart.jsx`. An e2e test checks the region is empty, then reads "Jan: 310 $k" after a tap. |
| Ch 1 lessons: core components | ✅ | Delta Lake, Unity Catalog, Databricks SQL, Lakeflow Jobs, Lakeflow Declarative Pipelines (DLT), Mosaic AI, Data Intelligence Engine. What each does and when an analyst touches it. |
| Ch 1 lessons: Catalog Explorer | ✅ | Catalogs, schemas, managed vs external, views, certified/deprecated, lineage, plus the Catalog Explorer lab |
| Ch 1 lessons: Marketplace | ✅ | What it offers, who provides, public/private listings, delivery via Delta Sharing as a read-only catalog |
| Platform Match lab (tap-based) | ✅ | 10 scenarios (scheduled ETL, table owner, ACID, BI SQL, expectations, RAG, semantics, third-party data, partner sharing, lineage). Tap a component → verdict → why each of the 4 options does or doesn't fit. |
| Ch 2 lessons | ✅ | Discovering and querying certified data; tags (UI and `SET TAGS`) and lineage; cleaning in SQL |
| Catalog Explorer lab (tap-based, Ch 1 + 2) | ✅ | 3 catalogs (prod, raw, dev), 7 tables/views, a job, 3 dashboards, a notebook. Five missions: find the certified table (deprecated one rejected), managed vs external from Details, tag `email` as `pii = email`, trace upstream to the raw source, flag every dashboard downstream (one is two hops away through a view). Saved in progress and sanitized on load. |
| 6+ cleaning challenges on the dirty rows | ✅ | **9:** email placeholders → 'unknown' (CASE or COALESCE/NULLIF); fix COUNT counting junk; valid orders (qty > 0, known status); CASE quality flags; LOWER/TRIM standardizing; DISTINCT for exact duplicates; ROW_NUMBER for the latest row per normalized email; fix CAST on '$12.50' (clean first, or `try_cast`); LEFT JOIN + COALESCE 'Unassigned'. |
| 25+ questions each, scenario-heavy, every option explained, verify flags | ✅ | Ch 1: 26 (16 scenario, 19 flags). Ch 2: 26 (19 scenario, 12 flags). Unit tests enforce one correct answer and an explanation for every option. |
| Labs and challenges in e2e (dev + prod) | ✅ | `tests/e2e/ch1.spec.js`, `tests/e2e/ch2.spec.js`: Platform Match wrong and right; all five Catalog Explorer missions including wrong answers and reload persistence; three cleaning challenges (fix → explained → solved); chapter pages; lab inside Ch 1's level |

### Chapters
| # | Chapter | Status |
|---|---|---|
| 1 | Data Intelligence Platform | ✅ new |
| 2 | Managing Data | ✅ new |
| 3 | Importing Data | ⬜ topic list only |
| 4 | Executing Queries | ✅ |
| 5 | Analyzing Queries | ✅ |
| 6 | Dashboards & Visualizations | ✅ |
| 7 | AI/BI Genie Spaces | ✅ |
| 8 | Data Modeling | ⬜ topic list only |
| 9 | Securing Data | ✅ |

### Interactive elements
| Element | Status |
|---|---|
| SQL Sandbox: 34 graded challenges (9 in Ch 2, 19 in Ch 4, 6 in Ch 5) | ✅ |
| Platform Match, Catalog Explorer | ✅ new |
| Join Visualizer, Set Ops, Time Travel | ✅ |
| Query Profile Detective, Cache Lab | ✅ |
| Chart Picker, Dashboard Config | ✅ |
| Genie Space Builder, Namespace Builder | ✅ |
| Scenario Picker | 🟡 102 scenario questions plus Platform Match and Chart Picker; an ingestion set comes with Ch 3 |
| Medallion Sorter | ⬜ Chapter 8 (will be tap-based) |

### Engineering
| Item | Status |
|---|---|
| Failed chunk → Retry/Reload | ✅ chunk map, tested on Chromium in dev and prod; WebKit project ready |
| `npm run verify` before every push, gated on exit codes | ✅ exit 0 |
| Main bundle | 358 kB (114 kB gzip), no warning |

---

## 2. Content inventory

| Ch | Levels | Cards | Questions (scenario) | SQL | Verify flags | Labs |
|---|---|---|---|---|---|---|
| 1 | 4 | 9 | 26 (16) | 0 | 19 | Platform Match, Catalog Explorer |
| 2 | 3 | 6 | 26 (19) | 9 | 12 | Catalog Explorer |
| 4 | 9 | 24 | 42 (15) | 19 | 19 | Join Visualizer, Set Ops, Time Travel |
| 5 | 6 | 12 | 26 (15) | 6 | 18 | Query Profile Detective, Cache Lab |
| 6 | 5 | 15 | 28 (13) | 0 | 26 | Chart Picker, Dashboard Config |
| 7 | 4 | 11 | 31 (15) | 0 | 27 | Genie Space Builder |
| 9 | 4 | 11 | 21 (9) | 0 | 15 | Namespace Builder |
| **Total** | **35** | **88** | **200 (102)** | **34** | **136** + 7 in-lab notes | **11** |

### Boss weighting with chapters 1, 2, 4, 5, 6, 7, 9 built
| Section | Exam weight | Rescaled share | Questions (of 45) | Pool |
|---|---|---|---|---|
| 1. Platform | 11% (given) | 12.2% | 5 | 26 |
| 2. Managing Data | 8% (given) | 8.9% | 4 | 26 |
| 4. Querying | 15.75% (assumed) | 17.5% | 8 | 42 |
| 5. Analyzing | 15.75% (assumed) | 17.5% | 8 | 26 |
| 6. Dashboards | 15.75% (assumed) | 17.5% | 8 | 28 |
| 7. Genie | 15.75% (assumed) | 17.5% | 8 | 31 |
| 9. Securing | 8% (given) | 8.9% | 4 | 21 |

The built chapters now cover 90% of the exam by weight. Only sections 3 (5%) and 8 (5%) are missing.

---

## 3. Facts to re-verify before the exam

Content flags: **136** (Ch 1: 19 · Ch 2: 12 · Ch 4: 19 · Ch 5: 18 · Ch 6: 26 · Ch 7: 27 · Ch 9: 15), plus in-lab notes.

### Chapter 1 (new)
| Item | What to check |
|---|---|
| Product names | Workflows → Lakeflow Jobs; Delta Live Tables → Lakeflow Declarative Pipelines; DatabricksIQ → Data Intelligence Engine. Which names the exam uses. |
| Mosaic AI | Current component names (serving, vector search, agent framework, evaluation) |
| AI functions | Names and availability (`ai_query`, sentiment and classification functions) |
| Certification / deprecation | Applied as system tags; how Catalog Explorer shows them |
| Marketplace | Asset types offered, private exchanges, consumer requirements (Unity Catalog workspace, privileges) |

### Chapter 2 (new)
| Item | What to check |
|---|---|
| Tags | `ALTER TABLE … ALTER COLUMN … SET TAGS` syntax; governed tags and tag policies; who can set them |
| Lineage | Retention period; lineage system tables; which asset types and column-level lineage appear |
| Discovery | BROWSE privilege; Sample Data requirements; semantic search |
| Casting | ANSI mode default on SQL warehouses; `try_cast` behavior (the sandbox's `try_cast` accepts only whole numbers for integer types) |

### Chapters 4–7 and 9
Unchanged from v5.

---

## 4. Findings

### New in v6
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| U1 | **Low (matters on iPhone)** | **WebKit and iPhone still untested.** T1 no longer depends on the error text, so the Safari gap from v5 is closed in code. But neither WebKit nor a real iPhone has run the suite. | On your Mac: `npx playwright install webkit && npm run test:e2e`. On the phone: turn on airplane mode, open an unvisited chapter, turn it off, tap Retry. |
| U2 | Info (content) | **Catalog Explorer is a simplified mock.** No Permissions, History or Insights tabs; certification is a badge rather than a system tag; four fixed tag presets. Flagged in the lab. | None needed |
| U3 | Info | **Sandbox CAST differs from Databricks.** SQLite turns `'$12.50'` into 0, where Databricks with ANSI mode raises an error. The fix challenge explains this, and `try_cast` now behaves like Databricks. | None needed; documented in the challenge |
| U4 | Info | **Catalog Explorer's done banner stays visible** on later object pages until you pick another mission. It is a little noisy but harmless. | Auto-advance to the next unfinished mission, if you want |

### Carried over
| ID | Severity | Finding | Status |
|---|---|---|---|
| T1 | Low | Retry depended on the browser's error text (Safari) | ✅ Fixed in `722d4bf` (see U1) |
| T2 | Info | Tapped values not announced to screen readers | ✅ Fixed in `2806ae3`; not tested with VoiceOver/TalkBack |
| T3 | Info | Cache lab progress isn't saved (intentional) | Open |
| T4 | Info (content) | Detective and Cache lab numbers are illustrative | Open; flagged |
| S5 | Info | Brief 0% / spinner while chunks load | Open |
| S6 | Info | Noisy e2e output from the crash test | Open |
| R5 | Low (content) | Genie lab scores instructions by keyword | Open |
| R6 | Info | Weights for sections 4–7 assumed (15.75% each) | Open |
| R7 | Info | Readiness estimate shows coverage only | Open (as requested) |
| N4 | Low (content) | Simplified Unity Catalog access model | Open; flagged |
| F3 | Low | Sandbox is SQLite, not Databricks SQL | Open; documented (see U3) |
| F4, F6 | Low | GROUP BY detection; Boss timer only on the Boss page | Open |
| F7–F10 | Info | Minor UI and model simplifications | Open |

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm run verify` (exit 0) | Unit tests, e2e (dev + prod) and build all passed before this push. Commits and the push were gated on exit codes. |
| `npm test` | **122 / 122 pass.** New: Ch 1 and Ch 2 content integrity and minimums; every widget block names a registered lab; every Ch 2 solution passes; both Ch 2 fix starters run and show their explanation; alternative answers accepted (COALESCE/NULLIF, GROUP BY dedupe, USING join, `try_cast`) and naive ones rejected; Catalog Explorer lineage, missions, feedback and sanitizing; Platform Match scenarios; `try_cast` semantics |
| `npm run test:e2e` | **54 pass, 1 skipped** (27 dev + 27 prod; the dev-only crash test is skipped in prod). The webkit project was skipped: WebKit not installed. New: Retry via chunk map; chunk map lists every chapter (prod); live region announces the tapped value; Platform Match; the full Catalog Explorer run with inline feedback and reload persistence; Ch 2 challenges; Ch 1 and Ch 2 pages |
| `npm run build` | No warnings. Main 358 kB (114 kB gzip). Chunks: ch1 22 kB, ch2 30 kB, ch4 58 kB, ch5 32 kB, ch6 26 kB, ch7 30 kB, ch9 22 kB; Catalog Explorer 19 kB, Platform Match 11 kB |
| `npm audit` | 0 vulnerabilities |
| Visual check (375 px) | Catalog Explorer schema list with badges and the lineage view; no horizontal scroll |
| Not tested | WebKit and real phones (U1), screen readers (T2), a full Boss run to timer expiry |

---

## 6. Security and privacy

No change to the model: no backend, no analytics, localStorage only. The app now also fetches `chunk-map.json` (same origin, `no-store`) when a chapter download fails. Retry imports only same-origin chunk paths listed in that file. Catalog Explorer state is sanitized against the lab's known objects, columns and tags before use.

---

## 7. Recommended next steps

1. **U1:** run the WebKit project on your Mac and do the airplane-mode Retry check on your iPhone. Send me the result.
2. Build **Chapter 3 (Importing Data)** and **Chapter 8 (Data Modeling)** with a tap-based Medallion Sorter. That covers the remaining 10% of the exam.
3. Two weeks before the exam: work through §3. Chapters 1, 5, 6 and 7 have the most product-specific details.
