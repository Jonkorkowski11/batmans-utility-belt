import { prisma } from "@/lib/db";
import { google } from "googleapis";

type TaskWithAssignee = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  persona: string;
  dueDate: Date | null;
  assigneeId: string;
  assignee: { id: string; name: string | null; email: string | null };
};

export async function syncTaskToCalendar(task: TaskWithAssignee) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("GCal sync skipped: Google OAuth not configured");
    return;
  }

  const account = await prisma.account.findFirst({
    where: { userId: task.assigneeId, provider: "google" },
  });

  if (!account?.refresh_token) {
    console.log(`GCal sync skipped: No refresh token for user ${task.assigneeId}`);
    return;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: account.refresh_token });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });
  const prefix = task.persona === "JON_J_KORKOWSKI" ? "[JJK]" : "[TrueRank]";

  const startTime = task.dueDate || new Date();
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

  const event = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: `${prefix} [E.O.S ${task.type}] ${task.title}`,
      description: `${task.description || ""}\n\nAssigned via Utility Belt.`,
      start: { dateTime: startTime.toISOString() },
      end: { dateTime: endTime.toISOString() },
      reminders: {
        useDefault: false,
        overrides: [{ method: "popup", minutes: 60 }],
      },
    },
  });

  if (event.data?.id) {
    await prisma.task.update({
      where: { id: task.id },
      data: { gCalEventId: event.data.id },
    });
  }
}
