# Ratchet — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | Ratchet |
| **Track** | Developer Tools |
| **Author** | Mayank Sharma |
| **Version** | 1.0 |
| **Status** | Ready for build |
| **Companion docs** | `TRD.md`, `Techstack.md`, `Design.md` |

---

## 1. Summary

Ratchet turns every production incident into a **verified regression test**.

Given a stack trace, surrounding logs, and the commit that fixed the incident, Ratchet synthesizes a candidate test and then proves it. The test must **fail on the parent commit** (it reproduces the bug) and **pass on the fix commit** (the fix is what resolves it). It must also fail for the *right reason*, be deterministic, and not break the existing suite. Only tests that clear every gate are shipped, as a pull request with the evidence attached. Everything else is discarded with a stated reason.

**One-line pitch:** Others generate tests. Ratchet proves them.

## 2. Problem

- A bug hits production at 2 a.m. Someone finds the cause, ships the fix, closes the incident.
- The regression test that would stop recurrence is the one thing that never gets written. Teams know they should; by the time the fire is out, nobody has the hours.
- Existing AI test generators close part of the gap, but they output tests that *look* right. A generated test that never failed on the buggy code proves nothing: it may pass for the wrong reason, assert nothing meaningful, or be flaky. Reviewers cannot tell without re-doing the work, so unverified generated tests either get rubber-stamped (false confidence) or ignored (no value).

**Core insight:** a test is only real if it fails first. Verification, not generation, is the hard part.

## 3. Target users

| Persona | Context | Job to be done |
|---|---|---|
| **On-call / incident engineer** (primary) | Just shipped a hotfix, wants to close the incident | "Leave behind a test that proves this can't recur, without spending my afternoon." |
| **Reviewer / tech lead** | Reviews PRs, owns reliability | "Confirm in seconds that a regression test is legitimate." |
| **Engineering manager / SRE lead** | Owns postmortem action items | "Make 'add regression test' an action item that actually completes." |

Initial ecosystems: **Python (pytest)** and **JavaScript/TypeScript (Jest)**, hosted on **GitHub**.

## 4. Goals and non-goals

### Goals
1. Given a valid incident input, produce a regression test that is **provably** fail-before / pass-after, and open a PR carrying the proof.
2. **Never ship an unverified test.** Precision over recall.
3. Make the proof legible: a reviewer can confirm the claim from the PR alone in under 30 seconds.
4. Work on real repositories with zero per-repo configuration (automatic harness discovery).
5. Be measurable: a public replay benchmark reports yield, precision, time, and cost on real historical bugs.

### Non-goals (v1)
- Generating fixes or patches for bugs. Ratchet starts *after* a fix exists.
- General-purpose test generation or coverage improvement.
- Languages other than Python and JS/TS; test frameworks other than pytest and Jest.
- Non-GitHub hosts (GitLab, Bitbucket).
- Integration/E2E tests requiring external services, browsers, or databases.
- Log-only mode (no fix commit). It is on the roadmap, not in v1.

## 5. Core concept and invariants

These hold for every shipped test. They are product requirements, not implementation details.

| # | Invariant | Meaning |
|---|---|---|
| I-1 | **Fails on parent** | On the commit before the fix, the new test fails. |
| I-2 | **Right-reason failure** | It fails with an assertion failure or the exception type recorded in the incident, not a syntax, import, collection, or fixture error. |
| I-3 | **Relevant** | On the parent run, the failing test executes code touched by the fix. |
| I-4 | **Passes on fix** | On the fix commit, the new test passes. |
| I-5 | **Stable** | The result is identical across repeated runs in both states. |
| I-6 | **Non-destructive** | The new test does not break any existing test; the diff adds one test file and changes no source files. |
| I-7 | **Evidence-attached** | The PR contains the failing run, the passing run, and the diff between them. |

If any invariant fails after the retry budget, the candidate is **discarded** and never shipped.

## 6. User stories

| ID | As a… | I want… | So that… |
|---|---|---|---|
| US-1 | On-call engineer | to paste a stack trace, logs, and the fix commit (or fix PR URL) and get a PR | I close the incident with a regression test in minutes |
| US-2 | On-call engineer | to see live progress through each pipeline stage | I know whether to wait or move on |
| US-3 | Reviewer | the PR to show the red run on the parent and the green run on the fix side by side | I can confirm the claim without re-running anything |
| US-4 | Reviewer | to re-run verification with one command | I can independently trust the evidence |
| US-5 | Tech lead | discarded candidates to show *why* they were discarded | I understand Ratchet's limits and trust what it does ship |
| US-6 | Developer | to run Ratchet locally against my own clone | I can use it without installing a GitHub App |
| US-7 | Tech lead | to install Ratchet on selected repos and trigger it from an issue label or PR label | it fits into our incident workflow |
| US-8 | Evaluator / judge | to see replay-benchmark results on public bugs | I can judge Ratchet on evidence, not claims |

## 7. Functional requirements

Priority: **P0** = must ship in v1 / demo, **P1** = should ship, **P2** = stretch.

### 7.1 Ingest

| ID | Requirement | Priority |
|---|---|---|
| FR-1 | Accept an incident via web form, CLI, or GitHub issue label with: repository, fix reference (commit SHA **or** merged PR URL), stack trace (text), and optional logs (text or file). | P0 |
| FR-2 | Resolve the **parent commit** automatically: for a single commit, its first parent; for a merged PR, the base commit immediately before the PR's changes. | P0 |
| FR-3 | Parse Python tracebacks and Node.js stack traces into structured frames (file, line, function), exception type, and message; normalize paths relative to repo root. | P0 |
| FR-4 | Redact secrets and PII (tokens, keys, emails, IPs) from logs and traces before any LLM call or storage; show a redaction count in the UI. | P0 |
| FR-5 | Truncate and prioritize logs (keep lines near the error, dedupe repeated lines) to fit the model budget. | P0 |
| FR-6 | Reject invalid inputs with a specific, actionable message (e.g. "Fix commit not found in this repository"). | P0 |

### 7.2 Locate

| ID | Requirement | Priority |
|---|---|---|
| FR-7 | Compute the diff between parent and fix; separate **source changes** from **test changes**. | P0 |
| FR-8 | Map diff hunks to enclosing functions/classes (AST based) and intersect with stack-trace frames to rank the most likely failing symbols. | P0 |
| FR-9 | **Strip test changes from the fix diff before it is shown to the model** (prevents leaking the maintainer's own test, which would invalidate benchmarking). | P0 |
| FR-10 | Collect conventions context: nearest existing tests for the changed modules, fixtures, imports, naming style. | P0 |

### 7.3 Synthesize

| ID | Requirement | Priority |
|---|---|---|
| FR-11 | Generate exactly one candidate test file containing one focused regression test (plus minimal helpers), placed per the repo's conventions. | P0 |
| FR-12 | Generated tests must be deterministic: no network, no sleeps, no wall-clock or randomness dependence unless seeded or mocked. | P0 |
| FR-13 | Iterative repair: if a gate fails, feed the structured failure output back and retry up to a configured budget (default 4 attempts). | P0 |
| FR-14 | The model returns a structured expectation (expected exception type or assertion intent) that Gate 1 checks against. | P0 |

### 7.4 Verify

| ID | Requirement | Priority |
|---|---|---|
| FR-15 | **Gate 0 (static):** parses, touches only the allowed test path, no source modification, no forbidden calls. | P0 |
| FR-16 | **Gate 1 (parent):** test fails; failure is an assertion/expected-exception failure, not a collection/import/fixture error. | P0 |
| FR-17 | **Relevance gate:** on the parent run, the failing test executes at least one line within the fix's changed regions. | P0 |
| FR-18 | **Gate 2 (fix):** test passes. | P0 |
| FR-19 | **Stability gate:** both states are run repeatedly (default 5×); outcomes must be identical every time. | P0 |
| FR-20 | **Suite-safety gate:** the new test plus the existing tests for touched modules pass together on the fix commit. | P1 |
| FR-21 | All runs execute in an isolated sandbox with no network, resource limits, and a hard timeout. | P0 |
| FR-22 | Every discard has a machine-readable reason code and a human-readable explanation. | P0 |

### 7.5 Ship

| ID | Requirement | Priority |
|---|---|---|
| FR-23 | Open a PR from a `ratchet/<incident-id>` branch containing only the new test file. | P0 |
| FR-24 | PR body includes: incident summary, gate results table, failing output on parent (truncated), passing output on fix, diff stat, and a one-line reproduce command. | P0 |
| FR-25 | Publish a GitHub **Check Run** on the PR summarizing gate results. | P1 |
| FR-26 | Idempotency: re-running the same incident updates the existing PR rather than creating duplicates. | P0 |
| FR-27 | `ratchet verify <pr-or-run-id>` re-executes both gates independently from the PR contents. | P1 |

### 7.6 Product surfaces

| ID | Requirement | Priority |
|---|---|---|
| FR-28 | **Web app:** sign in with GitHub, install on repos, submit incidents, view runs list, live run detail with the Gate Strip, evidence view, discard explanations. | P0 |
| FR-29 | **CLI:** `ratchet run`, `ratchet verify`, `ratchet replay` with local (no GitHub) mode that writes an evidence folder and patch. | P0 |
| FR-30 | **GitHub App:** trigger by labeling an issue `ratchet` with the fix PR linked; webhook-driven. | P1 |
| FR-31 | **Benchmark page** showing replay results with downloadable `results.json`. | P0 |
| FR-32 | Run history with filters (status, repo, date) and per-run cost and duration. | P1 |

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| **Correctness** | 0 shipped tests that fail independent re-verification (hard requirement; measured in benchmark). |
| **Performance** | Median end-to-end ≤ 6 min on cached environments; p95 ≤ 15 min; per-stage timeouts enforced. |
| **Cost** | Median LLM cost ≤ $0.40 per shipped test; hard cap per run (default $1.50). |
| **Security** | Untrusted code runs only in the sandbox; no network during execution; secrets never reach LLM or logs; least-privilege GitHub App permissions. |
| **Reliability** | Jobs are idempotent and resumable per stage; transient failures retried with backoff; no orphaned containers or worktrees. |
| **Observability** | Structured logs, per-stage metrics, traces, and an immutable event timeline per run. |
| **Accessibility** | WCAG 2.2 AA for the web app; the CLI output works without color. |
| **Privacy** | Repo contents are processed ephemerally; artifacts retained for a configurable period (default 30 days); delete-on-request. |

## 9. Key user flows

### Flow A: Web, incident to PR
1. Sign in with GitHub, pick a repository.
2. Paste the stack trace and logs; enter the fix commit SHA or merged PR URL. Submit.
3. Run page opens. Pipeline stages advance live: Ingest, Locate, Synthesize, Verify, Ship. The Gate Strip fills as gates clear.
4. Outcome: **Shipped** (link to PR, evidence panel) or **Discarded** (reason code, explanation, the best attempt's output).

### Flow B: GitHub-native
1. Developer labels the incident issue `ratchet` (the issue links the fix PR).
2. Ratchet comments with a link to the run, then opens the test PR (or comments why it discarded).

### Flow C: CLI, local
```
ratchet run --repo . --fix 9f3c2ab --trace trace.txt --logs app.log
```
Outputs a patch, the evidence folder (`evidence/parent.log`, `evidence/fix.log`, `evidence/summary.json`), and a terminal summary of gate results.

### Flow D: Reviewer verification
Open the PR, read the evidence table, optionally run `ratchet verify <pr-url>`.

## 10. Success metrics

Measured by the replay benchmark (see `TRD.md` §15) and live usage.

| Metric | Definition | v1 target |
|---|---|---|
| **Verified-shipped precision** | Shipped tests that pass independent re-verification / shipped tests | **100%** |
| **Yield** | Bugs producing a shipped test / bugs replayed | ≥ 50% on the chosen benchmark subset |
| **Right-reason rate** | Shipped tests whose parent failure matches the recorded exception/assertion | ≥ 95% (invariant-enforced; audited manually on a sample) |
| **Median time to PR** | Ingest to PR opened | ≤ 6 min |
| **Median cost per shipped test** | LLM spend / shipped tests | ≤ $0.40 |
| **Reviewer confirmation time** | Time for a reviewer to confirm a PR's claim (user test) | ≤ 30 s |

Targets are goals, not results. The deck's proof slide is filled directly from `benchmark/results.json`; no number is shown that the harness did not produce.

## 11. Scope

### v1 (build now)
- Python/pytest and JS-TS/Jest, GitHub only.
- Web app, CLI (including local mode), GitHub App trigger (P1).
- All gates in §7.4 (suite-safety P1).
- Replay benchmark with a published results file.

### Next
- Additional ecosystems (Go `testing`, JUnit, Vitest, RSpec).
- **Log-only mode** for bugs with no clean fix commit: generate a hypothesis test, hold it as pending, and verify automatically when a fix lands.
- CI check on incident closure (block "resolved" until a verified regression test exists).
- Integrations: Sentry, PagerDuty, Datadog, Linear/Jira.

## 12. Risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Test fails on parent for the wrong reason (import error, bad fixture, flakiness) | False proof | Gate 1 classifies failure type; relevance gate requires execution of changed lines; stability gate repeats runs |
| Environment cannot be reproduced at the historical commit | Low yield | Per-state environment builds, layered image cache, explicit `ENV_BUILD_FAILED` discard reason, benchmark reports it |
| Fix commit also contains the maintainer's test (leakage) | Inflated benchmark | Test-file changes stripped before the model sees the diff |
| Fix commit mixes unrelated changes | Poor localization | Stack-trace/diff intersection ranking; relevance gate; discard if no overlap |
| Prompt injection via logs, comments, or code | Malicious test or exfiltration | Inputs treated as data; structured output only; static gate; sandbox with no network; test never executed outside sandbox |
| LLM cost or latency blowup | Unusable | Per-run token/cost caps, attempt budget, prompt caching, cheaper model first |
| Flaky infrastructure produces false discards | Lower yield | Retries for infra errors distinguished from test failures |
| Overclaiming ("permanent guarantee") | Credibility | Copy says "a permanent check that it stays fixed"; docs state limits |

## 13. Competitive and prior-art landscape

| Approach | What it does | Gap Ratchet fills |
|---|---|---|
| IDE assistants and AI test generators (Copilot, Cursor, Qodo-style tools) | Generate tests that look plausible | No proof the test fails before the fix |
| Coverage-oriented generators (Diffblue-style, TestGen-style filters) | Keep tests that compile, pass, and raise coverage | Optimize coverage, not bug reproduction |
| Research on issue-to-reproduction tests and the SWE-bench "fail-to-pass" convention | Establish that a valid test must fail before and pass after | Not packaged as a workflow that ends in a reviewable PR with evidence |
| Autonomous fix agents (Sweep, Devin-style) | Produce patches | Start before a fix; Ratchet starts after it and locks it in |

**Differentiator:** both-state verification, plus relevance and stability gates, plus evidence shipped in the PR.

## 14. Milestones

Assumes a hackathon-scale build; scale proportionally.

| Phase | Deliverable | Exit criteria |
|---|---|---|
| **M0 Foundations** | Repo scaffold, sandbox runner, git worktree manager, DB schema | Runs `pytest` in sandbox against two commits and captures structured results |
| **M1 Core pipeline (Python)** | Ingest, Locate, Synthesize, Verify (all gates) for pytest, CLI local mode | 5 hand-picked bugs end-to-end with evidence folder |
| **M2 JS/Jest** | Same pipeline for Jest | 3 hand-picked JS bugs end-to-end |
| **M3 Ship** | PR publisher, evidence formatting, idempotency | PR opened on a sandbox repo with correct evidence |
| **M4 Product surface** | Web app, live run page, GitHub App trigger | Full web flow works against a fresh install |
| **M5 Benchmark** | Replay harness on BugsInPy and BugsJS subsets, `results.json`, benchmark page | Published metrics; proof slide populated from file |
| **M6 Polish and demo** | Demo script, failure-mode handling, deck | Dry run ≥ 3 times with no manual intervention |

## 15. Demo and submission plan

**90-second live demo:**
1. Show a real incident: stack trace and the fix PR from a public repo (pre-chosen, pre-warmed environment cache).
2. Submit. The Gate Strip animates: Ingest, Locate, Synthesize.
3. Verify: the parent run goes **red** (expected), the fix run goes **green**, stability repeats tick through.
4. PR opens with the evidence table. Click through to the diff.
5. **Show a discard:** a second input where the candidate fails Gate 1 for the wrong reason, with the reason displayed. This is the proof that Ratchet refuses to ship what it cannot prove.
6. Close on the benchmark page: replayed, shipped, precision.

**Fallback:** recorded run of the same flow plus the local CLI demo (no network dependence except the LLM).

**Deck requirements:** every number on the Proof slide comes from `results.json`; the Next slide states log-only mode and CI check as roadmap; no placeholder text.

## 16. Decisions on previously open questions

| Question | Decision |
|---|---|
| Which model? | Claude via an adapter (default `claude-sonnet-5-5`, escalate to `claude-opus-5-5` on late repair attempts); the adapter keeps the pipeline model-agnostic |
| Where does the PR go? | Target repo for installed GitHub App; fork-and-PR in local/public demo mode |
| What if the fix has no tests in the repo at all? | Ratchet creates a new test file following the language default layout; if no harness is detectable, discard with `NO_HARNESS_FOUND` |
| Multiple bugs in one fix? | One candidate per incident; Ratchet does not split fixes |

## 17. Glossary

- **Parent commit:** the commit immediately before the fix.
- **Fix commit:** the commit (or merged PR) that resolved the incident.
- **Candidate test:** an LLM-generated test not yet verified.
- **Gate:** a pass/fail check a candidate must clear to ship.
- **Yield:** fraction of replayed bugs for which Ratchet shipped a verified test.
- **Discard:** a candidate that failed a gate after the retry budget; never shipped.
- **Evidence bundle:** the logs, results, and diff proving the invariants for one shipped test.
