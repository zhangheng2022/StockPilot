# Cloudflare Fullstack Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert StockPilot into a single Cloudflare Worker deployment that serves the Nuxt frontend and Hono API from one origin.

**Architecture:** Nuxt generates static frontend assets into `.output/public`. A Hono Worker owns `/api/*`, D1 access, and Cron `scheduled()` jobs, and falls back to the Cloudflare `ASSETS` binding for frontend requests.

**Tech Stack:** Nuxt 4, Cloudflare Workers, Hono, Cloudflare D1, Cron Triggers, Vitest, Wrangler.

---

### Task 1: Worker Dependencies and Scripts

**Files:**
- Modify: `package.json`
- Modify: `wrangler.jsonc`

- [ ] Add `hono`, `vitest`, `typescript`, and Workers types.
- [ ] Change production build to `nuxt generate`.
- [ ] Point Wrangler `main` at `worker/src/index.ts`.
- [ ] Configure `ASSETS`, `DB`, and Cron triggers.

### Task 2: Domain and Repositories

**Files:**
- Create: `worker/src/domain/types.ts`
- Create: `worker/src/repositories/decisions.ts`
- Create: `worker/src/repositories/discipline-cards.ts`

- [ ] Define decision, discipline card, trigger, and review statuses.
- [ ] Implement D1-backed decision listing and creation.
- [ ] Implement due-card lookup for Cron jobs.

### Task 3: Hono API and Scheduled Entry

**Files:**
- Create: `worker/src/app.ts`
- Create: `worker/src/index.ts`
- Create: `worker/src/jobs/scan-discipline-cards.ts`

- [ ] Add `GET /api/health`.
- [ ] Add `GET /api/decisions` and `POST /api/decisions`.
- [ ] Add placeholder collection endpoints for cards, trigger events, and reviews.
- [ ] Export Worker `fetch` and `scheduled` handlers.

### Task 4: D1 Schema

**Files:**
- Create: `worker/migrations/0001_initial.sql`

- [ ] Create `decisions`, `discipline_cards`, `trigger_events`, and `reviews`.
- [ ] Keep user-owned columns explicit for future auth/RLS-like application checks.
- [ ] Store structured AI/check/result payloads as JSON text for MVP flexibility.

### Task 5: Verification

**Files:**
- Create: `worker/test/app.test.ts`
- Create: `worker/test/scheduled.test.ts`
- Create: `worker/tsconfig.json`

- [ ] Test health response.
- [ ] Test decision create/list path with a fake D1 binding.
- [ ] Test scheduled scan calls the expected D1 statements.
- [ ] Run `npm test`, `npm run typecheck:worker`, and `npm run build`.
