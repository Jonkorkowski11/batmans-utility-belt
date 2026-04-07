import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { unstable_noStore as noStore } from "next/cache";
import postgres from "postgres";
import { initialStoreData } from "@/lib/seed-data";
import type {
  AppStore,
  DailyBoardRecord,
  TaskPriority,
  TaskStatus,
  TaskType,
  TeamData,
  TeamMember,
  UserRecord,
} from "@/lib/types";

const STORE_PATH = path.join(process.cwd(), "data", "store.json");
const DATABASE_URL = process.env.DATABASE_URL?.trim();

let sqlClient: ReturnType<typeof postgres> | null = null;
let databaseInitPromise: Promise<void> | null = null;

function databaseEnabled() {
  return Boolean(DATABASE_URL);
}

function getSql() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured.");
  }

  if (!sqlClient) {
    sqlClient = postgres(DATABASE_URL, {
      max: 1,
      ssl: DATABASE_URL.includes(".railway.internal") ? false : "require",
      prepare: false,
    });
  }

  return sqlClient;
}

async function ensureDatabaseInitialized() {
  if (!databaseEnabled()) {
    return;
  }

  if (!databaseInitPromise) {
    const sql = getSql();
    databaseInitPromise = (async () => {
      await sql`
        create table if not exists teams (
          id text primary key,
          name text not null,
          manager_mode_label text not null
        )
      `;

      await sql`
        create table if not exists users (
          id text primary key,
          name text not null,
          email text not null unique,
          passcode text not null,
          system_role text not null,
          role_label text not null,
          team_id text not null references teams(id) on delete cascade,
          active boolean not null default true
        )
      `;

      await sql`
        create table if not exists prompts (
          id text primary key,
          team_id text not null references teams(id) on delete cascade,
          text text not null,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists boards (
          id text primary key,
          team_id text not null references teams(id) on delete cascade,
          user_id text not null unique references users(id) on delete cascade,
          board_date date not null,
          daily_quota integer not null,
          blocker_note text not null default '',
          coaching_note text not null default ''
        )
      `;

      await sql`
        create table if not exists must_wins (
          id text primary key,
          board_id text not null references boards(id) on delete cascade,
          text text not null,
          created_at timestamptz not null default now()
        )
      `;

      await sql`
        create table if not exists tasks (
          id text primary key,
          board_id text not null references boards(id) on delete cascade,
          title text not null,
          type text not null,
          priority text not null default 'Level 2: Strategic',
          status text not null,
          created_at timestamptz not null
        )
      `;

      const [{ count }] = await sql<{ count: string }[]>`select count(*)::text as count from teams`;

      if (count === "0") {
        await seedDatabase(sql);
      }
    })();
  }

  await databaseInitPromise;
}

async function seedDatabase(sql: ReturnType<typeof postgres>) {
  await sql`
    insert into teams (id, name, manager_mode_label)
    values (${initialStoreData.team.id}, ${initialStoreData.team.name}, ${initialStoreData.team.managerModeLabel})
  `;

  for (const user of initialStoreData.users) {
    await sql`
      insert into users (id, name, email, passcode, system_role, role_label, team_id, active)
      values (${user.id}, ${user.name}, ${user.email}, ${user.passcode}, ${user.systemRole}, ${user.roleLabel}, ${user.teamId}, ${user.active})
    `;
  }

  for (const prompt of initialStoreData.prompts) {
    await sql`
      insert into prompts (id, team_id, text)
      values (${prompt.id}, ${prompt.teamId}, ${prompt.text})
    `;
  }

  for (const board of initialStoreData.boards) {
    await sql`
      insert into boards (id, team_id, user_id, board_date, daily_quota, blocker_note, coaching_note)
      values (${board.id}, ${board.teamId}, ${board.userId}, ${board.boardDate}, ${board.dailyQuota}, ${board.blockerNote}, ${board.coachingNote})
    `;

    for (const mustWin of board.mustWins) {
      await sql`
        insert into must_wins (id, board_id, text)
        values (${mustWin.id}, ${board.id}, ${mustWin.text})
      `;
    }

    for (const task of board.tasks) {
      await sql`
        insert into tasks (id, board_id, title, type, priority, status, created_at)
        values (${task.id}, ${board.id}, ${task.title}, ${task.type}, ${task.priority}, ${task.status}, ${task.createdAt})
      `;
    }
  }
}

async function ensureStoreFile() {
  const directory = path.dirname(STORE_PATH);
  await mkdir(directory, { recursive: true });

  try {
    await stat(STORE_PATH);
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(initialStoreData, null, 2), "utf8");
  }
}

async function readFileStore() {
  await ensureStoreFile();
  const raw = await readFile(STORE_PATH, "utf8");
  return JSON.parse(raw) as AppStore;
}

async function writeFileStore(store: AppStore) {
  const tempPath = `${STORE_PATH}.tmp`;
  await writeFile(tempPath, JSON.stringify(store, null, 2), "utf8");
  await rename(tempPath, STORE_PATH);
}

async function updateFileStore(mutator: (store: AppStore) => AppStore) {
  const current = await readFileStore();
  const next = mutator(current);
  await writeFileStore(next);
  return next;
}

export async function readStore() {
  noStore();

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    return readDatabaseStore();
  }

  return readFileStore();
}

async function readDatabaseStore() {
  const sql = getSql();
  const [team] = await sql<{ id: string; name: string; manager_mode_label: string }[]>`
    select id, name, manager_mode_label
    from teams
    order by id
    limit 1
  `;

  const users = await sql<{
    id: string;
    name: string;
    email: string;
    passcode: string;
    system_role: string;
    role_label: string;
    team_id: string;
    active: boolean;
  }[]>`
    select id, name, email, passcode, system_role, role_label, team_id, active
    from users
    order by name asc
  `;

  const prompts = await sql<{ id: string; team_id: string; text: string }[]>`
    select id, team_id, text
    from prompts
    order by created_at asc, id asc
  `;

  const boards = await sql<{
    id: string;
    team_id: string;
    user_id: string;
    board_date: string;
    daily_quota: number;
    blocker_note: string;
    coaching_note: string;
  }[]>`
    select id, team_id, user_id, board_date::text, daily_quota, blocker_note, coaching_note
    from boards
    order by user_id asc
  `;

  const mustWins = await sql<{ id: string; board_id: string; text: string }[]>`
    select id, board_id, text
    from must_wins
    order by created_at asc, id asc
  `;

  const tasks = await sql<{
    id: string;
    board_id: string;
    title: string;
    type: TaskType;
    priority: TaskPriority;
    status: TaskStatus;
    created_at: string;
  }[]>`
    select id, board_id, title, type, priority, status, created_at::text
    from tasks
    order by created_at asc, id asc
  `;

  const mustWinMap = new Map<string, { id: string; text: string }[]>();
  for (const mustWin of mustWins) {
    const list = mustWinMap.get(mustWin.board_id) ?? [];
    list.push({ id: mustWin.id, text: mustWin.text });
    mustWinMap.set(mustWin.board_id, list);
  }

  const taskMap = new Map<string, AppStore["boards"][number]["tasks"]>();
  for (const task of tasks) {
    const list = taskMap.get(task.board_id) ?? [];
    list.push({
      id: task.id,
      title: task.title,
      type: task.type,
      priority: task.priority,
      status: task.status,
      createdAt: task.created_at,
    });
    taskMap.set(task.board_id, list);
  }

  return {
    team: {
      id: team.id,
      name: team.name,
      managerModeLabel: team.manager_mode_label,
    },
    users: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passcode: user.passcode,
      systemRole: user.system_role as UserRecord["systemRole"],
      roleLabel: user.role_label,
      teamId: user.team_id,
      active: user.active,
    })),
    prompts: prompts.map((prompt) => ({
      id: prompt.id,
      teamId: prompt.team_id,
      text: prompt.text,
    })),
    doctrine: initialStoreData.doctrine,
    boards: boards.map((board) => ({
      id: board.id,
      teamId: board.team_id,
      userId: board.user_id,
      boardDate: board.board_date,
      dailyQuota: board.daily_quota,
      blockerNote: board.blocker_note,
      coachingNote: board.coaching_note,
      mustWins: mustWinMap.get(board.id) ?? [],
      tasks: taskMap.get(board.id) ?? [],
    })),
  };
}

export async function resetStore() {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const sql = getSql();
    await sql`delete from tasks`;
    await sql`delete from must_wins`;
    await sql`delete from prompts`;
    await sql`delete from boards`;
    await sql`delete from users`;
    await sql`delete from teams`;
    await seedDatabase(sql);
    return;
  }

  await writeFileStore(initialStoreData);
}

function getUserMap(users: UserRecord[]) {
  return new Map(users.map((user) => [user.id, user]));
}

export function getMemberBoards(store: AppStore): TeamMember[] {
  const users = getUserMap(store.users);

  return store.boards
    .map((board) => {
      const user = users.get(board.userId);

      if (!user || !user.active || user.systemRole !== "member") {
        return null;
      }

      return {
        teamId: board.teamId,
        userId: board.userId,
        name: user.name,
        email: user.email,
        passcode: user.passcode,
        role: user.roleLabel,
        dailyQuota: board.dailyQuota,
        mustWins: board.mustWins.map((item) => item.text),
        blockerNote: board.blockerNote,
        coachingNote: board.coachingNote,
        tasks: board.tasks,
      };
    })
    .filter((member): member is TeamMember => member !== null)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getTeamData(store: AppStore): TeamData {
  return {
    team: store.team,
    prompts: store.prompts,
    doctrine: store.doctrine,
    members: getMemberBoards(store),
  };
}

export function getBoardView(store: AppStore, userId: string) {
  const board = store.boards.find((candidate) => candidate.userId === userId);
  const user = store.users.find((candidate) => candidate.id === userId);

  if (!board || !user) {
    return null;
  }

  return {
    boardId: board.id,
    teamId: board.teamId,
    boardDate: board.boardDate,
    userId: board.userId,
    name: user.name,
    role: user.roleLabel,
    dailyQuota: board.dailyQuota,
    mustWins: board.mustWins,
    blockerNote: board.blockerNote,
    coachingNote: board.coachingNote,
    tasks: board.tasks,
  };
}

export function getLoginUsers(store: AppStore) {
  return store.users
    .filter((user) => user.active)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      passcode: user.passcode,
      systemRole: user.systemRole,
      roleLabel: user.roleLabel,
    }));
}

function updateBoard(
  boards: DailyBoardRecord[],
  userId: string,
  updater: (board: DailyBoardRecord) => DailyBoardRecord
) {
  return boards.map((board) => (board.userId === userId ? updater(board) : board));
}

function sanitizeTitle(title: string) {
  return title.trim();
}

function sanitizeQuota(dailyQuota: number) {
  if (!Number.isFinite(dailyQuota) || dailyQuota < 1) {
    return 1;
  }

  return Math.round(dailyQuota);
}

async function getBoardIdForUser(userId: string) {
  const sql = getSql();
  const [board] = await sql<{ id: string }[]>`select id from boards where user_id = ${userId} limit 1`;
  return board?.id ?? null;
}

export async function addTask(userId: string, title: string, type: TaskType, priority: TaskPriority = "Level 2: Strategic") {
  const trimmedTitle = sanitizeTitle(title);

  if (!trimmedTitle) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      insert into tasks (id, board_id, title, type, priority, status, created_at)
      values (${randomUUID()}, ${boardId}, ${trimmedTitle}, ${type}, ${priority}, ${"todo"}, ${new Date().toISOString()})
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      tasks: [
        ...board.tasks,
        {
          id: randomUUID(),
          title: trimmedTitle,
          type,
          priority,
          status: "todo",
          createdAt: new Date().toISOString(),
        },
      ],
    })),
  }));
}

export async function updateTask(userId: string, taskId: string, title: string, type: TaskType, priority: TaskPriority = "Level 2: Strategic") {
  const trimmedTitle = sanitizeTitle(title);

  if (!trimmedTitle) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      update tasks
      set title = ${trimmedTitle}, type = ${type}, priority = ${priority}
      where id = ${taskId} and board_id = ${boardId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      tasks: board.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              title: trimmedTitle,
              type,
              priority,
            }
          : task
      ),
    })),
  }));
}

export async function setTaskStatus(userId: string, taskId: string, status: TaskStatus) {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      update tasks
      set status = ${status}
      where id = ${taskId} and board_id = ${boardId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      tasks: board.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task
      ),
    })),
  }));
}

export async function deleteTask(userId: string, taskId: string) {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      delete from tasks
      where id = ${taskId} and board_id = ${boardId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      tasks: board.tasks.filter((task) => task.id !== taskId),
    })),
  }));
}

export async function updateBoardNotes(userId: string, blockerNote: string, coachingNote: string, dailyQuota: number) {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    await getSql()`
      update boards
      set blocker_note = ${blockerNote.trim()},
          coaching_note = ${coachingNote.trim()},
          daily_quota = ${sanitizeQuota(dailyQuota)}
      where user_id = ${userId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      blockerNote: blockerNote.trim(),
      coachingNote: coachingNote.trim(),
      dailyQuota: sanitizeQuota(dailyQuota),
    })),
  }));
}

export async function addMustWin(userId: string, text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      insert into must_wins (id, board_id, text)
      values (${randomUUID()}, ${boardId}, ${trimmedText})
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      mustWins: [
        ...board.mustWins,
        {
          id: randomUUID(),
          text: trimmedText,
        },
      ],
    })),
  }));
}

export async function updateMustWin(userId: string, mustWinId: string, text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      update must_wins
      set text = ${trimmedText}
      where id = ${mustWinId} and board_id = ${boardId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      mustWins: board.mustWins.map((mustWin) =>
        mustWin.id === mustWinId
          ? {
              ...mustWin,
              text: trimmedText,
            }
          : mustWin
      ),
    })),
  }));
}

export async function deleteMustWin(userId: string, mustWinId: string) {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const boardId = await getBoardIdForUser(userId);

    if (!boardId) {
      return;
    }

    await getSql()`
      delete from must_wins
      where id = ${mustWinId} and board_id = ${boardId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    boards: updateBoard(store.boards, userId, (board) => ({
      ...board,
      mustWins: board.mustWins.filter((mustWin) => mustWin.id !== mustWinId),
    })),
  }));
}

export async function addPrompt(teamId: string, text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    await getSql()`
      insert into prompts (id, team_id, text)
      values (${randomUUID()}, ${teamId}, ${trimmedText})
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    prompts: [
      ...store.prompts,
      {
        id: randomUUID(),
        teamId,
        text: trimmedText,
      },
    ],
  }));
}

export async function updatePrompt(promptId: string, text: string) {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    await getSql()`
      update prompts
      set text = ${trimmedText}
      where id = ${promptId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    prompts: store.prompts.map((prompt) =>
      prompt.id === promptId
        ? {
            ...prompt,
            text: trimmedText,
          }
        : prompt
    ),
  }));
}

export async function deletePrompt(promptId: string) {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    await getSql()`
      delete from prompts
      where id = ${promptId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    prompts: store.prompts.filter((prompt) => prompt.id !== promptId),
  }));
}

export async function addTeamMember(input: {
  name: string;
  email: string;
  passcode: string;
  roleLabel: string;
  dailyQuota: number;
  teamId: string;
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const passcode = input.passcode.trim();
  const roleLabel = input.roleLabel.trim();

  if (!name || !email || !passcode || !roleLabel) {
    return;
  }

  const memberId = randomUUID();

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const sql = getSql();
    await sql`
      insert into users (id, name, email, passcode, system_role, role_label, team_id, active)
      values (${memberId}, ${name}, ${email}, ${passcode}, ${"member"}, ${roleLabel}, ${input.teamId}, ${true})
    `;

    await sql`
      insert into boards (id, team_id, user_id, board_date, daily_quota, blocker_note, coaching_note)
      values (${randomUUID()}, ${input.teamId}, ${memberId}, ${new Date().toISOString().slice(0, 10)}, ${sanitizeQuota(input.dailyQuota)}, ${""}, ${""})
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    users: [
      ...store.users,
      {
        id: memberId,
        name,
        email,
        passcode,
        systemRole: "member",
        roleLabel,
        teamId: input.teamId,
        active: true,
      },
    ],
    boards: [
      ...store.boards,
      {
        id: randomUUID(),
        teamId: input.teamId,
        userId: memberId,
        boardDate: new Date().toISOString().slice(0, 10),
        dailyQuota: sanitizeQuota(input.dailyQuota),
        mustWins: [],
        blockerNote: "",
        coachingNote: "",
        tasks: [],
      },
    ],
  }));
}

export async function updateTeamMember(input: {
  userId: string;
  name: string;
  email: string;
  passcode: string;
  roleLabel: string;
  dailyQuota: number;
}) {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const passcode = input.passcode.trim();
  const roleLabel = input.roleLabel.trim();

  if (!name || !email || !passcode || !roleLabel) {
    return;
  }

  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    const sql = getSql();
    await sql`
      update users
      set name = ${name},
          email = ${email},
          passcode = ${passcode},
          role_label = ${roleLabel}
      where id = ${input.userId}
    `;

    await sql`
      update boards
      set daily_quota = ${sanitizeQuota(input.dailyQuota)}
      where user_id = ${input.userId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    users: store.users.map((user) =>
      user.id === input.userId
        ? {
            ...user,
            name,
            email,
            passcode,
            roleLabel,
          }
        : user
    ),
    boards: updateBoard(store.boards, input.userId, (board) => ({
      ...board,
      dailyQuota: sanitizeQuota(input.dailyQuota),
    })),
  }));
}

export async function deleteTeamMember(userId: string) {
  if (databaseEnabled()) {
    await ensureDatabaseInitialized();
    await getSql()`
      delete from users
      where id = ${userId}
    `;
    return;
  }

  await updateFileStore((store) => ({
    ...store,
    users: store.users.filter((user) => user.id !== userId),
    boards: store.boards.filter((board) => board.userId !== userId),
  }));
}
