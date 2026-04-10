import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.task.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const jon = await prisma.user.create({
    data: {
      name: "Jon Korkowski",
      email: "jon@truerankdigital.com",
      role: "ADMIN",
      passcode: "utility-belt",
    },
  });

  const bishop = await prisma.user.create({
    data: {
      name: "Bishop",
      email: "bishop@truerankdigital.com",
      role: "ADMIN",
      passcode: "bishop-admin",
    },
  });

  const jesse = await prisma.user.create({
    data: {
      name: "Jesse",
      email: "jesse@truerankdigital.com",
      role: "EMPLOYEE",
      passcode: "jesse-pace",
    },
  });

  const eric = await prisma.user.create({
    data: {
      name: "Eric",
      email: "eric@truerankdigital.com",
      role: "EMPLOYEE",
      passcode: "eric-pace",
    },
  });

  const jose = await prisma.user.create({
    data: {
      name: "Jose",
      email: "jose@truerankdigital.com",
      role: "EMPLOYEE",
      passcode: "jose-pace",
    },
  });

  // Seed sample E.O.S. tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Finalize Entity Stacking Architecture",
        description: "Complete the entity stacking strategy for all client accounts",
        type: "ROCK",
        status: "OPEN",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: jesse.id,
        dueDate: new Date("2026-06-30"),
      },
      {
        title: "Prospect 20 new local businesses",
        type: "TODO",
        status: "OPEN",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: eric.id,
        dueDate: new Date("2026-04-14"),
      },
      {
        title: "Send 10 follow-up emails to warm leads",
        type: "TODO",
        status: "OPEN",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: eric.id,
        dueDate: new Date("2026-04-14"),
      },
      {
        title: "QA 8 local landing pages",
        type: "TODO",
        status: "DONE",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: jesse.id,
      },
      {
        title: "Send 12 overdue client follow-ups",
        type: "TODO",
        status: "DONE",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: jesse.id,
      },
      {
        title: "Prospect 15 local businesses",
        type: "TODO",
        status: "DONE",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: jose.id,
      },
      {
        title: "Request 10 GBP review links",
        type: "TODO",
        status: "OPEN",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: jesse.id,
      },
      {
        title: "Send 10 Loom recap follow-ups",
        type: "TODO",
        status: "OPEN",
        persona: "TRUERANK_DIGITAL",
        creatorId: jon.id,
        assigneeId: jose.id,
      },
      {
        title: "Build JJK personal brand content calendar",
        type: "ROCK",
        status: "OPEN",
        persona: "JON_J_KORKOWSKI",
        creatorId: jon.id,
        assigneeId: bishop.id,
        dueDate: new Date("2026-06-30"),
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log(`   Created ${5} users (2 admins, 3 employees)`);
  console.log(`   Created ${9} sample E.O.S. tasks`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
