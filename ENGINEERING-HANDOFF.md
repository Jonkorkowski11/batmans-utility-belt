# Batman's Utility Belt — Engineering Handoff

## What this is

A standalone product concept extracted from a page prototype that was incorrectly embedded inside another website project.

The original concept exists as a strong UI direction, but engineering should treat this package as the source of truth for building the app correctly as its own product.

## Immediate recommendation

Build this as a standalone Next.js app.

Why:
- the MVP is already naturally web-app shaped
- the interaction model is component-friendly
- it is easy to stage as a protected internal tool first
- future auth, persistence, and reporting are straightforward from this base

## Recommended v1 architecture

### Frontend
- Next.js app router
- Tailwind
- reusable card / stat / list components
- dashboard and board routes

### Backend
- Next.js server actions or route handlers
- or Supabase if you want speed on auth + persistence

### Data
- Postgres / Supabase Postgres
- seed data for demo

## Suggested routes
- `/` → manager dashboard
- `/team/:teamId/member/:userId` → daily board detail
- `/settings` optional later
- `/reports` later phase

## Product behaviors to preserve from prototype
- dark, high-contrast manager dashboard aesthetic
- team rollup + individual drill-down pattern
- quota-driven framing
- visible blockers and coaching prompts
- emphasis on execution pressure over project-management sprawl

## Product behaviors to improve vs prototype
- persistent data
- editable blocker notes
- task type selection on create
- better quota calibration
- role-aware views for manager vs member
- historical board snapshots

## Implementation order
1. scaffold standalone app
2. reproduce MVP UI with seed data
3. implement persistent models and CRUD
4. add auth and protected routes
5. add reporting / interventions / automations

## Engineering caution

Do not overgeneralize this into a broad PM suite too early.
The product’s edge is daily execution visibility and coaching pressure.
