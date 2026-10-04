# Lakehouse Quest: Build Audit (v8, fact-check round)

**Audit date:** 2026-10-04
**Scope:** branch `claude/databricks-exam-study-game-ck55dn` at `bfdeb62`, plus this audit commit (README, FACTCHECK.md, AUDIT.md)
**Exam guide version targeted:** Oct 30, 2025, which is still the current guide (checked Oct 2026)
**Overall:** No new features. Every "Verify in Databricks docs" flag was checked against official Databricks sources. **Flags: 161 + 16 lab notes → 1 + 1.** Section weights now come from the official exam page. `npm run verify` passed before this push: 146 unit tests, 70 e2e tests (35 dev + 35 prod), and the build. **iPhone: tested by you, looks good** (U1 closed).

Full per-flag record: **`FACTCHECK.md`**.

---

## 0. Changes since audit v7

| Commit | Change |
|---|---|
| `138dd2e` | Chapters 7 and 6: 53 flags resolved. Genie runs on the author's embedded warehouse credentials with data checked as the user; trusted assets are parameterized queries or UC functions (**answer changed**); Monitor tab and "Is this correct?" feedback; dashboard "Share/Individual data permissions"; cross-filtering scope; alert states and aggregation. Dashboard Config lab relabelled. |
| `9f8aeee` | Chapter 5: 17 of 18 resolved. `OPTIMIZE FULL` reclusters existing data (**answer changed**); Photon doesn't support UDFs; performance insights; result cache 24 h and the serverless remote cache. Four lab notes. |
| `0c0892c` | Chapter 1: 18 of 19 resolved. Renames mapped (Lakeflow pipelines, Genie Code, AI Search, OpenSharing, AI assistive features); Marketplace assets and requirements; certification system tag. |
| `a17a03f` | Chapter 4: all 19. Genie Code slash commands; warehouse feature matrix; federation; MV refresh syntax; NULLS FIRST; UNDROP 7 days; CREATE OR REPLACE keeps grants and masks; VACUUM. |
| `6245be4` | Chapter 2: all 12 (also closes the last Ch 1 flag). Tag syntax and permissions, governed tags, lineage retention, BROWSE, ANSI default, Sample Data privileges. |
| `7e1824f` | Chapter 3: all 18 plus 2 unflagged fixes. Upload formats and limits (no XML or Excel; header on by default); Auto Loader infers JSON/CSV as STRING; OpenSharing auth; COPY INTO "thousands of files". |
| `40b34ef` | Chapter 9: all 15. Parent owners can manage children; who can grant; BROWSE/MANAGE; admin roles; DENY not supported in UC (ABAC DENY policies are Beta); row filter/mask compute; one metastore per region. |
| `bfdeb62` | Chapter 8: all 7. **Official section weights** (4: 20, 5: 15, 6: 16, 7: 12) and the new Boss mix. Remaining lab flags turned into plain notes; Genie lab "Trusted" relabelled "Verified answer". |
| this commit | `FACTCHECK.md`, README (guide still current, weights source), audit v8 |

---

## 1. This round's requirements

| Requirement | Status | Notes |
|---|---|---|
| Official sources only, stop if unreachable | ✅ | First attempt: docs.databricks.com and databricks.com were blocked by the network policy, so I stopped and reported it. After you enabled full access, every check used docs.databricks.com, the official exam page and guide PDF, and two databricks.com pages (Data Vault glossary, medallion blog) where docs were silent. |
| Work order 7, 6, 5, 1, 4, 2, 3, 9, 8 | ✅ | One commit per chapter in that order (Ch 7 and 6 together) |
| CONFIRMED / FIXED / UNRESOLVED per flag | ✅ | 161 content flags: **103 confirmed, 57 fixed, 1 unresolved**. 16 lab notes: **8 confirmed, 7 fixed, 1 unresolved**. |
| Answer changes update question, all explanations and tests together | ✅ | 2 answers changed (c7-q-parameterized, c5-q-liquid-optimize); distractor explanations rewritten. Label and weight changes updated their e2e and unit tests (Dashboard Config option, Genie "Verified answer", Boss mix). |
| Newer exam guide? | ✅ **No** | The official page still links the Oct 30, 2025 PDF; guide version unchanged |
| Published section weights (R6) | ✅ **Yes** | From the official exam page. Sections 4–7 are now 20 / 15 / 16 / 12 %. Boss mix 5/4/2/**9**/7/7/**5**/2/4. R6 closed. |
| FACTCHECK.md with "things you may have learned wrong" | ✅ | Two answer changes, plus a list of lesson facts that were wrong or outdated, at the top |

---

## 2. Content inventory (unchanged except flags)

| Ch | Questions (scenario) | SQL | Verify flags (v7 → v8) |
|---|---|---|---|
| 1 | 26 (16) | 0 | 19 → 0 |
| 2 | 26 (19) | 9 | 12 → 0 |
| 3 | 26 (20) | 0 | 18 → 0 |
| 4 | 42 (15) | 19 | 19 → 0 |
| 5 | 26 (15) | 6 | 18 → **1** |
| 6 | 28 (13) | 0 | 26 → 0 |
| 7 | 31 (15) | 0 | 27 → 0 |
| 8 | 26 (19) | 5 | 7 → 0 |
| 9 | 21 (9) | 0 | 15 → 0 |
| **Total** | **252 (141)** | **39** | **161 → 1**, lab notes **16 → 1** |

### Boss weighting (official)
| Section | Weight | Questions (of 45) |
|---|---|---|
| 1. Platform | 11% | 5 |
| 2. Managing Data | 8% | 4 |
| 3. Importing | 5% | 2 |
| 4. Querying | **20%** | **9** |
| 5. Analyzing | 15% | 7 |
| 6. Dashboards | 16% | 7 |
| 7. Genie | **12%** | **5** |
| 8. Modeling | 5% | 2 |
| 9. Securing | 8% | 4 |

---

## 3. Remaining flags

| Item | Why it's still flagged |
|---|---|
| c5-q-cache-result | Docs confirm the 24-hour life and invalidation but don't define what makes two queries "the same" for the result cache. The answer itself is unaffected. |
| Namespace Builder INSERT note | The docs conflict: the privileges reference says MODIFY users "must also have SELECT", while the permissions-concepts table lists only USE CATALOG + USE SCHEMA + MODIFY for writes. The lab keeps MODIFY and advises granting both. |

Naming risk to keep in mind: the exam guide uses pre-2026 names ("Delta Live Tables", "Databricks Assistant", "Genie spaces", "Delta Sharing"). The app teaches those names first and gives the current product names beside them.

---

## 4. Findings

### New in v8
| ID | Severity | Finding | Suggested fix |
|---|---|---|---|
| W1 | Info (content) | **Product renames since the guide.** Docs now say Lakeflow pipelines, Genie Code, Genie Agents, OpenSharing, AI Search, AUTO CDC. The exam may use either name. | Done: both names shown. Re-check the guide two weeks before the exam. |
| W2 | Info | **Two docs-level ambiguities remain** (§3). | None possible from the app side |
| W3 | Info | **The weight change shifts practice toward Querying** (Boss: 9 Querying, 5 Genie). Chapter 4 has the largest pool (42), so there's no shortage. | None needed |

### Carried over
| ID | Severity | Finding | Status |
|---|---|---|---|
| U1 | Low | WebKit and iPhone untested | ✅ **Closed:** you tested on iPhone ("looks good") |
| R6 | Info | Weights for sections 4–7 assumed | ✅ **Closed:** official weights in use |
| R5 | Low (content) | Genie lab scores instructions by keyword | Open |
| R7 | Info | Readiness estimate shows coverage only | Open (as requested) |
| N4 | Low (content) | Simplified Unity Catalog access model | Open; lab note now matches the docs and states the one conflict |
| F3 | Low | Sandbox is SQLite, not Databricks SQL | Open; documented |
| F4, F6 | Low | GROUP BY detection; Boss timer only on the Boss page | Open |
| T2 | Info | Live-region announcements not tested with VoiceOver/TalkBack | Open |
| T3, T4, U2–U4, V1–V5 | Info | Lab simplifications and minor UX notes | Open; by design |
| S5, S6 | Info | Brief spinner on chunk load; noisy crash-test output | Open |

No open Medium or High findings.

---

## 5. Verification evidence

| Check | Result |
|---|---|
| `npm run verify` (exit 0) | Unit tests, e2e (dev + prod) and build all passed before this push. Each chapter commit was gated on `npm test` exit codes. |
| `npm test` | **146 / 146 pass.** Updated: section weights equal the official values; rescaled weights; 45-question mix 5/4/2/9/7/7/5/2/4 |
| `npm run test:e2e` | **70 pass, 1 skipped** (35 dev + 35 prod; the dev-only crash test is skipped in prod). Updated: Boss mix, Dashboard Config option label, Genie "Verified answer" |
| `npm run build` | No warnings. Main 359 kB (115 kB gzip) |
| `npm audit` | 0 vulnerabilities |
| Flag count | Script over all chapter data: 1 `verify` field left (c5-q-cache-result); 1 lab note (Namespace Builder) |
| iPhone | Tested by you: looks good |

---

## 6. Security and privacy

No change.

---

## 7. Recommended next steps

1. **Relearn** the two changed answers and the "facts that were wrong" list at the top of `FACTCHECK.md`.
2. **Two weeks before the exam:** check the official exam page for a new guide version or changed weights (the guide asks for this too).
3. **Study plan:** levels → chapter tests → daily Review → Boss Battles. Book once you score 80%+ twice in a row.
