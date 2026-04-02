# Batman's Utility Belt — Features and Scope

## Purpose of this document

This file gives engineering a clear breakdown of:
- what the platform is supposed to do
- what belongs in the MVP
- what should be explicitly deferred
- how features should be grouped by phase

This is meant to remove ambiguity between the clickable MVP and the later production-ready product.

---

## Platform definition

Batman’s Utility Belt is a manager-first daily execution platform.

Its purpose is to make daily work:
- visible
- countable
- coachable
- intervention-friendly

It is built for teams that need stronger pace, clearer accountability, and quicker response to drift or blockers.

It is **not** intended to be a full project management suite.

---

## Product promise

The platform should help a manager answer these questions instantly:
- Who is on pace today?
- Who is drifting?
- What is each person supposed to be doing?
- What has already been completed?
- What blockers need intervention?
- What coaching conversation should happen next?

If the product does that well, it is succeeding.

---

# Phase 1 — Clickable MVP scope

## Goal

Prove the concept in a clean standalone app with demo-state behavior.

## Phase 1 feature list

### 1. Team rollup dashboard
A manager-facing overview showing all visible team members.

Must include:
- name
- role
- completed action count
- open action count
- daily quota
- pace percentage
- pace/health label

Purpose:
Quickly identify who needs attention.

### 2. Individual daily board
A detailed view for a single team member.

Must include:
- daily quota
- completed count
- open count
- pace percentage
- list of tasks
- must-win standards
- blocker/coaching note
- manager prompts

Purpose:
Turn one person’s day into a visible operating surface.

### 3. Task interaction
The MVP must allow users to:
- add a task
- view task category/type
- mark task complete/incomplete

Purpose:
Show live progress and make the board feel interactive.

### 4. Quota and pace interpretation
The MVP must calculate and display:
- completed count
- open count
- quota progress percentage
- readable pace status

Suggested statuses:
- Quota hit
- On pace
- Needs pressure

Purpose:
Convert raw task counts into meaningful manager signals.

### 5. Manager coaching surface
The MVP must display:
- blocker/coaching context
- manager prompts
- must-win standards

Purpose:
Support better intervention and coaching.

### 6. Seeded demo data
The MVP should include demo users and demo tasks so it works immediately without setup.

Purpose:
Make the product demoable and easy to evaluate.

---

## Phase 1 technical scope

### Included
- frontend-only or browser-persisted demo state
- local component state or simple local persistence
- hardcoded or seeded data
- standalone web app shell
- single-tenant demo behavior

### Explicitly not required in Phase 1
- auth
- backend/database
- real multi-user synchronization
- role permissions
- production-grade APIs
- audit logs
- advanced reporting
- notifications
- external integrations

Important:
Phase 1 is about validating product behavior and user clarity, not infrastructure completeness.

---

# Phase 2 — Persistence and operational reality

## Goal

Turn the clickable MVP into a usable internal app with durable state.

## Phase 2 feature list

### 1. Persistent storage
Add backend persistence for:
- users
- teams
- daily boards
- tasks
- blocker notes
- must-win items

### 2. CRUD behavior
Support real create/read/update/delete flows for:
- team members
- boards
- tasks
- prompts
- standards

### 3. Protected access
Add lightweight authentication and controlled access.

### 4. Board save/load behavior
Managers should be able to reopen the app and see the same current state.

### 5. Basic role-aware views
Introduce practical separation between:
- manager dashboard view
- team member personal board view

Important:
This is where persistence and role-aware behavior belong.
They are **not** Phase 1 requirements.

---

# Phase 3 — Operational team system

## Goal

Make the app usable as a real day-to-day management layer.

## Phase 3 feature list
- recurring daily board generation
- role-based templates
- intervention log
- blocker status workflow
- quota customization by user/role
- historical snapshots and simple trend views

---

# Phase 4 — Intelligence and automation

## Goal

Increase leverage with proactive signals and summaries.

## Phase 4 feature list
- low-pace alerts
- missed quota summaries
- manager recap views
- suggested coaching prompts
- next-best-action suggestions
- Slack/email hooks if desired

---

# Phase 5 — Productization

## Goal

Prepare for broader rollout, scaling, or externalization.

## Phase 5 feature list
- multi-team / multi-workspace support
- permissions and admin controls
- onboarding flows
- branding controls
- billing/commercial packaging if needed

---

## Engineering summary

## What must exist in MVP
- team dashboard
- individual daily board
- task add/toggle
- quota progress
- pace labels
- blockers/coaching prompts
- must-win standards
- demo data

## What must not be treated as MVP blockers
- auth
- backend persistence
- multi-user sync
- permissions
- advanced reporting
- integrations

## Build recommendation

Build Phase 1 fast and clean.
Then layer persistence and role-aware behavior in Phase 2.
Do not let production architecture delay concept validation.
