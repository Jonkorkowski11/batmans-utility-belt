"use server";

import { revalidatePath } from "next/cache";
import { addMustWin, addPrompt, addTask, deleteMustWin, deletePrompt, deleteTask, deleteTeamMember, resetStore, setTaskStatus, updateBoardNotes, updateMustWin, updatePrompt, updateTask, updateTeamMember, addTeamMember } from "@/lib/store";
import { authenticateUser, clearSession, setSession } from "@/lib/auth";
import type { TaskPriority, TaskType } from "@/lib/types";

function revalidateCorePaths(userId?: string, teamId = "execution-team") {
  revalidatePath("/");
  revalidatePath("/login");
  if (userId) {
    revalidatePath(`/team/${teamId}/member/${userId}`);
  }
}

export async function loginAction(input: { email: string; passcode: string }) {
  const user = await authenticateUser(input.email, input.passcode);

  if (!user) {
    return {
      ok: false,
      error: "Invalid email or passcode.",
    };
  }

  await setSession({
    userId: user.id,
    systemRole: user.systemRole,
    teamId: user.teamId,
  });

  revalidateCorePaths(user.id, user.teamId);

  return { ok: true };
}

export async function logoutAction() {
  await clearSession();
  revalidateCorePaths();
  return { ok: true };
}

export async function resetDemoDataAction() {
  await resetStore();
  revalidateCorePaths();
}

export async function createTaskAction(input: { userId: string; title: string; type: TaskType; priority: TaskPriority; teamId: string }) {
  await addTask(input.userId, input.title, input.type, input.priority);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function updateTaskAction(input: {
  userId: string;
  taskId: string;
  title: string;
  type: TaskType;
  priority: TaskPriority;
  teamId: string;
}) {
  await updateTask(input.userId, input.taskId, input.title, input.type, input.priority);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function toggleTaskAction(input: {
  userId: string;
  taskId: string;
  nextStatus: "todo" | "done";
  teamId: string;
}) {
  await setTaskStatus(input.userId, input.taskId, input.nextStatus);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function deleteTaskAction(input: { userId: string; taskId: string; teamId: string }) {
  await deleteTask(input.userId, input.taskId);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function updateBoardAction(input: {
  userId: string;
  blockerNote: string;
  coachingNote: string;
  dailyQuota: number;
  teamId: string;
}) {
  await updateBoardNotes(input.userId, input.blockerNote, input.coachingNote, input.dailyQuota);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function addMustWinAction(input: { userId: string; text: string; teamId: string }) {
  await addMustWin(input.userId, input.text);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function updateMustWinAction(input: {
  userId: string;
  mustWinId: string;
  text: string;
  teamId: string;
}) {
  await updateMustWin(input.userId, input.mustWinId, input.text);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function deleteMustWinAction(input: { userId: string; mustWinId: string; teamId: string }) {
  await deleteMustWin(input.userId, input.mustWinId);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function addPromptAction(input: { teamId: string; text: string }) {
  await addPrompt(input.teamId, input.text);
  revalidateCorePaths(undefined, input.teamId);
}

export async function updatePromptAction(input: { promptId: string; text: string; teamId: string }) {
  await updatePrompt(input.promptId, input.text);
  revalidateCorePaths(undefined, input.teamId);
}

export async function deletePromptAction(input: { promptId: string; teamId: string }) {
  await deletePrompt(input.promptId);
  revalidateCorePaths(undefined, input.teamId);
}

export async function addTeamMemberAction(input: {
  teamId: string;
  name: string;
  email: string;
  passcode: string;
  roleLabel: string;
  dailyQuota: number;
}) {
  await addTeamMember(input);
  revalidateCorePaths(undefined, input.teamId);
}

export async function updateTeamMemberAction(input: {
  userId: string;
  teamId: string;
  name: string;
  email: string;
  passcode: string;
  roleLabel: string;
  dailyQuota: number;
}) {
  await updateTeamMember(input);
  revalidateCorePaths(input.userId, input.teamId);
}

export async function deleteTeamMemberAction(input: { userId: string; teamId: string }) {
  await deleteTeamMember(input.userId);
  revalidateCorePaths(undefined, input.teamId);
}
