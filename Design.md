# Ratchet — Design System and UX Specification

Surfaces covered: web app, GitHub PR body and Check Run, CLI output. Source of truth for tokens: this file; implement as Tailwind v4 `@theme` variables (§3).

---

## 1. Design intent

**Subject:** a verification tool for incident response. **Audience:** engineers under post-incident pressure and the reviewers who must trust the result. **Primary job of the UI:** make a proof legible in seconds.

**The idea behind the look:** a ratchet moves one way and clicks as it advances. Ratchet's pipeline behaves the same: stages and gates only move forward, and a failed gate stops the mechanism rather than reversing it. The interface expresses this with a **sawtooth progress edge** and **stepped, clicking motion** instead of smooth easing.

**The one memorable element:** the **Gate Strip**, a horizontal track with a sawtooth leading edge and two gate markers (parent, fix). It is the hero of the run page, the PR body analogue, and the logo's basis. Everything else stays quiet.

### Design plan review (brief vs. defaults)

| Default I would reach for | Why rejected | What this system does instead |
|---|---|---|
| Grid of identical rounded cards for runs | Chops content into equal boxes, hides sequence | Runs are a **ledger**: dense rows, one outcome glyph per row, one line of reason |
| Gradient wash backgrounds | Decoration, not information | Gradient appears only where it means "cleared" (teeth) and in the brand wordmark |
| Tracked all-caps eyebrow labels above headings | Template chrome | Sentence-case headings; labels only where they identify data |
| `01 / 02 / 03` markers everywhere | Not every list is a sequence | Numbers used only for the actual pipeline order and attempt numbers |
| One radius and one shadow on everything | Flattens hierarchy | Three radii by role; depth via surface tone and 1 px lines, no drop shadows |
| `→` appended to every button | Filler | Buttons say what happens: "Open PR", "Re-verify" |
| Red = error, green = success everywhere | **Wrong for this product.** Gate 1 *expects* red | Test outcomes use red/green; **gate verdicts** use a separate symbol language (§4.1) |

## 2. Principles

1. **Evidence before explanation.** Show the red run and the green run before any prose.
2. **Outcome and verdict are different things.** A test that fails on the parent is red *and* a cleared gate. Never let color alone carry the verdict.
3. **Discards are first-class.** A discard is a product outcome with a reason, not an error state. It is designed with the same care as a success.
4. **One-way motion.** Progress only advances. Nothing animates backward.
5. **Machine text is monospace; human text is not.** Logs, hashes, commands, paths: mono. Everything else: sans.
6. **Quiet by default.** Spend boldness on the Gate Strip; keep the rest disciplined.

## 3. Foundations

### 3.1 Color

Dark-first (the product lives next to terminals and incident dashboards). A light theme is out of scope for v1.

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0C0B16` | App background (indigo-leaning black) |
| `panel` | `#14131F` | Surface for ledger, panels |
| `raised` | `#1C1A2B` | Hover, selected rows, popovers |
| `line` | `#2A2840` | 1 px dividers and borders |
| `bone` | `#EDEBE6` | Primary text (warm off-white, matches the deck) |
| `mute` | `#9A97AD` | Secondary text |
| `faint` | `#6C6982` | Tertiary text, disabled (not for essential info) |
| `magenta` | `#E86AD6` | Brand accent, links, focus ring start |
| `violet` | `#6B3FD4` | Brand midtone, selection |
| `teal` | `#19C3B0` | Brand gradient end |
| `fail` | `#F0454B` | **Test outcome:** failed |
| `pass` | `#3DBE7E` | **Test outcome:** passed |
| `warn` | `#F2B84B` | Flaky, caution, cost nearing cap |
| `info` | `#6FA8FF` | Neutral informational |

**Brand gradient** `tooth`: `linear-gradient(90deg, #E86AD6, #6B3FD4 55%, #19C3B0)`. Allowed on: Gate Strip teeth, wordmark, empty-state illustration. Not allowed on: backgrounds, buttons, cards, text bodies.

**Contrast (verified targets):** `bone` on `ink` ≥ 15:1; `mute` on `panel` ≥ 6:1; `fail`/`pass`/`warn` on `panel` ≥ 4.5:1 for text; non-text indicators ≥ 3:1. Any color pair added later must be checked.

### 3.2 Typography

| Role | Family | Use |
|---|---|---|
| Display | **Inter Tight** (600–700) | Page titles, hero numbers; tight tracking (−0.02em) |
| UI / body | **Inter** (400, 500, 600) | Navigation, forms, tables, prose |
| Machine | **JetBrains Mono** (400, 500) | Logs, stack traces, SHAs, commands, test code |

Fonts self-hosted via `next/font`. Fallbacks: `system-ui, sans-serif` and `ui-monospace, Menlo, monospace`.

**Scale** (rem at 16 px base; line-height in parentheses):

| Token | Size | Use |
|---|---|---|
| `t-display` | 2.75 (1.05) | Run page headline, landing hero |
| `t-title` | 1.75 (1.15) | Page titles |
| `t-heading` | 1.25 (1.3) | Section headings |
| `t-body` | 0.9375 (1.55) | Body, tables |
| `t-small` | 0.8125 (1.45) | Secondary, captions |
| `t-mono` | 0.8125 (1.6) | Logs and code |

Rules: sentence case everywhere; prose line length ≤ 72 characters; tabular figures (`font-variant-numeric: tabular-nums`) for durations, costs, counts; no all-caps labels, no letter-spaced micro-headings.

### 3.3 Spacing, radius, elevation

- Spacing scale (px): 2, 4, 8, 12, 16, 24, 32, 48, 72.
- **Radius by role:** `r-control` 6 px (inputs, buttons, chips), `r-panel` 10 px (panels, dialogs), `r-none` 0 (ledger rows, log viewer, the Gate Strip track).
- **Elevation:** surface tone changes (`ink` → `panel` → `raised`) plus 1 px `line` borders. No drop shadows. Popovers get a 1 px `line` border and a `raised` surface.

### 3.4 Tailwind v4 tokens

```css
@theme {
  --color-ink: #0C0B16;   --color-panel: #14131F;  --color-raised: #1C1A2B;
  --color-line: #2A2840;  --color-bone: #EDEBE6;   --color-mute: #9A97AD;
  --color-faint: #6C6982; --color-magenta: #E86AD6; --color-violet: #6B3FD4;
  --color-teal: #19C3B0;  --color-fail: #F0454B;   --color-pass: #3DBE7E;
  --color-warn: #F2B84B;  --color-info: #6FA8FF;

  --font-display: "Inter Tight", system-ui, sans-serif;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, Menlo, monospace;

  --radius-control: 6px;  --radius-panel: 10px;
  --ease-click: steps(3, end);          /* mechanical advance */
  --dur-click: 140ms;
}
:root { color-scheme: dark; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
```

## 4. Signature components

### 4.1 Gate Strip

A horizontal track representing the verification journey, with **teeth** (a sawtooth edge) as the unit of progress.

```
 ◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣  ◢◣◢◣◢◣◢◣◢◣◢◣◢◣◢◣
 [ Fails on parent ]──────[ Passes on fix ]──────[ Stable ×5 ]──────[ Ship ]
   FAIL  as required        PASS                    5/5
```

**States per gate marker**

| State | Marker | Teeth | Label tone |
|---|---|---|---|
| Pending | Hollow ring (`faint`) | Unfilled, `line` outline | `mute` |
| Running | Ring with a rotating notch (reduced motion: static dot) | Filling, stepped | `bone` |
| Cleared | Filled `tooth` gradient disc with a check glyph | Filled with `tooth` gradient | `bone` |
| Failed | Disc with an X glyph in `fail`, strike through remaining track | Fill stops at the failure; remaining teeth stay outline | `fail` |
| Skipped | Dashed ring | Outline | `faint` |

**Outcome chip (separate from verdict).** Next to each gate marker, a mono chip shows what the test actually did on that state:

| Gate | Observed outcome chip | Verdict (marker) | Helper text |
|---|---|---|---|
| Parent | `FAIL` in `fail` | ✓ cleared | "Failed as required, with `KeyError`." |
| Parent, wrong reason | `ERROR` in `warn` | ✗ failed | "Failed to import `pkg.mod`. This is not the bug." |
| Parent, passes | `PASS` in `pass` | ✗ failed | "Passed on the broken commit, so it doesn't reproduce the bug." |
| Fix | `PASS` in `pass` | ✓ cleared | "Passes on the fix." |
| Fix, fails | `FAIL` in `fail` | ✗ failed | "Still fails on the fix." |

Never rely on chip color alone: chips always carry the text label, and verdict markers always carry a glyph.

**Motion:** when a gate clears, the next group of teeth fills in **three stepped increments** over 140 ms (`steps(3)`), like a pawl advancing. This is the product's single orchestrated motion. Nothing else animates on load.

**Accessibility:** the strip is an ordered list (`<ol>`) with `aria-current="step"` on the running gate; each item exposes "Gate 1 of 4, fails on parent, cleared". Live updates announce via an `aria-live="polite"` region ("Gate 1 cleared. Test failed on the parent commit as required.").

### 4.2 Outcome glyphs (ledger)

| Run status | Glyph | Color | Text |
|---|---|---|---|
| Shipped | Filled tooth disc + check | `tooth` gradient | "Shipped" |
| Discarded | Hollow ring + horizontal bar | `mute` | "Discarded" + reason |
| Running | Ring with notch | `bone` | Stage name |
| Queued | Hollow ring | `faint` | "Queued" |
| Failed (infrastructure) | Triangle outline | `warn` | "Couldn't run" |

"Discarded" is deliberately neutral, not red: Ratchet declining to ship is correct behavior. "Couldn't run" (infrastructure failure) uses `warn` and offers Retry.

### 4.3 Evidence panel

Two columns (stack on narrow screens), same height, mono text:

```
┌─ Parent  9f3c2ab (before the fix) ──────────┬─ Fix  c41d7e0 (the fix) ─────────────────┐
│ FAIL  tests/regression/test_x.py::test_y    │ PASS  tests/regression/test_x.py::test_y │
│ E   KeyError: 'plan_id'                     │ 1 passed in 0.04s                        │
│ app/billing.py:88  charge()                 │                                          │
│ ran 5×  identical                           │ ran 5×  identical                        │
└─────────────────────────────────────────────┴──────────────────────────────────────────┘
 Executed fix-changed lines: app/billing.py 84–91
```
Rules: failing-line highlight uses a 2 px `fail` left rule plus a tinted row (≤ 12% opacity), not color fill alone; line numbers are selectable text; copy button per column; a "Re-verify" button (runs `/verify`).

### 4.4 Ledger row (runs list)

```
 ◉  billing: KeyError on missing plan_id        owner/shop-api     Shipped   PR #482     4m 12s   $0.21
 ○  auth: token refresh race                     owner/shop-api     Discarded Failed to import `pkg.mod` on the parent commit     2m 51s   $0.33
 ◌  search: unicode normalization                owner/search-svc   Verifying  gate 3 of 4                                      1m 08s   $0.10
```
Columns: outcome glyph, title (bug summary, or the exception line if no summary yet), repo, status, result (PR link or discard reason), duration, cost. Rows are links; the whole row is the hit area; hover uses `raised`; zero radius; 1 px `line` between rows.

### 4.5 Reason chip

Used for discards: an outlined chip with the human reason, never the code alone. The code is available on hover and in the details drawer.

| Code | Chip text |
|---|---|
| `PASSES_ON_PARENT` | Doesn't reproduce the bug |
| `WRONG_REASON_COLLECTION_ERROR` | Failed for the wrong reason |
| `NOT_RELEVANT_TO_FIX` | Never touched the fixed code |
| `FLAKY` | Result changed between runs |
| `FAILS_ON_FIX` | Still fails on the fix |
| `BREAKS_EXISTING` | Broke existing tests |
| `ENV_BUILD_FAILED` | Couldn't build the environment |
| `NO_HARNESS_FOUND` | No pytest or Jest setup found |
| `ATTEMPTS_EXHAUSTED` | No valid test after 4 attempts |
| `COST_CAP_REACHED` | Stopped at the cost cap |

## 5. Screens

### 5.1 Sign-in and home (signed out)

Left-aligned. The wordmark in `tooth` gradient, a headline in `t-display`: "Every outage leaves behind a test that proves it can't happen again." One action: "Sign in with GitHub". Beneath it, a static, real-looking Gate Strip (cleared state) with a sample red/green evidence pair. No marketing sections, no feature grid.

### 5.2 Runs (signed in home)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Ratchet      Runs   Benchmark   Repos                           ⌘K   ● login │
├──────────────────────────────────────────────────────────────────────────────┤
│ Runs                                                        [ New run ]      │
│ Filter: [All repos ▾] [Any status ▾] [Last 30 days ▾]                        │
│ ──────────────────────────────────────────────────────────────────────────── │
│  ledger rows (§4.4) …                                                        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```
- Alignment: left; max content width 1120 px; table fills width.
- Empty state: "No runs yet. Paste a stack trace and a fix commit to make your first regression test." plus the "New run" button.
- Loading: 6 skeleton rows (`raised`, no shimmer; reduced-motion safe).
- Keyboard: `j/k` move row focus, `Enter` opens, `n` new run, `/` focuses filter.

### 5.3 New run

Single column form (max 640 px), labels above fields, sentence-case labels.

| Field | Control | Help text |
|---|---|---|
| Repository | Combobox of installed repos | "Install Ratchet on a repo to see it here." |
| Fix | Segmented: Commit / Pull request, then input | "The commit or merged PR that fixed the incident." |
| Stack trace | Mono textarea, drag-and-drop `.txt` | "Paste the trace from your error tracker." |
| Logs (optional) | Mono textarea / file | "We redact secrets and personal data before processing." |
| Options (collapsed) | Attempts, stability runs | Defaults shown |

Primary action: **Start run**. Inline validation on blur with specific messages (§7). A live redaction preview shows "3 secrets and 2 emails will be redacted" with a "Show what changes" toggle (mono diff).

### 5.4 Run detail (the hero page)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ ‹ Runs                                                                       │
│ KeyError when a subscription has no plan_id                       Shipped    │
│ owner/shop-api · fix c41d7e0 · started 4 min ago                  PR #482    │
│                                                                              │
│  [ Gate Strip — §4.1, full width ]                                           │
│                                                                              │
│  [ Evidence panel — §4.3 ]                                                   │
│                                                                              │
│  Test            Timeline                          Attempts                  │
│  ┌────────────┐  Ingest      12s  redacted 3       1  Shipped    claude-…    │
│  │ test code  │  Locate       8s  billing.charge   (earlier attempts listed) │
│  │ (mono)     │  Prepare      3s  cache hit                                  │
│  └────────────┘  Synthesize  24s                                             │
│                  Verify      2m   …                                          │
│                  Publish      6s                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```
- The Gate Strip and Evidence panel are above the fold at 1280×720.
- Tabs below: **Test**, **Timeline**, **Attempts**, **Diff** (source-only fix diff), **Artifacts**.
- **Live behavior:** the page loads a snapshot, then subscribes to SSE; the strip advances as events arrive. While running, show an elapsed timer and a "Cancel run" secondary button.
- **Shipped:** header shows the PR link as the primary action ("Open PR"); secondary: "Re-verify", "Copy reproduce command".
- **Discarded:** replaces the PR action with the **Discard panel** (§5.5).
- **Failed (infrastructure):** warn banner "Couldn't run this one. Nothing was shipped." with "Retry" (resumes from the last good stage).

Timeline rows show stage, duration, and one fact (mono) such as `redacted 3`, `anchor: billing.py:88 charge()`, `image cache hit`, `attempt 2 of 4`.

### 5.5 Discard panel

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Not shipped: failed for the wrong reason                                     │
│                                                                              │
│ The test failed on the parent commit, but not because of the bug:            │
│ it couldn't import `pkg.mod`. A test that fails for another reason           │
│ doesn't prove anything, so Ratchet discarded it.                             │
│                                                                              │
│ Best attempt (4 of 4)      [ view test ]   [ view parent output ]            │
│ What would help: include the fix PR (not a single commit) so the             │
│ dependency set at the parent commit can be rebuilt.                          │
└──────────────────────────────────────────────────────────────────────────────┘
```
Rules: headline states the outcome and reason in plain words; one paragraph explains why discarding is correct; one concrete next step ("What would help") when one exists; the best attempt's evidence remains viewable. No apologetic language, no red.

### 5.6 Benchmark

- Headline numbers are the three from the deck's Proof slide: **replayed**, **shipped and re-verified**, **unverified shipped**, each as a large `t-display` number with a one-line definition beneath. Source line: "From `results.json`, generated <timestamp>, commit <sha7>" with a download link.
- Below: a ledger of per-bug results (bug id, outcome, reason chip, seconds, cost) with filters; a horizontal stacked bar of discard reasons (labels inline, no legend dependency).
- If no benchmark has run: "No benchmark results yet. Run `ratchet replay` to generate them." Never show placeholder numbers.

### 5.7 Repos and settings

Ledger of installed repositories: name, ecosystem detected, last run, enabled toggle. Settings: attempts, stability runs, cost cap per run, retention days, API token (create/revoke), danger zone: delete all data. Sentence-case section headings, forms single-column.

### 5.8 Command palette (`⌘K`)

Actions: New run, Go to run, Go to repo, Copy last reproduce command. Shown as a centered `panel` dialog, `r-panel`, 1 px `line`.

## 6. Non-web surfaces

### 6.1 PR body (Markdown, GitHub-rendered)

Mirrors the Gate Strip with a table (see TRD §10). Principles: verdict symbols plus text ("❌ FAIL on parent — expected"), the red/green evidence in collapsible blocks, the reproduce command as the last line. Because GitHub's Markdown cannot render color reliably, symbols and words carry meaning.

### 6.2 Check Run

Title: "Ratchet verified this test" (success) or "Ratchet couldn't verify this test" (failure on re-verification). Summary: gate table. Annotations: one on the test's first line linking the evidence.

### 6.3 CLI

```
$ ratchet run --repo . --fix c41d7e0 --trace trace.txt
 ratchet  owner/shop-api  fix c41d7e0  parent 9f3c2ab

 ✔ ingest      3 secrets redacted · anchor billing.py:88 charge()
 ✔ locate      2 changed symbols
 ✔ prepare     image cache hit
 ✔ synthesize  attempt 1 of 4
 ✔ gate 1      fails on parent   AssertionError        (expected)
 ✔ relevance   executes billing.py 84–91
 ✔ gate 2      passes on fix
 ✔ stability   5/5 identical on both
 ✔ suite       42 existing tests pass

 Verified. Wrote tests/regression/test_ratchet_missing_plan_id.py
 Evidence: .ratchet/runs/3f9a/evidence/   Re-check: ratchet verify 3f9a
```
Discard example:
```
 ✖ gate 1      failed for the wrong reason: ImportError: pkg.mod

 Not shipped. The test did not fail because of the bug.
 Best attempt: .ratchet/runs/3f9a/attempts/4/test.py
 What would help: pass the fix as a PR so dependencies at the parent can be rebuilt.
```
Rules: works without color (symbols and words carry state); `--json` flag emits `summary.json`; non-zero exit codes: `0` verified, `10` discarded, `20` infrastructure failure, `2` invalid input; honors `NO_COLOR`.

## 7. Copy and voice

Plain verbs, sentence case, active voice, no filler, no apology. An action keeps its name across the flow.

| Moment | Copy |
|---|---|
| Primary create action | "Start run" |
| Run complete toast | "Shipped. PR #482 is open." |
| Discard toast | "Not shipped. See why." |
| Retry | Button "Retry"; toast "Retrying from Verify." |
| Re-verify | Button "Re-verify"; result "Verified again: fails on parent, passes on fix." |
| Invalid fix | "We can't find commit 9f3c2ab in owner/shop-api. Check the SHA or paste the PR URL." |
| Trace not parsed | "We couldn't read a stack trace here. Paste the full trace, starting at 'Traceback' or the error line." |
| No harness | "We couldn't find a pytest or Jest setup in this repo. Ratchet supports those two for now." |
| Cost cap | "Stopped at the $1.50 cost cap. Raise the cap in Settings to try again." |
| Empty runs | "No runs yet. Paste a stack trace and a fix commit to make your first regression test." |
| Redaction notice | "We redact secrets and personal data before processing." |
| Limit statement (docs/footer) | "A verified test proves the fix resolves this reproduction. It doesn't prove every variant of the bug is covered." |

Never use: "Oops", "Something went wrong", "AI-powered magic", "guarantee" (say "check" or "proof of this reproduction").

## 8. Interaction and motion

| Moment | Behavior |
|---|---|
| Gate clears | Teeth fill in 3 stepped increments, 140 ms (`--ease-click`) |
| New SSE event | New timeline row appears without animation; the strip updates; screen-reader announcement |
| Tab/route change | Instant; no page transitions |
| Hover | Surface tone change only (no movement) |
| Buttons | Press: 1 px translate-y; no spring effects |
| Skeletons | Static `raised` blocks |
| Reduced motion | All animation removed; state changes are instant |

Only one non-user-triggered motion exists: the strip advancing in response to real progress. There are no entrance animations on sections or cards.

## 9. Components

| Component | Notes |
|---|---|
| Button | Primary: `bone` text on `violet` fill (contrast ≥ 4.5:1 verified), `r-control`. Secondary: 1 px `line` border, `bone` text. Danger: `fail` text and border. Heights 36/44 px (44 px on touch) |
| Input / textarea | `panel` fill, 1 px `line` border, focus ring 2 px `magenta` with 2 px `ink` offset |
| Combobox, tabs, dialog, tooltip, toast | shadcn/ui on Radix, restyled to tokens |
| Chip | 1 px outline, `r-control`, `t-small`; outcome chips are mono |
| Log viewer | Virtualized list, mono, line numbers, search (`/`), jump to first failure (`f`), wrap toggle, copy; zero radius |
| Diff viewer | Unified/split toggle, mono, add/remove tinted at ≤ 12% with `+`/`−` glyphs (not color alone) |
| Code block | `shiki` theme derived from tokens; copy button |
| Banner | Left 2 px rule in role color; icon plus text; `warn` for infrastructure, `info` for notices |
| Toast | Bottom-left, 4 s, pauses on hover/focus, `aria-live="polite"` |

## 10. Accessibility and quality floor

- WCAG 2.2 AA minimum. Visible keyboard focus on every interactive element (2 px `magenta` ring).
- Target size ≥ 24×24 px (44 px on touch).
- No information by color alone (glyph plus text for every state).
- Logs and diffs are keyboard-navigable and screen-reader readable as text; virtualized lists expose full row counts via `aria-rowcount`.
- Live regions for run progress; no focus stealing on updates.
- `prefers-reduced-motion` and `forced-colors` respected (Gate Strip falls back to text and borders).
- Tested with axe in Playwright on every primary screen; manual screen-reader pass on the run page.

## 11. Responsive behavior

| Breakpoint | Behavior |
|---|---|
| ≥ 1280 px | Full layout as wireframed; evidence panel two columns |
| 768–1279 px | Evidence panel stays two columns, timeline moves below the test; table hides the repo column |
| < 768 px | Single column. Gate Strip becomes a vertical list with the teeth edge on the left; evidence panel stacks (parent above fix); ledger rows become two-line items (title + status/result); tabs become a horizontally scrollable strip |

The log viewer scrolls inside its own container; the page body never scrolls horizontally.

## 12. Iconography and illustration

- Icon set: `lucide-react`, 1.5 px stroke, 16/20 px sizes.
- Custom glyphs: tooth disc (cleared), ring with notch (running), ring with bar (discarded).
- Logo: the word "Ratchet" in Inter Tight 700 with a four-tooth sawtooth underline in the `tooth` gradient. Favicon: single tooth disc.
- No stock illustration or generated imagery. Empty states use the Gate Strip in its pending state.

## 13. Content for the pitch deck (alignment with the deck already drafted)

Use the same tokens so product and deck match: `ink` background, `bone` type, `tooth` gradient on the title and closing slides only, `fail`/`pass` reserved for the two-gate slide. The Proof slide's three numbers are rendered exactly as in §5.6 and sourced from `results.json`.

## 14. Definition of done for UI work

- [ ] Tokens used, no hard-coded hex values in components.
- [ ] Every status shown has glyph plus text, and works without color.
- [ ] Empty, loading, error, and long-content states exist and are checked.
- [ ] Keyboard-only walkthrough of the primary flow passes.
- [ ] axe reports zero serious/critical issues on touched screens.
- [ ] Copy follows §7; no placeholder text, no lorem ipsum.
- [ ] Reduced-motion verified.
- [ ] 375 px, 768 px, and 1280 px screenshots reviewed.
