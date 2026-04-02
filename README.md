# Batman's Utility Belt

A standalone Next.js app for a manager-facing daily execution system designed to create visible output, pace, accountability, and coaching leverage.

## What is in this folder

This folder now contains both:

- a runnable standalone web MVP
- the original product and engineering handoff documents

Current implementation scope follows `FEATURES-AND-SCOPE.md`. The app now covers Phase 1 plus a practical Phase 2 foundation.

## Current features

- manager dashboard with team rollup cards
- individual day-plan route per team member
- shared pace and quota calculation utilities
- server-persisted task CRUD, must-win CRUD, prompt CRUD, and team-member CRUD
- protected sign-in flow with seeded manager/member accounts
- basic role-aware behavior for manager dashboard vs member board
- Postgres-backed persistence when `DATABASE_URL` is set, with file-store fallback for local use
- manager prompts, doctrine panels, blocker notes, coaching notes, and quota editing

## Run locally

```bash
npm install
npm run dev
```

For deploy-safe persistence locally, copy `.env.example` to `.env.local` and set `DATABASE_URL`. Without it, the app falls back to `data/store.json`.

Production validation:

```bash
npm run lint
npm run build
```

## Railway

`railway.json` is included with build and start commands for a standard Next.js deployment. The CLI is available locally, but this directory is not linked to a Railway project yet, so deployment still requires `railway link` or creating a project first.

## Current limitations

- local fallback persistence is file-backed when `DATABASE_URL` is absent
- auth is lightweight internal access, not full production identity
- there is no multi-instance synchronization or audit trail yet
- recurring boards, historical snapshots, alerts, and automations are still later-phase work

## Handoff docs

- `PRD.md` — product requirements document
- `MVP-SPEC.md` — scoped MVP definition
- `PHASES.md` — phased delivery plan
- `FEATURES-AND-SCOPE.md` — phase-by-phase feature boundary and build guide
- `UX-FLOWS.md` — core user flows
- `DATA-MODEL.md` — entities, relationships, and suggested schema
- `API-SURFACE.md` — suggested backend/API surface
- `ENGINEERING-HANDOFF.md` — implementation guidance for engineers
- `COPY-AND-POSITIONING.md` — product framing and language
- `src-reference/original-page.tsx` — original local MVP route source recovered from the Jon site app

## Source origin

Recovered from:
`/Users/jarvis/.openclaw/workspace/trd-jonjkorjowski/src/app/batmans-utility-belt/page.tsx`

This project exists so the concept can be treated as a standalone product instead of a page embedded in another website.
