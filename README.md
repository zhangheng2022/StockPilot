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

Run the Nuxt frontend during UI development:

```bash
npm run dev
```

For integrated Worker preview, copy `.dev.vars.example` to `.dev.vars` first.
This keeps local API requests on the development identity strategy while the
checked-in Wrangler config remains production-safe.

Preview the integrated Worker after generating static assets:

```bash
npm run preview
```

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
