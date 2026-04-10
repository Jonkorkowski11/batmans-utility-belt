"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import {
  Crosshair,
  Satellite,
  LogOut,
  Bolt,
  SatelliteDish,
  User,
  Users,
  Plus,
  MessageCircle,
  Calendar,
  Target,
  AlertTriangle,
  BarChart3,
  Timer,
  BookOpen,
} from "lucide-react";

type TaskItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  persona: string;
  dueDate: string | null;
  gCalEventId: string | null;
  assignee: { id: string; name: string | null; email: string | null };
  creator: { id: string; name: string | null };
  _count: { messages: number };
};

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
};

export function ManagerDashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // New task form
  const [newTitle, setNewTitle] = useState("");
  const [newAssignee, setNewAssignee] = useState("");
  const [newType, setNewType] = useState("TODO");
  const [newPriority, setNewPriority] = useState("TRUERANK_DIGITAL");
  const [newDueDate, setNewDueDate] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  // Filter
  const [filterPersona, setFilterPersona] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const showToast = (message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };

  const loadTasks = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterPersona !== "ALL") params.set("persona", filterPersona);
    if (filterStatus !== "ALL") params.set("status", filterStatus);

    const res = await fetch(`/api/tasks?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
    setLoading(false);
  }, [filterPersona, filterStatus]);

  const loadMembers = useCallback(async () => {
    const res = await fetch("/api/users");
    if (res.ok) {
      setMembers(await res.json());
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadMembers();
  }, [loadTasks, loadMembers]);

  const deployTask = async () => {
    if (!newTitle.trim() || !newAssignee) return;
    setIsPending(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        type: newType,
        persona: newPriority,
        assigneeId: newAssignee,
        dueDate: newDueDate || null,
      }),
    });

    if (res.ok) {
      setNewTitle("");
      setNewDueDate("");
      showToast("Directive deployed. GCal sync + push notification sent.");
      loadTasks();
    }
    setIsPending(false);
  };

  const updateStatus = async (taskId: string, status: string) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status }),
    });
    loadTasks();
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/tasks?taskId=${taskId}`, { method: "DELETE" });
    loadTasks();
  };

  const statusColors: Record<string, string> = {
    OPEN: "text-blue-400 bg-blue-950 border-blue-500/30",
    IN_PROGRESS: "text-amber-400 bg-amber-950 border-amber-500/30",
    DONE: "text-emerald-400 bg-emerald-950 border-emerald-500/30",
    STUCK: "text-red-400 bg-red-950 border-red-500/30",
  };

  const typeIcons: Record<string, string> = {
    ROCK: "🪨",
    TODO: "✅",
    ISSUE: "⚡",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        <div className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
          Loading Command Center...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-red-600 selection:text-white">
      {/* Navbar */}
      <nav className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center z-20 shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src="https://truerankdigital.com/wp-content/uploads/2024/06/True-Rank-Digital-Logo-1.png" 
            alt="True Rank Digital" 
            className="h-8 w-auto brightness-0 invert"
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-xs font-bold text-zinc-400">
            <a href="/vto" className="flex items-center gap-2 hover:text-white transition-colors">
              <Target className="w-3 h-3" /> V/TO
            </a>
            <a href="/scorecard" className="flex items-center gap-2 hover:text-white transition-colors">
              <BarChart3 className="w-3 h-3" /> Scorecard
            </a>
            <a href="/meetings" className="flex items-center gap-2 hover:text-white transition-colors">
              <Timer className="w-3 h-3" /> Meetings
            </a>
            <a href="/accountability" className="flex items-center gap-2 hover:text-white transition-colors">
              <Users className="w-3 h-3" /> Chart
            </a>
            <a href="/processes" className="flex items-center gap-2 hover:text-white transition-colors">
              <BookOpen className="w-3 h-3" /> Processes
            </a>
            <div className="flex items-center gap-2">
              <Satellite className="w-3 h-3" /> E.O.S. Engine Active
            </div>
          </div>
          <span className="text-xs font-bold text-zinc-500">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-7xl mx-auto w-full fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">
              Global Command Center
            </h1>
            <p className="text-zinc-500 font-bold uppercase text-xs mt-1">
              E.O.S. Execution Dashboard — Rocks · To-Dos · Issues
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Deploy Directive */}
            <div className="glass p-6 rounded-xl lg:col-span-1 h-fit">
              <h2 className="text-lg font-black text-white mb-5 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center">
                <Bolt className="text-blue-500 mr-2 w-5 h-5" /> Deploy Directive
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">
                    Operator
                  </label>
                  <select
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="">Select operator...</option>
                    {members
                      .filter((m) => m.role === "EMPLOYEE")
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">
                    Objective
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Map AI keywords..."
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">
                      E.O.S. Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="ROCK">🪨 Rock (90-Day)</option>
                      <option value="TODO">✅ To-Do (7-Day)</option>
                      <option value="ISSUE">⚡ Issue (IDS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">
                      Persona
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                    >
                      <option value="TRUERANK_DIGITAL">[TrueRank]</option>
                      <option value="JON_J_KORKOWSKI">[JJK]</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={deployTask}
                  disabled={isPending || !newTitle.trim() || !newAssignee}
                  className="w-full bg-white text-black hover:bg-zinc-300 font-black py-3 rounded uppercase tracking-widest transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />{" "}
                  {isPending ? "Deploying..." : "Deploy & Sync GCal"}
                </button>
              </div>
            </div>

            {/* Active Crosshairs */}
            <div className="glass p-6 rounded-xl lg:col-span-2">
              <div className="flex justify-between items-center mb-5 border-b border-zinc-800 pb-2">
                <h2 className="text-lg font-black text-white uppercase tracking-wider flex items-center">
                  <SatelliteDish className="text-blue-500 mr-2 w-5 h-5" /> Active
                  Crosshairs
                </h2>
                <div className="flex gap-2">
                  <select
                    value={filterPersona}
                    onChange={(e) => setFilterPersona(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-white rounded px-2 py-1 text-[10px] font-bold uppercase"
                  >
                    <option value="ALL">All Personas</option>
                    <option value="TRUERANK_DIGITAL">TrueRank</option>
                    <option value="JON_J_KORKOWSKI">JJK</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 text-white rounded px-2 py-1 text-[10px] font-bold uppercase"
                  >
                    <option value="ALL">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                    <option value="STUCK">Stuck</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex justify-between items-start gap-4 group hover:border-zinc-700 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{typeIcons[task.type] || "📋"}</span>
                        <span
                          className={`text-sm font-black ${
                            task.status === "DONE"
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-2 items-center flex-wrap">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                          <User className="w-3 h-3" /> {task.assignee.name}
                        </span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            statusColors[task.status] || ""
                          }`}
                        >
                          {task.status.replace("_", " ")}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                          {task.persona === "JON_J_KORKOWSKI" ? "[JJK]" : "[TRD]"}
                        </span>
                        {task.gCalEventId && (
                          <Calendar className="w-3 h-3 text-emerald-500" />
                        )}
                        {task._count.messages > 0 && (
                          <span className="text-[9px] font-bold text-zinc-400 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" /> {task._count.messages}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.status !== "DONE" && (
                        <button
                          onClick={() => updateStatus(task.id, "DONE")}
                          className="text-[9px] font-black uppercase px-2 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-900 transition-all"
                        >
                          Done
                        </button>
                      )}
                      {task.status !== "STUCK" && task.status !== "DONE" && (
                        <button
                          onClick={() => updateStatus(task.id, "STUCK")}
                          className="text-[9px] font-black uppercase px-2 py-1 bg-red-950 text-red-400 border border-red-500/30 rounded hover:bg-red-900 transition-all"
                        >
                          Stuck
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-[9px] font-black uppercase px-2 py-1 bg-zinc-900 text-zinc-500 border border-zinc-700 rounded hover:bg-zinc-800 transition-all"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div className="text-zinc-600 text-sm font-bold text-center py-8">
                    No directives deployed yet. Use the panel to the left.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Overview */}
          <div className="mt-10">
            <h2 className="text-lg font-black text-white mb-5 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" /> Operational Boards
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {members
                .filter((m) => m.role === "EMPLOYEE")
                .map((member) => {
                  const memberTasks = tasks.filter((t) => t.assignee.id === member.id);
                  const done = memberTasks.filter((t) => t.status === "DONE").length;
                  const stuck = memberTasks.filter((t) => t.status === "STUCK").length;

                  return (
                    <div
                      key={member.id}
                      className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg hover:border-blue-500/50 transition-all group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="font-black uppercase text-white group-hover:text-blue-400 transition-colors">
                          {member.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">
                          {member.role}
                        </div>
                      </div>
                      <div className="mt-4 flex justify-between items-end">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          {done} / {memberTasks.length} Done
                          {stuck > 0 && (
                            <span className="text-red-400 ml-2 flex items-center gap-1 inline-flex">
                              <AlertTriangle className="w-3 h-3" /> {stuck} Stuck
                            </span>
                          )}
                        </div>
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-blue-600 text-white px-5 py-4 rounded shadow-2xl font-bold flex items-center gap-3 text-sm pointer-events-auto fade-in"
          >
            <SatelliteDish className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
