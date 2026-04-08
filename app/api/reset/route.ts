import { resetStore } from "@/lib/store";
import { NextResponse } from "next/server";

export async function POST() {
  await resetStore();
  return NextResponse.json({ ok: true, message: "Database reset and re-seeded." });
}
