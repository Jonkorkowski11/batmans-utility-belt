export type TaskStatus = "todo" | "done";

export type TaskType = "calls" | "follow-up" | "build" | "admin" | "sales" | "other";

export type SystemRole = "manager" | "member";

export type Task = {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  createdAt: string;
};

export type MustWin = {
  id: string;
  text: string;
};

export type Prompt = {
  id: string;
  teamId: string;
  text: string;
};

export type TeamRecord = {
  id: string;
  name: string;
  managerModeLabel: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passcode: string;
  systemRole: SystemRole;
  roleLabel: string;
  teamId: string;
  active: boolean;
};

export type DailyBoardRecord = {
  id: string;
  teamId: string;
  userId: string;
  boardDate: string;
  dailyQuota: number;
  mustWins: MustWin[];
  blockerNote: string;
  coachingNote: string;
  tasks: Task[];
};

export type TeamMember = {
  teamId: string;
  userId: string;
  name: string;
  email: string;
  passcode: string;
  role: string;
  dailyQuota: number;
  mustWins: string[];
  blockerNote: string;
  coachingNote: string;
  tasks: Task[];
};

export type DoctrineItem = {
  title: string;
  text: string;
};

export type TeamData = {
  team: TeamRecord;
  prompts: Prompt[];
  doctrine: DoctrineItem[];
  members: TeamMember[];
};

export type AppStore = {
  team: TeamRecord;
  users: UserRecord[];
  prompts: Prompt[];
  doctrine: DoctrineItem[];
  boards: DailyBoardRecord[];
};

export type SessionData = {
  userId: string;
  systemRole: SystemRole;
  teamId: string;
};
