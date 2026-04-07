"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { 
  Crosshair, 
  Satellite, 
  LogOut, 
  Bolt, 
  SatelliteDish, 
  User, 
  Plus
} from "lucide-react";
import { 
  createTaskAction, 
  logoutAction 
} from "@/app/actions";
import type { TeamData, TaskPriority } from "@/lib/types";

interface ManagerDashboardProps {
  data: TeamData;
}

export function ManagerDashboard({ data }: ManagerDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);
  
  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState(data.members[0]?.userId || "");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("Level 2: Strategic");

  const showToast = (message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  const deployTask = () => {
    if (!newTaskTitle.trim() || !newTaskAssignee) return;
    
    startTransition(async () => {
      await createTaskAction({
        userId: newTaskAssignee,
        teamId: data.team.id,
        title: newTaskTitle,
        type: "other",
        priority: newTaskPriority,
      });
      setNewTaskTitle("");
      showToast("Target deployed to Operator and pushed to Google Calendar.");
    });
  };

  // Flatten all active tasks for the "Active Crosshairs" view
  const allActiveTasks = data.members.flatMap(m => 
    m.tasks.filter(t => t.status === "todo").map(t => ({ ...t, memberName: m.name }))
  ).sort((a, b) => a.priority.localeCompare(b.priority));

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-red-600 selection:text-white">
      {/* Navbar */}
      <nav className="bg-zinc-950 border-b border-zinc-800 px-6 py-4 flex justify-between items-center z-20 shadow-md">
        <div className="flex items-center gap-3">
          <Crosshair className="text-blue-500 w-6 h-6" />
          <span className="text-xl font-black tracking-widest uppercase">
            True Rank <span className="text-blue-500">Digital</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-400">
            <Satellite className="w-3 h-3" /> Workspace Sync Active
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
          >
            <LogOut className="w-4 h-4" /> Exit
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
        <div className="max-w-7xl mx-auto w-full fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Global Command Center</h1>
            <p className="text-zinc-500 font-bold uppercase text-xs mt-1">Operator Execution Overview</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Deploy Directive Section */}
            <div className="glass p-6 rounded-xl lg:col-span-1 h-fit">
              <h2 className="text-lg font-black text-white mb-5 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center">
                <Bolt className="text-blue-500 mr-2 w-5 h-5" /> Deploy Directive
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Operator</label>
                  <select 
                    value={newTaskAssignee}
                    onChange={(e) => setNewTaskAssignee(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                  >
                    {data.members.map(m => (
                      <option key={m.userId} value={m.userId}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Objective</label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="e.g. Map AI keywords..." 
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Priority Level</label>
                  <select 
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none"
                  >
                    <option value="Level 1: Critical">Level 1: Mission-Critical (Triggers Lockout)</option>
                    <option value="Level 2: Strategic">Level 2: Strategic</option>
                    <option value="Level 3: Operational">Level 3: Operational</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-1">Frequency</label>
                  <select className="w-full bg-zinc-950 border border-zinc-800 text-white rounded p-3 text-sm focus:border-blue-500 outline-none">
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <button 
                  onClick={deployTask}
                  disabled={isPending}
                  className="w-full bg-white text-black hover:bg-zinc-300 font-black py-3 rounded uppercase tracking-widest transition-all mt-2 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" /> {isPending ? "Deploying..." : "Deploy & Sync G-Cal"}
                </button>
              </div>
            </div>

            {/* Active Crosshairs Section */}
            <div className="glass p-6 rounded-xl lg:col-span-2">
              <h2 className="text-lg font-black text-white mb-5 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center">
                <SatelliteDish className="text-blue-500 mr-2 w-5 h-5" /> Active Crosshairs
              </h2>
              <div className="space-y-3">
                {allActiveTasks.map((t, idx) => {
                  let badgeClass = "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded ";
                  if (t.priority.includes("1")) badgeClass += "text-red-500 bg-red-950";
                  else if (t.priority.includes("2")) badgeClass += "text-amber-500 bg-amber-950";
                  else badgeClass += "text-blue-500 bg-blue-950";

                  return (
                    <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex justify-between items-center">
                      <div>
                        <div className="text-sm font-black text-white">{t.title}</div>
                        <div className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-wider flex items-center gap-1">
                          <User className="w-3 h-3" /> {t.memberName}
                        </div>
                      </div>
                      <div className={badgeClass}>{t.priority}</div>
                    </div>
                  );
                })}
                {allActiveTasks.length === 0 && (
                  <div className="text-zinc-600 text-sm font-bold">No active directives globally.</div>
                )}
              </div>
            </div>
          </div>

          {/* Members Overview Link */}
          <div className="mt-10">
             <h2 className="text-lg font-black text-white mb-5 uppercase tracking-wider">Operational Boards</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.members.map(member => (
                  <Link 
                    key={member.userId} 
                    href={`/team/${member.teamId}/member/${member.userId}`}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg hover:border-blue-500 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-black uppercase text-white group-hover:text-blue-400 transition-colors">{member.name}</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase">{member.role}</div>
                    </div>
                    <div className="mt-4 flex justify-between items-end">
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        {member.tasks.filter(t => t.status === "done").length} / {member.tasks.length} Completed
                      </div>
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    </div>
                  </Link>
                ))}
             </div>
          </div>
        </div>
      </main>

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id}
            className="bg-blue-600 text-white px-5 py-4 rounded shadow-2xl font-bold flex items-center gap-3 text-sm animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
          >
            <SatelliteDish className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
