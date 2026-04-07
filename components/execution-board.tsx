"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { 
  Lock, 
  Satellite, 
  LogOut,
  Crosshair,
  CheckCircle
} from "lucide-react";
import { 
  logoutAction, 
  toggleTaskAction 
} from "@/app/actions";
import type { Task } from "@/lib/types";

interface ExecutionBoardProps {
  data: {
    boardId: string;
    teamId: string;
    userId: string;
    name: string;
    role: string;
    dailyQuota: number;
    tasks: Task[];
  };
}

export function ExecutionBoard({ data }: ExecutionBoardProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

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

  const handleToggleTask = (taskId: string, currentStatus: "todo" | "done") => {
    const nextStatus = currentStatus === "todo" ? "done" : "todo";
    startTransition(async () => {
      await toggleTaskAction({
        userId: data.userId,
        teamId: data.teamId,
        taskId,
        nextStatus,
      });
      if (nextStatus === "done") {
        showToast(`WEBHOOK FIRED: Jon & Bishop notified via Google Chat: ${data.name} completed task.`);
      }
    });
  };

  // Lockdown Rule: Level 1 task + Past Due + Not Completed
  const criticalOverdue = data.tasks.filter(
    (t) => t.priority === "Level 1: Critical" && t.isPastDue && t.status === "todo"
  );
  const isLocked = criticalOverdue.length > 0;

  // Sorting: Past due first, then by priority (Level 1, 2, 3)
  const sortedTasks = [...data.tasks].sort((a, b) => {
    if (a.isPastDue !== b.isPastDue) return a.isPastDue ? -1 : 1;
    return a.priority.localeCompare(b.priority);
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-red-600 selection:text-white overflow-hidden">
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
          <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">Execution Board</h1>
              <p className="text-zinc-500 font-bold uppercase text-xs mt-1">Focus. Execute. Dominate.</p>
            </div>
            <div className="text-right">
              <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Operator</div>
              <div className="text-white font-black uppercase tracking-wider">{data.name}</div>
            </div>
          </div>

          {isLocked && (
            <div className="bg-red-950/40 border border-red-600 p-6 rounded-xl mb-8 shadow-[0_0_20px_rgba(220,38,38,0.15)] fade-in">
              <h2 className="text-red-500 text-xl font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                <Lock className="w-5 h-5" /> System Locked: Bottleneck Detected
              </h2>
              <p className="text-red-200 text-sm font-semibold max-w-3xl">
                You failed to execute a Level 1 priority directive yesterday. Elite operators do not leave critical tasks behind. All daily operations are halted. Neutralize the bottleneck below to restore your operational capacity.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {sortedTasks.map((task) => {
              const isThisTheBlocker = task.priority === "Level 1: Critical" && task.isPastDue && task.status === "todo";
              const isDisabled = (isLocked && !isThisTheBlocker) || task.status === "done";
              
              let borderClass = "border-l-4 ";
              let badgeClass = "text-[10px] font-black uppercase tracking-widest ";
              
              if (task.priority.includes("1")) {
                borderClass += "border-l-[#dc2626]";
                badgeClass += "text-red-500";
              } else if (task.priority.includes("2")) {
                borderClass += "border-l-[#f59e0b]";
                badgeClass += "text-amber-500";
              } else {
                borderClass += "border-l-[#0ea5e9]";
                badgeClass += "text-blue-500";
              }

              const opacityClass = isDisabled && task.status === "todo" && isLocked 
                ? "opacity-30 grayscale pointer-events-none" 
                : (task.status === "done" ? "opacity-50" : "");

              return (
                <div 
                  key={task.id}
                  className={`bg-zinc-900 p-5 rounded-lg border border-zinc-800 ${borderClass} ${opacityClass} flex items-center justify-between transition-all`}
                >
                  <div className="flex items-center gap-5 w-full">
                    <button 
                      onClick={() => handleToggleTask(task.id, task.status)}
                      disabled={isDisabled && !isThisTheBlocker && isLocked}
                      className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                        task.status === "done" 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-zinc-950 border-zinc-700 text-transparent hover:border-blue-500"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${task.status === "done" ? "text-zinc-500 line-through" : "text-white"}`}>
                        {isThisTheBlocker && (
                          <span className="text-red-500 mr-2 text-sm uppercase tracking-widest border border-red-500 px-2 py-0.5 rounded">
                            Past Due
                          </span>
                        )}
                        {task.title}
                      </h3>
                      <div className="flex gap-4 mt-2 text-[10px] font-black uppercase tracking-widest">
                        <span className={badgeClass}>{task.priority}</span>
                        <span className="text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded">Daily</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {sortedTasks.length === 0 && (
              <div className="text-zinc-600 font-bold italic text-sm">No directives assigned.</div>
            )}
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
            <Satellite className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
