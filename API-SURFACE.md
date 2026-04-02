# Batman's Utility Belt — Suggested API Surface

## Goal

Provide engineers a simple starting API for a standalone MVP.

## Suggested endpoints

### Teams
- `GET /api/teams/:teamId/dashboard`
  - returns manager rollup for all team members

### Daily boards
- `GET /api/boards/:boardId`
  - returns a single daily board with tasks, must-wins, and prompts

- `POST /api/boards`
  - creates a daily board for a user/date

- `PATCH /api/boards/:boardId`
  - updates board-level values like blocker_note, coaching_note, target_quota

### Tasks
- `POST /api/boards/:boardId/tasks`
  - creates a task

- `PATCH /api/tasks/:taskId`
  - updates title, task_type, or status

- `DELETE /api/tasks/:taskId`
  - deletes a task if needed

### Must-win standards
- `POST /api/boards/:boardId/must-wins`
- `PATCH /api/must-wins/:id`
- `DELETE /api/must-wins/:id`

### Coaching prompts
- `GET /api/teams/:teamId/prompts`
- `POST /api/teams/:teamId/prompts`
- `PATCH /api/prompts/:id`

### Interventions
- `POST /api/boards/:boardId/interventions`
  - logs a manager intervention or blocker resolution

## Suggested response shape for dashboard

```json
{
  "team": {
    "id": "team_1",
    "name": "Execution Team"
  },
  "members": [
    {
      "userId": "user_1",
      "name": "Jesse",
      "role": "Execution Operator",
      "dailyQuota": 50,
      "completedCount": 18,
      "openCount": 22,
      "pacePercent": 36,
      "paceLabel": "Needs pressure"
    }
  ]
}
```

## Engineering recommendation

If building fast:
- use server actions or a minimal REST layer
- keep read models optimized for the team dashboard and board view
- derive pace labels server-side or in a shared utility module
