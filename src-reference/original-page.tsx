"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Shield, Target, TimerReset, TrendingUp, AlertTriangle } from "lucide-react";

type TaskStatus = "todo" | "done";

type Task = {
  id: number;
  title: string;
  type: "calls" | "follow-up" | "build" | "admin" | "sales";
  status: TaskStatus;
};

type TeamMember = {
  key: "jesse" | "jose";
  name: string;
  role: string;
  dailyQuota: number;
  mustWins: string[];
  blockers: string;
  tasks: Task[];
};

const initialTeam: TeamMember[] = [
  {
    key: "jesse",
    name: "Jesse",
    role: "Execution Operator",
    dailyQuota: 50,
    mustWins: [
      "Touch every active priority before noon",
      "Clear follow-ups before starting low-value admin",
      "Escalate blockers fast instead of waiting",
    ],
    blockers: "Waiting on assets from two accounts. Needs to pull next-best actions instead of pausing.",
    tasks: [
      { id: 1, title: "Send 12 overdue client follow-ups", type: "follow-up", status: "done" },
      { id: 2, title: "QA 8 local landing pages", type: "build", status: "done" },
      { id: 3, title: "Request 10 GBP review links", type: "calls", status: "todo" },
      { id: 4, title: "Close out 6 reporting notes", type: "admin", status: "todo" },
      { id: 5, title: "Push 5 schema fixes to queue", type: "build", status: "todo" },
      { id: 6, title: "Follow up on 4 leads", type: "sales", status: "done" },
    ],
  },
  {
    key: "jose",
    name: "Jose",
    role: "Growth Support",
    dailyQuota: 50,
    mustWins: [
      "Start with revenue-linked work first",
      "Keep task count high and visible all day",
      "Leave no ambiguity on next action",
    ],
    blockers: "Strong when directed. Needs a visible plan and pace target to self-manage better.",
    tasks: [
      { id: 1, title: "Prospect 15 local businesses", type: "sales", status: "done" },
      { id: 2, title: "Send 10 Loom recap follow-ups", type: "follow-up", status: "todo" },
      { id: 3, title: "Review 8 citation issues", type: "build", status: "done" },
      { id: 4, title: "Book 5 next-step calls", type: "calls", status: "todo" },
      { id: 5, title: "Clear inbox to zero", type: "admin", status: "done" },
      { id: 6, title: "Prep 6 outreach targets", type: "sales", status: "todo" },
    ],
  },
];

const typeLabels: Record<Task["type"], string> = {
  calls: "Calls",
  "follow-up": "Follow-Up",
  build: "Build",
  admin: "Admin",
  sales: "Sales",
};

function quotaHealth(percent: number) {
  if (percent >= 100) return { label: "Quota hit", tone: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
  if (percent >= 70) return { label: "On pace", tone: "text-amber-300 border-amber-400/30 bg-amber-400/10" };
  return { label: "Needs pressure", tone: "text-red-300 border-red-400/30 bg-red-400/10" };
}

export default function BatmansUtilityBeltPage() {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [selectedKey, setSelectedKey] = useState<TeamMember["key"]>("jesse");
  const [newTask, setNewTask] = useState("");

  const selectedMember = useMemo(
    () => team.find((member) => member.key === selectedKey) ?? team[0],
    [selectedKey, team]
  );

  const toggleTask = (taskId: number) => {
    setTeam((current) =>
      current.map((member) =>
        member.key !== selectedKey
          ? member
          : {
              ...member,
              tasks: member.tasks.map((task) =>
                task.id === taskId
                  ? { ...task, status: task.status === "done" ? "todo" : "done" }
                  : task
              ),
            }
      )
    );
  };

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;

    setTeam((current) =>
      current.map((member) =>
        member.key !== selectedKey
          ? member
          : {
              ...member,
              tasks: [
                ...member.tasks,
                {
                  id: Date.now(),
                  title,
                  type: "admin",
                  status: "todo",
                },
              ],
            }
      )
    );
    setNewTask("");
  };

  const completedCount = selectedMember.tasks.filter((task) => task.status === "done").length;
  const percentToQuota = Math.round((completedCount / selectedMember.dailyQuota) * 100);
  const openCount = selectedMember.tasks.length - completedCount;
  const health = quotaHealth(percentToQuota);

  const teamRollup = team.map((member) => {
    const done = member.tasks.filter((task) => task.status === "done").length;
    const pct = Math.round((done / member.dailyQuota) * 100);
    return { ...member, done, pct, open: member.tasks.length - done, health: quotaHealth(pct) };
  });

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl border border-amber-400/20 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.20),_transparent_35%),linear-gradient(135deg,#0f172a,#111827,#020617)] p-6 shadow-2xl shadow-black/30 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                <Shield className="h-4 w-4" /> Batman&apos;s Utility Belt
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Daily execution discipline for people who wait for direction.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                A lightweight manager tool for Jesse and Jose to plan the day, hit output quotas, and feel the difference between five tasks and fifty actions.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <StatChip label="Team quota" value="100 actions" icon={<Target className="h-4 w-4" />} />
              <StatChip label="Today complete" value={`${teamRollup.reduce((sum, member) => sum + member.done, 0)} tasks`} icon={<TrendingUp className="h-4 w-4" />} />
              <StatChip label="Manager mode" value="Live" icon={<TimerReset className="h-4 w-4" />} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-950/70 text-white shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle>Manager view</CardTitle>
                <CardDescription className="text-slate-400">
                  See pace, pressure, and who needs intervention.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {teamRollup.map((member) => (
                  <button
                    key={member.key}
                    onClick={() => setSelectedKey(member.key)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedKey === member.key
                        ? "border-amber-400/50 bg-amber-400/10"
                        : "border-slate-800 bg-slate-900/70 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold">{member.name}</div>
                        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{member.role}</div>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${member.health.tone}`}>
                        {member.health.label}
                      </span>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
                      <MetricBox label="Done" value={member.done} />
                      <MetricBox label="Open" value={member.open} />
                      <MetricBox label="Quota" value={`${member.pct}%`} />
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-950/70 text-white shadow-xl shadow-black/20">
              <CardHeader>
                <CardTitle>Operating doctrine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-300">
                <DoctrineRow title="Plan before drift" text="Every day starts with visible commitments, not vague intention." />
                <DoctrineRow title="Quota creates pace" text="The point is output volume, not feeling busy." />
                <DoctrineRow title="Blockers get escalated" text="No waiting around when the next useful action exists." />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-800 bg-slate-950/70 text-white shadow-xl shadow-black/20">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedMember.name}&apos;s day plan</CardTitle>
                  <CardDescription className="mt-1 text-slate-400">{selectedMember.role} • simple execution dashboard</CardDescription>
                </div>
                <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${health.tone}`}>
                  {health.label}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <DashboardStat label="Daily quota" value={selectedMember.dailyQuota.toString()} help="Expected actions today" />
                  <DashboardStat label="Completed" value={completedCount.toString()} help="Visible finished actions" />
                  <DashboardStat label="Open" value={openCount.toString()} help="Still on the board" />
                  <DashboardStat label="Pace" value={`${percentToQuota}%`} help="Completion vs quota" />
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Top must-win standards</h2>
                    <span className="text-xs text-slate-500">Non-negotiable behavior</span>
                  </div>
                  <div className="grid gap-3 md:grid-cols-3">
                    {selectedMember.mustWins.map((win) => (
                      <div key={win} className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-sm text-slate-200">
                        {win}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Today&apos;s execution list</h2>
                        <p className="mt-1 text-sm text-slate-500">Turn vague work into countable actions.</p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newTask}
                          onChange={(event) => setNewTask(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") addTask();
                          }}
                          placeholder="Add another action..."
                          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-slate-500 focus:border-amber-400/50 md:w-64"
                        />
                        <Button onClick={addTask} className="bg-amber-400 text-slate-950 hover:bg-amber-300">
                          Add
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {selectedMember.tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                            task.status === "done"
                              ? "border-emerald-500/30 bg-emerald-500/10"
                              : "border-slate-800 bg-slate-950/80 hover:border-slate-700"
                          }`}
                        >
                          <div className="pt-0.5 text-amber-300">
                            {task.status === "done" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Circle className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <span className={`font-medium ${task.status === "done" ? "text-emerald-100 line-through decoration-emerald-400/70" : "text-white"}`}>
                                {task.title}
                              </span>
                              <span className="inline-flex w-fit rounded-full border border-slate-700 px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                                {typeLabels[task.type]}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <Card className="border-slate-800 bg-slate-900/70 text-white">
                      <CardHeader>
                        <CardTitle className="text-lg">Blockers / coaching note</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/5 p-4 text-sm text-slate-200">
                          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
                          <p>{selectedMember.blockers}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-800 bg-slate-900/70 text-white">
                      <CardHeader>
                        <CardTitle className="text-lg">Manager prompts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-slate-300">
                        <PromptRow text="What are your 3 highest-value actions before lunch?" />
                        <PromptRow text="If you finish this list early, what is the next queue you pull from?" />
                        <PromptRow text="What did you create momentum on without being told?" />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatChip({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-700/70 bg-slate-950/50 p-4 text-white backdrop-blur">
      <div className="mb-2 flex items-center gap-2 text-amber-300">{icon}</div>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

function DashboardStat({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{help}</div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-2 py-3">
      <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-white">{value}</div>
    </div>
  );
}

function DoctrineRow({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="font-medium text-white">{title}</div>
      <div className="mt-1 text-sm text-slate-400">{text}</div>
    </div>
  );
}

function PromptRow({ text }: { text: string }) {
  return <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">{text}</div>;
}
