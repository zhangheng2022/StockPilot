# Stock Pilot

Stock Pilot is a full-stack Cloudflare application:

- Nuxt generates the frontend into `.output/public`.
- Cloudflare Workers runs a Hono API from `worker/src/index.ts`.
- Cloudflare D1 stores decisions, discipline cards, trigger events, and reviews.
- Cloudflare Cron Triggers run scheduled discipline-card scans.

## Setup

```bash
npm install
```

## Local Development

Copy `.dev.vars.example` to `.dev.vars` first. This keeps local API requests on
the development identity strategy while the checked-in Wrangler config remains
production-safe.

Run the integrated local app through Cloudflare Workers during active
development:

```bash
npm run dev
```

This applies local D1 migrations, starts Nuxt dev on `127.0.0.1:3000`, and
starts `wrangler dev` on `127.0.0.1:8787`. Open the Wrangler URL. The Worker is
still the browser entry point: `/api/*` is handled by Hono, while non-API
requests are proxied to Nuxt dev so hot module replacement keeps working.

For UI-only work where you do not need Worker APIs, run:

```bash
npm run dev:ui
```

Preview the production-shaped local runtime when you want to check generated
static assets:

```bash
npm run preview
```

This builds `.output/public`, applies local D1 migrations, and serves the
generated app through `wrangler dev`. It does not provide Nuxt hot module
replacement.

## Database

Create a D1 database and replace the placeholder `database_id` in `wrangler.jsonc`.

```bash
npx wrangler d1 create stock_pilot
npm run db:migrate:local
npm run db:migrate:remote
```

Initial schema lives in `worker/migrations/0001_initial.sql`.

## Verification

```bash
npm test
npm run cf-typegen -- --check
npm run typecheck:worker
npm run build
npx wrangler deploy --dry-run --outdir .wrangler/dry-run
```

## Deploy

```bash
npm run deploy
```

`npm run deploy` builds the frontend, applies pending remote D1 migrations, clears stale Wrangler redirect config, and then deploys the Worker. Use this script for releases so the Worker and production database schema move together.

Production access is protected by Cloudflare Access on `sp.zhangheng.eu.org`.
The Worker validates `Cf-Access-Jwt-Assertion` against `TEAM_DOMAIN` and
`POLICY_AUD` from `wrangler.jsonc`; `workers.dev` and preview URLs are disabled
so the Access-protected custom domain is the production entry point.
