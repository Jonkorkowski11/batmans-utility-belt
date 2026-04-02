# Batman's Utility Belt — Product Requirements Document

## 1. Product summary

Batman’s Utility Belt is a manager-first execution operating system for small teams that need more visible daily output, clearer accountability, faster blocker escalation, and tighter coaching loops.

The core idea is simple: replace vague “busy” work with visible, countable actions tied to daily quotas, team expectations, and intervention triggers.

This product is designed for operators managing execution staff, SDR-like roles, account coordinators, follow-up staff, or hybrid support teams where pace, consistency, and next-action clarity matter more than complex project management.

## 2. Problem

Many small teams underperform not because work is unavailable, but because:
- priorities are not made visible early in the day
- output expectations are not quantified
- managers cannot quickly see who is drifting
- blockers sit too long without escalation
- staff default to passive waiting rather than pulling the next best action
- task tools track work, but do not create execution pressure or coaching discipline

The result is low throughput, weak accountability, and management by chasing people manually.

## 3. Product vision

Create a lightweight execution command center where a manager can:
- assign and review daily action quotas
- see team pace in real time
- inspect each person’s must-win priorities
- identify blockers instantly
- coach from structured prompts instead of vague check-ins
- reinforce a culture of action volume, initiative, and visible momentum

## 4. Primary users

### Primary persona: manager / operator
A team lead, founder, ops lead, sales manager, or delivery manager who needs stronger visibility into day-level execution.

Needs:
- quick team rollup
- intervention signals
- clean individual drill-down
- confidence that output is being measured and improved

### Secondary persona: team member
A staff member who benefits from a simple daily board, visible quota, clear next actions, and explicit expectations.

Needs:
- know what matters now
- understand daily target
- quickly mark progress
- avoid ambiguity on next action

## 5. Jobs to be done

### Manager JTBD
- When I start the day, I want to see who is on pace and who is not so I know where to intervene.
- When someone is drifting, I want clear context on blockers and must-win standards so coaching is immediate.
- When I review the team, I want output volume to be visible without opening ten different tools.

### Team member JTBD
- When I begin work, I want a clear list of countable actions so I can build momentum quickly.
- When I get blocked, I want to escalate rather than stall.
- When I finish a task, I want visible progress toward quota so I stay in motion.

## 6. MVP goals

The MVP should prove five things:
1. managers understand the product instantly
2. a team rollup can expose pace problems quickly
3. an individual daily execution board changes behavior
4. blockers and coaching prompts improve intervention quality
5. the concept is strong enough for engineering to turn into a real app

## 7. MVP scope

### In scope
- manager dashboard with team rollup cards
- individual team member day plan
- daily quota tracking
- task list with completion toggles
- task categories / work types
- blocker / coaching note panel
- manager prompts / coaching guidance
- must-win standards panel
- simple add-task flow
- status labels like “Quota hit,” “On pace,” and “Needs pressure”

### Out of scope for MVP
- auth and permissions complexity
- cross-org multi-tenancy
- payroll integration
- time tracking
- advanced analytics warehouse
- mobile native apps
- automations with Slack/SMS/email
- historical performance reporting beyond simple snapshots
- deep workflow builder or rules engine

## 8. Functional requirements

### FR1 — Team rollup
The system must show a manager-facing rollup for all direct reports including:
- name
- role
- actions completed
- open actions
- quota completion percent
- health / pace label

### FR2 — Individual execution board
The system must allow a manager or user to view a person’s daily board with:
- daily quota
- completed count
- open count
- pace percent
- task list
- must-win standards
- blockers / coaching note

### FR3 — Task management
The system must support:
- adding a task
- assigning a task type/category
- marking a task complete/incomplete
- rendering visible progress immediately

### FR4 — Coaching visibility
The system must display:
- current blocker/coaching note
- manager prompts for intervention
- standards / doctrine that guide behavior

### FR5 — Action-type visibility
Tasks must be categorizable with types like:
- calls
- follow-up
- build
- admin
- sales

### FR6 — Pace interpretation
The system must convert raw completion percentage into understandable states such as:
- needs pressure
- on pace
- quota hit

## 9. Non-functional requirements

- simple enough to understand in under 60 seconds
- fast UI with minimal friction
- visually high-contrast and manager-friendly
- easy for engineering to convert into production architecture
- suitable for eventual web app deployment

## 10. UX principles

- management clarity over feature clutter
- visible pressure without visual chaos
- count actions, not vague intentions
- reduce ambiguity on the next best move
- make intervention obvious

## 11. Success metrics

### MVP validation metrics
- manager can explain product value within one demo session
- engineering can estimate build scope without major clarification
- stakeholders agree the product should be built as a standalone app

### Post-build product metrics
- daily active manager usage
- tasks completed per user per day
- percent of users at or above quota
- blocker resolution time
- number of coaching interventions per week
- trend in output per team member over time

## 12. Risks

- quota design could incentivize low-value busy work if not paired with quality standards
- manager adoption may fail if setup burden becomes too heavy
- users may resist if it feels punitive rather than momentum-building
- category definitions may need tuning by team type

## 13. Product stance

This is not a generic project management tool.
It is an execution pressure and visibility layer.

Its value comes from making pace, ownership, and intervention visible at the day level.

## 14. Recommendation

Build this first as a narrow web app with one manager account, a small team model, daily boards, and simple reporting. Validate behavioral value quickly before adding automations, analytics depth, or multi-org complexity.
