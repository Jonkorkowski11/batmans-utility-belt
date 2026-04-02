# Batman's Utility Belt — MVP Spec

## MVP objective

Ship a standalone web MVP that demonstrates manager visibility, daily execution planning, quota tracking, and coaching prompts for a small team.

## Core experience

A manager lands on a dashboard, sees every team member’s pace, clicks into a person, and can immediately understand:
- what they are supposed to do today
- how much they have completed
- whether they are on pace
- what blockers exist
- how to coach them

## MVP modules

### 1. Team dashboard
Displays one card per team member with:
- name
- role
- pace label
- completed count
- open count
- quota completion percent

### 2. Individual execution view
Displays:
- daily quota
- completed count
- open count
- pace percent
- today’s task list
- task categories
- must-win standards
- blocker note
- coaching prompts

### 3. Task controls
Supports:
- create task
- toggle complete/incomplete
- set task type
- display task state clearly

### 4. Manager doctrine panel
Static guidance module reinforcing the product’s philosophy:
- plan before drift
- quota creates pace
- blockers get escalated

## MVP user stories

### Manager stories
- As a manager, I want a team rollup so I can spot drift fast.
- As a manager, I want to click into a person’s day plan so I can coach specifically.
- As a manager, I want blockers visible so I can remove friction quickly.

### Team member stories
- As a user, I want a clear list of actions for today so I can stay in motion.
- As a user, I want to see quota progress so momentum is visible.
- As a user, I want to know what “good” looks like via must-win standards.

## Suggested MVP stack

- Frontend: Next.js or React web app
- UI: Tailwind + component library
- Backend: lightweight Node/Next API or Supabase
- DB: Postgres or Supabase Postgres
- Auth: optional in phase 1, minimal in phase 2

## MVP constraints

- keep schema simple
- optimize for demoability and clarity
- do not overbuild workflows
- avoid enterprise features until behavior value is proven

## MVP acceptance criteria

- manager dashboard renders team rollup
- individual drill-down renders correctly
- task completion updates visible counts
- pace label changes based on quota progress
- user can add a new task
- data model supports multiple team members and tasks
- engineering handoff is sufficient to implement without referring back to the embedded website page
