import type { AppStore, TaskType } from "@/lib/types";

export const taskTypeLabel: Record<TaskType, string> = {
  calls: "Calls",
  "follow-up": "Follow-Up",
  build: "Build",
  admin: "Admin",
  sales: "Sales",
  other: "Other",
};

export const initialStoreData: AppStore = {
  team: {
    id: "execution-team",
    name: "Execution Team",
    managerModeLabel: "Live",
  },
  users: [
    {
      id: "manager",
      name: "Jon Korkowski",
      email: "jon@truerankdigital.com",
      passcode: "utility-belt",
      systemRole: "manager",
      roleLabel: "Operations Lead",
      teamId: "execution-team",
      active: true,
    },
    {
      id: "jesse",
      name: "Jesse",
      email: "jesse@truerankdigital.com",
      passcode: "jesse-pace",
      systemRole: "member",
      roleLabel: "Sales",
      teamId: "execution-team",
      active: true,
    },
    {
      id: "jose",
      name: "Jose",
      email: "jose@truerankdigital.com",
      passcode: "jose-pace",
      systemRole: "member",
      roleLabel: "Sales",
      teamId: "execution-team",
      active: true,
    },
    {
      id: "eric",
      name: "Eric",
      email: "eric@truerankdigital.com",
      passcode: "eric-pace",
      systemRole: "member",
      roleLabel: "Sales",
      teamId: "execution-team",
      active: true,
    },
  ],
  prompts: [
    {
      id: "prompt-1",
      teamId: "execution-team",
      text: "What are your three highest-value actions before lunch?",
    },
    {
      id: "prompt-2",
      teamId: "execution-team",
      text: "If this list gets cleared early, what queue do you pull from next?",
    },
    {
      id: "prompt-3",
      teamId: "execution-team",
      text: "What momentum did you create without being told?",
    },
  ],
  doctrine: [
    {
      title: "Plan before drift",
      text: "Every day starts with visible commitments, not vague intention.",
    },
    {
      title: "Quota creates pace",
      text: "The point is visible output volume, not the feeling of being busy.",
    },
    {
      title: "Blockers get escalated",
      text: "No one waits around when another useful action exists.",
    },
  ],
  boards: [
    {
      id: "board-jesse-2026-04-02",
      teamId: "execution-team",
      userId: "jesse",
      boardDate: "2026-04-02",
      dailyQuota: 50,
      mustWins: [
        {
          id: "jesse-win-1",
          text: "Touch every active priority before noon.",
        },
        {
          id: "jesse-win-2",
          text: "Clear follow-ups before low-value admin.",
        },
        {
          id: "jesse-win-3",
          text: "Escalate blockers fast instead of waiting.",
        },
      ],
      blockerNote: "Waiting on assets from two accounts. Needs to pull next-best actions instead of pausing.",
      coachingNote: "Keep redirecting toward countable output when dependencies stall.",
      tasks: [
        {
          id: "jesse-lockdown",
          title: "Finalize Entity Stacking Architecture",
          type: "build",
          priority: "Level 1: Critical",
          status: "todo",
          isPastDue: true,
          createdAt: "2026-04-05T08:00:00.000Z",
        },
        {
          id: "jesse-1",
          title: "Send 12 overdue client follow-ups",
          type: "follow-up",
          priority: "Level 2: Strategic",
          status: "done",
          createdAt: "2026-04-02T08:00:00.000Z",
        },
        {
          id: "jesse-2",
          title: "QA 8 local landing pages",
          type: "build",
          priority: "Level 3: Operational",
          status: "done",
          createdAt: "2026-04-02T08:15:00.000Z",
        },
        {
          id: "jesse-3",
          title: "Request 10 GBP review links",
          type: "calls",
          priority: "Level 2: Strategic",
          status: "todo",
          createdAt: "2026-04-02T08:30:00.000Z",
        },
      ],
    },
    {
      id: "board-jose-2026-04-02",
      teamId: "execution-team",
      userId: "jose",
      boardDate: "2026-04-02",
      dailyQuota: 50,
      mustWins: [
        {
          id: "jose-win-1",
          text: "Start with revenue-linked work first.",
        },
        {
          id: "jose-win-2",
          text: "Keep task count high and visible all day.",
        },
        {
          id: "jose-win-3",
          text: "Leave no ambiguity on the next action.",
        },
      ],
      blockerNote: "Strong when directed. Needs a visible plan and pace target to self-manage better.",
      coachingNote: "Use quotas to force initiative instead of waiting for new direction.",
      tasks: [
        {
          id: "jose-1",
          title: "Prospect 15 local businesses",
          type: "sales",
          priority: "Level 2: Strategic",
          status: "done",
          createdAt: "2026-04-02T08:00:00.000Z",
        },
        {
          id: "jose-2",
          title: "Send 10 Loom recap follow-ups",
          type: "follow-up",
          priority: "Level 2: Strategic",
          status: "todo",
          createdAt: "2026-04-02T08:15:00.000Z",
        },
      ],
    },
    {
      id: "board-eric-2026-04-02",
      teamId: "execution-team",
      userId: "eric",
      boardDate: "2026-04-02",
      dailyQuota: 50,
      mustWins: [
        {
          id: "eric-win-1",
          text: "Hit daily outreach quota before noon.",
        },
        {
          id: "eric-win-2",
          text: "Follow up on every warm lead same-day.",
        },
        {
          id: "eric-win-3",
          text: "Log all activity in CRM before EOD.",
        },
      ],
      blockerNote: "",
      coachingNote: "Focus on pipeline velocity and closing speed.",
      tasks: [
        {
          id: "eric-1",
          title: "Prospect 20 new local businesses",
          type: "sales",
          priority: "Level 2: Strategic",
          status: "todo",
          createdAt: "2026-04-02T08:00:00.000Z",
        },
        {
          id: "eric-2",
          title: "Send 10 follow-up emails to warm leads",
          type: "follow-up",
          priority: "Level 2: Strategic",
          status: "todo",
          createdAt: "2026-04-02T08:15:00.000Z",
        },
      ],
    },
  ],
};
