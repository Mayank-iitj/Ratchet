# Ratchet — Tech Stack

Versions are major/minor lines; pin exact versions in lockfiles (`uv.lock`, `pnpm-lock.yaml`) at scaffold time and verify against current stable releases.

## 1. Summary

| Layer | Choice | Why |
|---|---|---|
| Backend language | **Python 3.12** | Pipeline is subprocess, git, AST, and LLM heavy; first-class ecosystem for pytest/coverage tooling |
| API framework | **FastAPI** + Pydantic v2 | Async, typed schemas double as validation and OpenAPI docs, native SSE via Starlette |
| Job queue | **arq** (Redis) | Async-native, simple, resumable jobs; sufficient without a workflow engine |
| Database | **PostgreSQL 16** | Relational run/attempt/gate model, JSONB for evidence detail, reliable |
| Cache / pub-sub | **Redis 7** | Queue backend and SSE fan-out |
| Artifact store | **S3-compatible** (MinIO local, S3/R2 prod) | Logs, JUnit, coverage, diffs; signed URLs |
| ORM / migrations | **SQLAlchemy 2.0 (async)** + **Alembic** | Mature, explicit |
| Frontend | **Next.js 15** (App Router), **React 19**, **TypeScript 5** | Streaming UI, server components for static pages, strong typing |
| Styling / UI kit | **Tailwind CSS v4** + **shadcn/ui** (Radix primitives) | Fast, accessible components; tokens map directly to `Design.md` |
| Data fetching | **TanStack Query** + native `EventSource` | Cache and revalidation for REST; SSE for live runs |
| CLI | **Typer** (+ Rich) | Typed CLI, clean terminal output |
| Sandbox | **Docker** (rootless) + optional **gVisor (`runsc`)** | Isolation for untrusted code; hardened flags in TRD §13 |
| Code analysis | **tree-sitter** (`py-tree-sitter` + python/javascript/typescript grammars) | Fast, language-agnostic AST for hunk-to-symbol mapping |
| Git | **git CLI** (bare mirrors + worktrees) driven via `asyncio.subprocess`; **GitPython** only for read helpers | Worktrees give cheap parent/fix checkouts |
| GitHub integration | **GitHub App** via **githubkit** | Typed async client, installation tokens, webhooks, Checks API |
| LLM | **Anthropic API** (`claude-sonnet-5-5` primary, `claude-opus-5-5` escalation) behind an adapter | Strong code reasoning; structured output via tool use; prompt caching |
| Test tooling in sandbox | **pytest**, **coverage.py**, **Jest**, **Istanbul/nyc JSON** | Target frameworks + relevance computation |
| Observability | **OpenTelemetry**, **structlog**, **Prometheus** metrics, **Grafana** (optional), **Sentry** | Traces across stages, run-scoped logs |
| Auth | **GitHub OAuth** via **Authlib**; httpOnly signed session cookie | One identity provider, matches the product's users |
| Secrets / config | **pydantic-settings**, `.env` locally; platform secret manager in prod | Typed config |
| CI | **GitHub Actions** | Lint, type-check, unit, integration (gate traps), image build |
| Packaging | **uv** (Python), **pnpm** (Node), **Docker Compose** | Fast, reproducible |

## 2. Backend

| Concern | Library / tool | Notes |
|---|---|---|
| Web server | `uvicorn[standard]` behind `gunicorn` workers (prod) | |
| Validation | `pydantic` v2, `pydantic-settings` | Shared models between API and core |
| HTTP client | `httpx` (async) | Webhook callbacks, artifact calls |
| DB driver | `asyncpg` | |
| Queue | `arq` | Cron jobs for reaper and retention |
| Docker control | `docker` (Docker SDK for Python) | Container lifecycle, labels, limits |
| AST | `tree-sitter`, `tree-sitter-python`, `tree-sitter-javascript`, `tree-sitter-typescript` | Grammars pinned |
| Python introspection | stdlib `ast` for Python-specific static gate | Faster and exact for G0 |
| JS static gate | tree-sitter queries (call-expression denylist) | |
| Coverage parsing | `coverage` JSON, Istanbul JSON | |
| Test output parsing | `junitparser` (pytest), JSON parse (Jest) | |
| Secret detection | `detect-secrets` rules + custom regex/entropy | Redaction pipeline |
| Diffing | `unidiff` + `git diff --unified=0` | |
| LLM SDK | `anthropic` (official) | Wrapped by `LLM` protocol |
| Tokens | Anthropic token counting endpoint / tiktoken-style estimator fallback | Budgeting |
| Retry | `tenacity` | Backoff with jitter |
| CLI | `typer`, `rich` | |
| Lint / format | `ruff`, `ruff format` | |
| Types | `mypy --strict` on `packages/core` | |
| Tests | `pytest`, `pytest-asyncio`, `hypothesis`, `testcontainers` | Ratchet's own tests |

## 3. Frontend

| Concern | Choice |
|---|---|
| Framework | Next.js 15, App Router, TypeScript strict |
| UI | shadcn/ui on Radix primitives, Tailwind v4 design tokens (see `Design.md`) |
| Icons | `lucide-react` |
| Fonts | `Inter Tight` (display/UI headings), `Inter` (UI/body), `JetBrains Mono` (logs, code, hashes) via `next/font` (self-hosted) |
| Live run updates | `EventSource` with `Last-Event-ID` resume; TanStack Query for the REST snapshot |
| Diff / log viewer | `react-diff-view` (or `diff2html`) and a virtualized log list (`@tanstack/react-virtual`) |
| Charts (benchmark page) | `visx` or `recharts` (small, static) |
| Forms | `react-hook-form` + `zod` (schemas mirrored from API) |
| Syntax highlighting | `shiki` |
| Testing | `vitest`, `@testing-library/react`, `playwright` (E2E for the run flow) |
| Accessibility | `eslint-plugin-jsx-a11y`, `axe-core` in Playwright |

## 4. Sandbox and runtime images

| Image | Contents |
|---|---|
| `ratchet/runner-py:3.8 … 3.12` | Python, git, build-essential, `pytest`, `coverage`, `uv`, `pip` |
| `ratchet/runner-node:18, 20, 22` | Node, git, build tools, `npm`, `pnpm`, `yarn`; Jest comes from the project's own devDependencies |
| `ratchet/egress-proxy` | Allow-list proxy (e.g. Squid) for the dependency-install phase only |

Dependency layers are cached by manifest hash in a local registry (`registry:2`).

## 5. Infrastructure

### Local / hackathon (single host)

`docker compose up` runs: `api`, `worker`, `web`, `postgres`, `redis`, `minio`, `registry`, `egress-proxy`. The worker mounts the host Docker socket (or a rootless Docker socket) to launch sandboxes. For demos, pre-warm the dependency-image cache for the chosen repos.

### Production

| Piece | Option |
|---|---|
| App hosting | A VM or container platform with Docker access for workers (workers need a container runtime; most serverless platforms do not allow this) |
| Workers | Dedicated hosts (e.g. an EC2/GCE instance or Fly Machines) running rootless Docker + gVisor |
| Database | Managed Postgres |
| Redis | Managed Redis |
| Object storage | S3 or Cloudflare R2 |
| Frontend | Same host behind a reverse proxy (Caddy/Nginx), or Vercel for the web app with the API on the worker host |
| TLS / DNS | Caddy automatic TLS |
| Secrets | Platform secret manager; GitHub App private key never in the image |

## 6. Project conventions

| Area | Convention |
|---|---|
| Branching | Trunk-based; short-lived feature branches |
| Commits | Conventional Commits |
| Python | `ruff` + `mypy --strict` on core; 100-char lines |
| TypeScript | `strict`, ESLint with a11y plugin, Prettier |
| Tests | Gate-trap fixtures are mandatory for any change to `packages/core/verify` |
| Docs | These four files live in `/docs`; changes to gates require TRD update in the same PR |

## 7. CI pipeline (GitHub Actions)

1. **lint-type:** `ruff`, `mypy`, `eslint`, `tsc --noEmit`
2. **unit:** parsers, redaction, classifiers, ranking
3. **gate-traps:** integration tests on fixture repos using scripted candidates (needs Docker)
4. **web:** `vitest` + `playwright` against a stubbed API
5. **images:** build and push runner images on changes under `sandbox/`
6. **nightly:** golden E2E (real LLM, small set) and benchmark smoke subset

## 8. Quick start

```bash
# prerequisites: Docker, Python 3.12, uv, Node 22, pnpm
git clone <repo> ratchet && cd ratchet
cp .env.example .env            # add ANTHROPIC_API_KEY (+ GitHub App values for remote mode)
uv sync                          # Python deps
pnpm -C apps/web install         # web deps
docker compose up -d postgres redis minio registry egress-proxy
uv run alembic upgrade head
docker build -t ratchet/runner-py:3.12 sandbox/images/runner-py
docker build -t ratchet/runner-node:22 sandbox/images/runner-node

# run the services
uv run uvicorn ratchet_api.main:app --reload --port 8000
uv run arq ratchet_worker.WorkerSettings
pnpm -C apps/web dev

# local CLI mode (no GitHub App required)
uv run ratchet run --repo ./path/to/clone --fix <sha> --trace trace.txt --logs app.log

# independent re-verification
uv run ratchet verify <run_id>

# replay benchmark subset
uv run ratchet replay --benchmark bugsinpy --subset v1
```

## 9. Rejected alternatives

| Option | Why not |
|---|---|
| Temporal / Airflow for orchestration | Overkill for a single linear pipeline with stage persistence; arq plus a state machine is enough. Revisit at scale |
| Firecracker microVMs | Stronger isolation but heavy operational cost for v1; Docker plus gVisor meets the threat model |
| LLM-as-judge for verification | Non-deterministic and the very failure mode Ratchet exists to avoid; verification is execution-based |
| Running tests in CI runners (GitHub Actions) instead of own sandbox | Per-run latency, queueing, and limited control over historical environments |
| Serverless functions for workers | No container runtime access; long-running jobs |
| Mutation-testing frameworks as a required gate | Slow and language-specific; the parent/fix pair already provides a targeted mutation (the real bug). Considered as a future optional gate |
| NextAuth/Auth.js for auth | Auth is owned by the API; avoids duplicate session systems |
