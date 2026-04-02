# Batman's Utility Belt — Engineering One-Pager

## What this platform is

Batman’s Utility Belt is a manager-first execution platform built to increase visible daily output, improve accountability, expose drift early, and make coaching/intervention easier.

It is designed for small teams where success depends on daily action volume, clear next steps, and fast blocker removal.

This is **not** a generic project management system.
It is a lightweight execution operating layer focused on:
- pace
- accountability
- intervention
- coaching
- daily quota discipline

## What problem it solves

Many teams look busy but still underperform because:
- priorities are vague at the start of the day
- output expectations are not measurable
- managers cannot quickly see who is on pace
- blockers sit too long
- team members wait for direction instead of pulling the next useful action

Batman’s Utility Belt makes those failures visible and actionable.

## What the platform does

At a high level, the platform gives a manager:
1. a team-wide dashboard showing who is on pace and who is drifting
2. an individual daily board for each team member
3. visible daily quotas tied to countable actions
4. blocker notes and coaching prompts for intervention
5. a simple workflow for planning, executing, and reviewing the day

## Core platform features

### 1. Manager dashboard
A team rollup view showing each team member’s:
- name
- role
- completed actions
- open actions
- quota progress
- pace/health label (ex: Quota hit, On pace, Needs pressure)

Purpose:
Allows a manager to identify where attention is needed in seconds.

### 2. Individual daily execution board
A focused drill-down view for each team member showing:
- daily quota
- completed count
- open count
- pace percentage
- today’s task list
- must-win standards
- blocker/coaching note
- manager prompts

Purpose:
Turns vague work into a visible day plan and gives managers a concrete coaching surface.

### 3. Task management
The MVP supports:
- adding new tasks
- assigning task categories
- marking tasks complete/incomplete
- updating visible progress immediately

Suggested task categories:
- calls
- follow-up
- build
- admin
- sales
- other

Purpose:
Keeps the system focused on countable, visible output.

### 4. Pace and quota tracking
The platform calculates daily output against a quota and translates that into a readable state.

Example pace logic:
- `>=100%` = Quota hit
- `70–99%` = On pace
- `<70%` = Needs pressure

Purpose:
Gives managers a fast interpretation layer instead of forcing them to read raw numbers.

### 5. Must-win standards
Each board includes a short list of behavioral standards, such as:
- touch every active priority before noon
- clear follow-ups before low-value admin
- escalate blockers instead of waiting

Purpose:
Reinforces operating discipline, not just task tracking.

### 6. Blocker and coaching panel
Each user board includes visible blocker context and manager coaching notes/prompts.

Examples:
- what are your 3 highest-value actions before lunch?
- what queue do you pull from when you finish early?
- what momentum did you create without being told?

Purpose:
Helps managers coach with structure instead of vague check-ins.

## Intended users

### Primary user
Manager / operator / team lead

### Secondary user
Team member executing daily work

## Example use cases

- sales or appointment-setting teams
- fulfillment or follow-up teams
- account support teams
- SDR / outreach teams
- ops teams that need stronger daily pace and accountability
- hybrid service teams where “what happened today?” should be obvious

## MVP boundaries

### Included in MVP
- manager dashboard
- individual user boards
- daily quotas
- task add/toggle flow
- task categories
- blockers/coaching notes
- must-win standards
- coaching prompts
- seeded demo data
- local or browser-persisted demo behavior

### Not included in MVP
- auth
- backend persistence
- advanced permissions
- enterprise workflow automation
- payroll/time tracking
- deep analytics suite
- native mobile apps
- broad project-management features
- true multi-user synchronization

## Phase 1 build shape

Phase 1 should stay intentionally light:
- standalone web app
- seeded demo data
- local state or browser-persisted demo state
- no auth requirement
- no backend requirement
- no true manager/member permission separation yet

## Later build shape (Phase 2+)

Once the concept is validated, the recommended production path is:
- Next.js frontend
- lightweight backend/API layer
- Postgres or Supabase for persistence
- simple role-aware manager/member views

## Why this could be valuable

The product is useful because it does not try to manage everything.
It focuses narrowly on making daily execution visible and coachable.

That creates value in three ways:
1. managers know where to intervene faster
2. team members know exactly what output is expected
3. the business can build a culture of visible momentum instead of passive waiting

## Delivery roadmap

### Phase 1
Clickable standalone MVP with seeded data

### Phase 2
Persistent real app with CRUD and protected access

### Phase 3
Recurring boards, intervention logs, and historical snapshots

### Phase 4
Alerts, summaries, and automation hooks

### Phase 5
Multi-team productization and broader rollout

## Source package

Full project handoff lives here:
- `/Users/jarvis/Desktop/batmans-utility-belt-mvp`
