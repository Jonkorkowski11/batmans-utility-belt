# Batman's Utility Belt — Data Model

## Core entities

### User
Represents a manager or team member.

Fields:
- id
- name
- email
- role_name
- system_role (`manager`, `member`, `admin`)
- active
- created_at
- updated_at

### Team
Represents a working team.

Fields:
- id
- name
- owner_user_id
- active
- created_at
- updated_at

### TeamMembership
Connects users to teams.

Fields:
- id
- team_id
- user_id
- membership_role (`manager`, `member`)
- daily_quota
- created_at
- updated_at

### DailyBoard
One daily execution board per user per date.

Fields:
- id
- user_id
- team_id
- board_date
- target_quota
- blocker_note
- coaching_note
- status (`draft`, `active`, `closed`)
- created_at
- updated_at

### MustWin
Behavior or standards card shown on the daily board.

Fields:
- id
- daily_board_id
- sort_order
- text
- created_at
- updated_at

### Task
A countable action on the board.

Fields:
- id
- daily_board_id
- title
- task_type (`calls`, `follow_up`, `build`, `admin`, `sales`, `other`)
- status (`todo`, `done`)
- points_default optional
- created_by_user_id
- completed_at nullable
- sort_order
- created_at
- updated_at

### CoachingPrompt
Prompt cards displayed to the manager.

Fields:
- id
- team_id nullable
- daily_board_id nullable
- text
- sort_order
- active
- created_at
- updated_at

### InterventionLog
Tracks manager intervention over time.

Fields:
- id
- daily_board_id
- manager_user_id
- intervention_type (`check_in`, `coaching`, `blocker_removed`, `priority_reset`)
- note
- created_at

## Derived values

### Completed count
Count of tasks where `status = done`

### Open count
Count of tasks where `status = todo`

### Pace percent
`completed_count / target_quota * 100`

### Pace label
Suggested rules:
- `>= 100` → Quota hit
- `>= 70` → On pace
- `< 70` → Needs pressure

## Notes for engineering

- DailyBoard should be the main aggregate root for the MVP
- Avoid premature normalization beyond what keeps CRUD clean
- If speed matters, MustWin and CoachingPrompt can initially be stored as JSON arrays, then normalized later
