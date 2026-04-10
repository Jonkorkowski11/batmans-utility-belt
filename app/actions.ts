"use server";

import { revalidatePath } from "next/cache";

function revalidateCorePaths() {
  revalidatePath("/");
  revalidatePath("/login");
}

export async function resetDemoDataAction() {
  // Import here to avoid circular deps at module level
  const { prisma } = await import("@/lib/db");
  await prisma.message.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  // Re-run seed logic inline (simplified)
  revalidateCorePaths();
}
