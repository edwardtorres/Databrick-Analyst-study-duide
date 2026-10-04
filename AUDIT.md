# Lakehouse Quest: Build Audit (v7, final build)

**Audit date:** 2026-10-04
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `f494715`, plus this audit commit
**Exam guide version targeted:** Oct 30, 2025
**Overall:** **Complete.** All 9 chapters and all 15 labs are built. The Boss Battle draws the full 45 questions across every exam section, and the readiness line shows 9 of 9. `npm run verify` passed before this push: 146 unit tests, 70 e2e tests (35 dev + 35 prod), and the build. **iPhone: still not tested** (U1).

---

## 0. Changes since audit v6

| Commit | Change |
|---|---|
| `0d6e318` | **Chapter 3 (Importing Data):** 5 levels, 11 cards, 26 questions, the **Ingestion Picker** lab (12 scenarios) and the **Upload Wizard** lab. Platform Match and the Ingestion Picker now share one `ScenarioPicker` component. |
| `6d22e27` | **Chapter 8 (Data Modeling):** 4 levels, 9 cards, 26 questions, 5 SQL challenges, the **Medallion Sorter** and the **Star Schema Builder**. The Boss page says "Every exam section is included" once all 9 are built. Tests check the full 45-question mix and "9 of 9". |
| `f494715` | README status: **complete** |

---

## 1. Requirements traceability

Legend: ✅ done · 🟡 partial · ⬜ not started

### This round
| Requirement | Status | Where / notes |
|---|---|---|
| Ch 3 lessons: S3 / cloud storage | ✅ | External locations (storage credential + path, READ FILES / WRITE FILES / CREATE EXTERNAL TABLE), volumes (`/Volumes/…`), COPY INTO (idempotent, FORMAT_OPTIONS, mergeSchema), CTAS from `read_files` (one-off snapshot; re-runs reread everything) |
| Ch 3 lessons: Auto Loader | ✅ | Incremental discovery with a checkpoint, directory vs file-notification, schema inference and evolution, `_rescued_data`, streaming tables for SQL users, COPY INTO vs Auto Loader decision card |
| Ch 3 lessons: Delta Sharing | ✅ | Open vs Databricks-to-Databricks, provider (share, recipient, grant) vs recipient (catalog from share), read-only, live, cross-cloud |
| Ch 3 lessons: APIs, Marketplace | ✅ | Lakeflow Connect first; otherwise a scheduled job lands API JSON in a volume and COPY INTO / Auto Loader loads it; Lakehouse Federation for query-in-place; Marketplace as a read-only catalog |
| Ch 3 lessons: UI upload | ✅ | Supported formats, size limit, choosing catalog/schema/name, required privileges, header and type detection, managed Delta result |
| **Ingestion Picker** (tap-based Scenario Picker, 10+) | ✅ | **12 scenarios** over 10 methods: hourly CSVs at 2M files (Auto Loader), non-Databricks partner on another cloud (open sharing), one-off 20 MB spreadsheet (upload), 3,000 daily Parquet files (COPY INTO), one-off JSON snapshot (CTAS), weather vendor (Marketplace), REST API with no connector (custom intake), Salesforce (Lakeflow Connect), 40,000 PDFs (volume), monthly join to Postgres (Federation), another Databricks account (D2D sharing), evolving JSON (Auto Loader rescue). Tap → verdict → why each of the 4 options fits or doesn't. |
| **Upload Wizard** (tap-based) | ✅ | Pick a file → catalog/schema/name → preview with header toggle and per-column type selects → create. Simulated mistakes: unsupported file (video), oversized file (6.4 GB), **no CREATE TABLE** (prod.sales), **wrong schema** (main.default), read-only catalog (samples), bad table name, **header read as data** (`_c0…`, all STRING), **wrong inferred type** (ZIP as BIGINT turns 02134 into 2134). Each is explained. A "Mistakes explored 4/4" checklist covers the four you named plus the type fix. |
| Ch 8 lessons | ✅ | Star (facts, dimensions, grain first, additive/semi-additive, degenerate dimension, SCD 1/2, Unknown member); snowflake (pros/cons, when it fits); data vault (hubs, links, satellites; insert-only, auditable); 3NF; informational PK/FK; medallion mapping (bronze raw → silver cleaned/conformed, often vault or 3NF → gold stars and aggregates) |
| **Medallion Sorter** (tap-based) | ✅ | 12 cards (4 per layer): tap a card, tap Bronze/Silver/Gold. Each placement shows ✓/✗ and why; misplaced cards can be moved. Saved in progress. |
| **Star Schema Builder** (tap-based) | ✅ | Retail sales process. 1) Pick the grain (order line ✓; order, store-day, product explained). 2) Tap 14 columns into fact_sales or dim_customer/product/date/store; keys pre-placed; wrong placements say where they belong and why. 3) Snowflake opportunity (region → dim_region ✓). Saved in progress. |
| **4+ star/snowflake SQL challenges** | ✅ | **5:** fact joined to two dims; extra hop through regions; gold aggregate at a declared grain (year × month × category); **fix a fan-out** (category targets summed per order line, 4,000 vs 500); Unknown member with LEFT JOINs so totals reconcile |
| 25+ questions each, scenario-heavy, every option explained, verify flags | ✅ | Ch 3: 26 (20 scenario, 18 flags). Ch 8: 26 (19 scenario, 7 flags; modeling theory is stable). Tests enforce one correct answer and an explanation for every option. |
| Labs and challenges in e2e (dev + prod) | ✅ | `ch3.spec.js`: Ingestion Picker wrong/right; the Upload Wizard through every mistake to a created table. `ch8.spec.js`: Medallion Sorter wrong → move → all 12 → reload persists; Star Schema Builder all three steps with wrong picks; the fan-out fix challenge explains, then passes; snowflake challenge; chapter pages. |
| Boss draws the full weighted 45 | ✅ | e2e: 45 unique questions, all 9 sections, mix **5/4/2/7/7/7/7/2/4**. Unit: same allocation, and the rescaled weights equal the exam weights. |
| Readiness shows 9 of 9 | ✅ | e2e: "Readiness estimate: 9 of 9 chapters built" and "This score covers every exam section"; no mini-boss text |
| README says complete | ✅ | Status line, lab list (15) |

### Chapters
| # | Chapter | Status |
|---|---|---|
| 1 | Data Intelligence Platform | ✅ |
| 2 | Managing Data | ✅ |
| 3 | Importing Data | ✅ new |
| 4 | Executing Queries | ✅ |
| 5 | Analyzing Queries | ✅ |
| 6 | Dashboards & Visualizations | ✅ |
| 7 | AI/BI Genie Spaces | ✅ |
| 8 | Data Modeling | ✅ new |
| 9 | Securing Data | ✅ |

### Interactive elements (original spec)
| Element | Status |
|---|---|
| SQL Sandbox: 39 graded challenges (Ch 2: 9, Ch 4: 19, Ch 5: 6, Ch 8: 5) | ✅ |
| Join Visualizer | ✅ |
| Scenario Picker | ✅ Platform Match (10) and Ingestion Picker (12) on one shared component, plus 141 scenario questions |
| Namespace Builder | ✅ |
| Medallion Sorter | ✅ new |
| Genie Space Builder | ✅ |
| Time Travel Timeline | ✅ |
| Also built | Set Ops, Query Profile Detective, Cache Lab, Chart Picker, Dashboard Config, Catalog Explorer, Upload Wizard, Star Schema Builder |

### Game mechanics (original spec)
| Item | Status |
|---|---|
| XP, levels, streaks, daily goal | ✅ |
| Mastery meter per chapter | ✅ |
| Spaced repetition (Leitner) | ✅ |
| Boss Battle: 45 Q, 90 min, per-section breakdown | ✅ full exam, all sections |

---

## 2. Content inventory

| Ch | Levels | Cards | Questions (scenario) | SQL | Verify flags | Labs |
|---|---|---|---|---|---|---|
| 1 | 4 | 9 | 26 (16) | 0 | 19 | Platform Match, Catalog Explorer |
| 2 | 3 | 6 | 26 (19) | 9 | 12 | Catalog Explorer |
| 3 | 5 | 11 | 26 (20) | 0 | 18 | Ingestion Picker, Upload Wizard |
| 4 | 9 | 24 | 42 (15) | 19 | 19 | Join Visualizer, Set Ops, Time Travel |
| 5 | 6 | 12 | 26 (15) | 6 | 18 | Query Profile Detective, Cache Lab |
| 6 | 5 | 15 | 28 (13) | 0 | 26 | Chart Picker, Dashboard Config |
| 7 | 4 | 11 | 31 (15) | 0 | 27 | Genie Space Builder |
| 8 | 4 | 9 | 26 (19) | 5 | 7 | Medallion Sorter, Star Schema Builder |
| 9 | 4 | 11 | 21 (9) | 0 | 15 | Namespace Builder |
| **Total** | **44** | **108** | **252 (141)** | **39** | **161** + 14 in-lab notes | **15** |

### Boss weighting, all chapters built
| Section | Exam weight | Questions (of 45) | Pool |
|---|---|---|---|
| 1. Platform | 11% (given) | 5 | 26 |
| 2. Managing Data | 8% (given) | 4 | 26 |
| 3. Importing | 5% (given) | 2 | 26 |
| 4. Querying | 15.75% (assumed) | 7 | 42 |
| 5. Analyzing | 15.75% (assumed) | 7 | 26 |
| 6. Dashboards | 15.75% (assumed) | 7 | 28 |
| 7. Genie | 15.75% (assumed) | 7 | 31 |
| 8. Modeling | 5% (given) | 2 | 26 |
| 9. Securing | 8% (given) | 4 | 21 |

Weights are no longer rescaled: each section gets its exam weight. Largest-remainder rounding gives 45 exactly (sections 1, 2 and 9 get the three leftover questions).

---

## 3. Facts to re-verify before the exam

Content flags: **161** (Ch 1: 19 · Ch 2: 12 · Ch 3: 18 · Ch 4: 19 · Ch 5: 18 · Ch 6: 26 · Ch 7: 27 · Ch 8: 7 · Ch 9: 15), plus 14 in-lab notes.

### Chapter 3 (new)
| Item | What to check |
|---|---|
| External locations and volumes | Privilege names (READ FILES, WRITE FILES, CREATE EXTERNAL TABLE, READ VOLUME, WRITE VOLUME) |
| COPY INTO | FORMAT_OPTIONS / COPY_OPTIONS names; current file-count guidance vs Auto Loader |
| read_files | Option names; the older ``format.`path` `` syntax |
| Auto Loader | Default `schemaEvolutionMode`; whether CSV/JSON default to STRING (`cloudFiles.inferColumnTypes`); file-notification setup |
| Streaming tables | `CREATE OR REFRESH STREAMING TABLE … STREAM read_files(…)` syntax in Databricks SQL |
| Delta Sharing | Shareable asset types; open-sharing authentication (token, OIDC federation); cross-cloud egress |
| Lakeflow Connect / Federation | Supported connectors and sources |
| UI upload | Size limit (about 2 GB at the time of writing), file count, supported formats (Excel is newer) |

### Chapter 8 (new)
| Item | What to check |
|---|---|
| SCD helpers | APPLY CHANGES / AUTO CDC naming in declarative pipelines |
| Keys | Informational PK/FK, the RELY option, identity columns for surrogate keys |
| Medallion conventions | How Databricks currently describes silver modeling (data vault / 3NF vs source-aligned) |
| Product names | Lakeflow Declarative Pipelines vs Delta Live Tables |

### Other chapters
Unchanged from v6.

---

## 4. Findings

### New in v7
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| V1 | Info | **Chapter 3 has no runnable SQL challenges.** COPY INTO, read_files and Auto Loader need cloud storage, which the SQLite sandbox can't simulate. The chapter is covered by the two labs and 26 questions. | None needed |
| V2 | Info | **Upload Wizard progress isn't saved.** The wizard and its mistakes checklist reset when you leave; the completion XP is kept. Intentional, as with the Cache Lab. | None needed |
| V3 | Info | **Scenario pickers restart at scenario 1** when reopened. Solved scenarios stay counted, but you tap Next to reach unsolved ones. | Start at the first unsolved scenario |
| V4 | Info (content) | **Medallion placements are conventions.** Two cards (data vault in silver, ML features in gold) follow common practice that some teams draw differently. Flagged in the lab. | None needed |
| V5 | Info (content) | **Chapters 3 and 8 get 2 Boss questions each** (5% weight). That matches the exam, but their 26-question banks mostly get practiced through chapter tests and spaced repetition. | None needed |

### Carried over
| ID | Severity | Finding | Status |
|---|---|---|---|
| U1 | **Low (matters on iPhone)** | WebKit and iPhone untested | Open. Steps in §7. |
| U2 | Info (content) | Catalog Explorer is a simplified mock | Open; flagged |
| U3 | Info | Sandbox CAST differs from Databricks (`try_cast` now matches) | Open; documented |
| U4 | Info | Catalog Explorer done banner stays until another mission is picked | Open |
| T2 | Info | Live-region announcements not tested with VoiceOver/TalkBack | Open |
| T3, T4 | Info | Cache Lab not saved; Detective/Cache numbers illustrative | Open; by design |
| S5, S6 | Info | Brief spinner on chunk load; noisy crash-test output | Open |
| R5 | Low (content) | Genie lab scores instructions by keyword | Open |
| R6 | Info | Weights for sections 4–7 assumed (15.75% each) | Open. Check the current exam guide. |
| R7 | Info | Readiness estimate shows coverage only | Open (as requested) |
| N4 | Low (content) | Simplified Unity Catalog access model | Open; flagged |
| F3 | Low | Sandbox is SQLite, not Databricks SQL | Open; documented |
| F4, F6 | Low | GROUP BY detection; Boss timer only on the Boss page | Open |
| F7–F10 | Info | Minor UI and model simplifications | Open |

No open Medium or High findings.

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm run verify` (exit 0) | Unit tests, e2e (dev + prod) and build all passed before this push. Commits and the push were gated on exit codes. |
| `npm test` | **146 / 146 pass.** New: Ch 3 and Ch 8 content integrity and minimums; all 9 chapters built and loadable; Ingestion Picker (12 scenarios, 4 explained options, key methods covered); Upload Wizard (file, destination, header, inferred-type rules); Medallion Sorter and Star Schema Builder (explanations, scoring, sanitizing); Ch 8 solutions, the fan-out starter runs and explains, MAX(target) accepted, inner join rejected for the Unknown-member challenge; Boss allocation 5/4/2/7/7/7/7/2/4 = 45 |
| `npm run test:e2e` | **70 pass, 1 skipped** (35 dev + 35 prod; the dev-only crash test is skipped in prod). The webkit project was skipped: WebKit not installed. New: both Ch 3 labs, both Ch 8 labs, Ch 8 challenges, Ch 3 and Ch 8 pages, Boss mix across 9 sections, readiness 9 of 9, no mini-boss |
| `npm run build` | No warnings. Main 360 kB (115 kB gzip). Chunks: ch1 22, ch2 30, ch3 25, ch4 58, ch5 32, ch6 26, ch7 30, ch8 28, ch9 22 kB. New labs: Upload Wizard 12, Ingestion Picker 12, Star Schema 9, Medallion 6, ScenarioPicker 3 kB. `chunk-map.json` lists all 9 chapters. |
| `npm audit` | 0 vulnerabilities |
| Visual check (375 px) | Medallion Sorter (sticky layer bar), Star Schema Builder (sticky table bar added after the first check showed targets too far below the chips), Upload Wizard preview (made to fit after the first check cut off a column); no horizontal page scroll |
| Not tested | WebKit and real phones (U1), screen readers (T2), a full Boss run to timer expiry |

---

## 6. Security and privacy

No change: no backend, no analytics, localStorage only, same-origin chunk loading. Lab state (Catalog Explorer, Medallion Sorter, Star Schema Builder) is sanitized against known ids before use.

---

## 7. Recommended next steps

1. **U1, iPhone check.** On your Mac: `npm run build && npx vite preview --host`, open the Network URL on your iPhone, then turn Wi-Fi off, open an unvisited chapter, turn Wi-Fi on and tap Retry. Also try the tap labs. Optionally run `npx playwright install webkit && npm run test:e2e`.
2. **Two weeks before the exam:** work through §3, then check R6 (section weights 4–7) against the current exam guide.
3. **Study plan:** each chapter's levels → chapter test → daily Review queue → a Boss Battle every few days. Book the exam after scoring 80%+ on two Boss runs in a row.
