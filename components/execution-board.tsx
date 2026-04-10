"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  Lock, 
  Satellite, 
  LogOut,
  Crosshair,
  CheckCircle
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

interface ExecutionBoardProps {
  data: {
    userId: string;
    name: string;
    role: string;
    tasks: TaskItem[];
  };
}

export function ExecutionBoard({ data }: ExecutionBoardProps) {
  const router = useRouter();
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  const showToast = (message: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "DONE" ? "OPEN" : "DONE";
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: nextStatus }),
    });
    if (nextStatus === "DONE") {
      showToast(`Task completed by ${data.name}. Great work!`);
    }
    router.refresh();
  };

  // Lockdown Rule: ROCK type + Past Due + Not Done
  const now = new Date();
  const criticalOverdue = data.tasks.filter(
    (t) => t.type === "ROCK" && t.dueDate && new Date(t.dueDate) < now && t.status !== "DONE"
  );
  const isLocked = criticalOverdue.length > 0;

  // Sorting: Past due first, then by type (ROCK, ISSUE, TODO)
  const typeOrder: Record<string, number> = { ROCK: 0, ISSUE: 1, TODO: 2 };
  const sortedTasks = [...data.tasks].sort((a, b) => {
    const aPastDue = a.dueDate && new Date(a.dueDate) < now;
    const bPastDue = b.dueDate && new Date(b.dueDate) < now;
    if (aPastDue !== bPastDue) return aPastDue ? -1 : 1;
    return (typeOrder[a.type] ?? 3) - (typeOrder[b.type] ?? 3);
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
            onClick={() => signOut({ callbackUrl: "/login" })}
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
                You have an overdue Rock directive. Elite operators do not leave critical tasks behind. All daily operations are halted. Neutralize the bottleneck below to restore your operational capacity.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {sortedTasks.map((task) => {
              const isPastDue = task.dueDate && new Date(task.dueDate) < now && task.status !== "DONE";
              const isThisTheBlocker = task.type === "ROCK" && isPastDue;
              const isDisabled = (isLocked && !isThisTheBlocker) || task.status === "DONE";
              
              let borderClass = "border-l-4 ";
              let badgeClass = "text-[10px] font-black uppercase tracking-widest ";
              
              if (task.type === "ROCK") {
                borderClass += "border-l-[#dc2626]";
                badgeClass += "text-red-500";
              } else if (task.type === "ISSUE") {
                borderClass += "border-l-[#f59e0b]";
                badgeClass += "text-amber-500";
              } else {
                borderClass += "border-l-[#0ea5e9]";
                badgeClass += "text-blue-500";
              }

              const opacityClass = isDisabled && task.status !== "DONE" && isLocked 
                ? "opacity-30 grayscale pointer-events-none" 
                : (task.status === "DONE" ? "opacity-50" : "");

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
                        task.status === "DONE" 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-zinc-950 border-zinc-700 text-transparent hover:border-blue-500"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${task.status === "DONE" ? "text-zinc-500 line-through" : "text-white"}`}>
                        {isThisTheBlocker && (
                          <span className="text-red-500 mr-2 text-sm uppercase tracking-widest border border-red-500 px-2 py-0.5 rounded">
                            Past Due
                          </span>
                        )}
                        {task.title}
                      </h3>
                      <div className="flex gap-4 mt-2 text-[10px] font-black uppercase tracking-widest">
                        <span className={badgeClass}>
                          {task.type === "ROCK" ? "🪨 Rock" : task.type === "ISSUE" ? "⚡ Issue" : "✅ To-Do"}
                        </span>
                        <span className="text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded">
                          {task.persona === "JON_J_KORKOWSKI" ? "[JJK]" : "[TRD]"}
                        </span>
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
            className="bg-blue-600 text-white px-5 py-4 rounded shadow-2xl font-bold flex items-center gap-3 text-sm pointer-events-auto fade-in"
          >
            <Satellite className="w-4 h-4" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
