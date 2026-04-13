"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Play, Pause, RotateCcw, CheckCircle2, 
  BarChart3, Target, AlertCircle, MessageSquare, 
  Users, Timer, ArrowRight, Plus, Hash, X, ArrowUp
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format, isSameDay, subWeeks, endOfWeek } from "date-fns";

// EOS Agenda Steps
const AGENDA = [
  { id: "segue", title: "Segue (5m)", time: 5, icon: Users, description: "Share good news - personal and professional." },
  { id: "scorecard", title: "Scorecard (5m)", time: 5, icon: BarChart3, description: "Review measurables. Are we on track?" },
  { id: "rocks", title: "Rocks (5m)", time: 5, icon: Target, description: "Review Rocks. On or off track?" },
  { id: "headlines", title: "Headlines (5m)", time: 5, icon: MessageSquare, description: "Employee and customer headlines." },
  { id: "todos", title: "To-Do List (5m)", time: 5, icon: CheckCircle2, description: "Review 7-day to-dos (90% completion target)." },
  { id: "ids", title: "IDS™ (60m)", time: 60, icon: AlertCircle, description: "Identify, Discuss, Solve issues." },
  { id: "conclude", title: "Conclude (5m)", time: 5, icon: ArrowRight, description: "Recap to-dos, headlines, and rate the meeting." },
];

export default function MeetingPage() {
  const { data: session } = useSession();
  const [activeStep, setActiveTab] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes
  const [isRunning, setIsRunning] = useState(false);
  
  // Data State
  const [measurables, setMeasurables] = useState<any[]>([]);
  const [rocks, setRocks] = useState<any[]>([]);
  const [todos, setTodos] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [newIssue, setNewIssue] = useState("");
  const [loading, setLoading] = useState(true);

  // Timer logic
  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Load Data
  const loadData = async () => {
    try {
      const [mRes, rRes, tRes, iRes] = await Promise.all([
        fetch("/api/scorecard"),
        fetch("/api/tasks?type=ROCK"),
        fetch("/api/tasks?type=TODO"),
        fetch("/api/meetings/issues")
      ]);
      
      const mData = await mRes.json();
      const rData = await rRes.json();
      const tData = await tRes.json();
      const iData = await iRes.json();

      setMeasurables(Array.isArray(mData) ? mData : []);
      setRocks(Array.isArray(rData) ? rData : []);
      setTodos(Array.isArray(tData) ? tData.filter((t: any) => t.status !== "DONE") : []);
      setIssues(Array.isArray(iData) ? iData : []);
    } catch (err) {
      console.error("Failed to load meeting data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddIssue = async () => {
    if (!newIssue.trim()) return;
    console.log("Attempting to add issue:", newIssue);
    try {
      const res = await fetch("/api/meetings/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newIssue }),
      });
      if (res.ok) {
        setNewIssue("");
        await loadData();
      } else {
        const err = await res.json();
        console.error("API Error adding issue:", err);
        alert(`Failed to add issue: ${err.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Network Error adding issue:", err);
      alert("Network error while adding issue. Check connection.");
    }
  };

  const handleSolveIssue = async (id: string) => {
    if (!id) {
      console.error("Cannot solve issue: ID is missing");
      return;
    }
    console.log("Solving issue:", id);
    try {
      const res = await fetch("/api/meetings/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "SOLVED" }),
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error("Failed to solve issue:", errData);
      } else {
        await loadData();
      }
    } catch (err) {
      console.error("Network error solving issue:", err);
    }
  };

  const handlePrioritizeIssue = async (id: string, currentPriority: number) => {
    if (!id) return;
    try {
      await fetch("/api/meetings/issues", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, priority: (currentPriority || 0) + 1 }),
      });
      await loadData();
    } catch (err) {
      console.error("Failed to prioritize:", err);
    }
  };

  const handleToggleTodo = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === "DONE" ? "OPEN" : "DONE";
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Failed to update todo:", err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const nextStep = () => {
    if (activeStep < AGENDA.length - 1) setActiveTab(activeStep + 1);
  };

  // Generate last 4 weeks for quick scorecard review
  const weeks = useMemo(() => {
    const arr = [];
    let current = endOfWeek(new Date(), { weekStartsOn: 1 });
    for (let i = 0; i < 4; i++) {
      arr.push(new Date(current));
      current = subWeeks(current, 1);
    }
    return arr.reverse();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase tracking-widest animate-pulse">Initializing L10 Pulse...</div>
      </div>
    );
  }

  // Sorted Issues
  const sortedIssues = [...issues].sort((a, b) => b.priority - a.priority);
  const topIssue = sortedIssues[0];
  const otherIssues = sortedIssues.slice(1);

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top Header / Timer Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <img 
            src="https://truerankdigital.com/wp-content/uploads/2024/06/True-Rank-Digital-Logo-1.png" 
            alt="True Rank Digital" 
            className="h-6 w-auto"
          />
          <div className="flex items-center gap-4 border-l border-slate-200 pl-4">
            <div>
              <h1 className="font-black text-xl uppercase tracking-tight flex items-center gap-2">
                <Hash className="w-5 h-5 text-blue-600" /> Level 10 Meeting
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {AGENDA[activeStep].title} — {AGENDA[activeStep].description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className={`text-2xl font-mono font-black ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">90:00 Total Goal</span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={() => setIsRunning(!isRunning)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600">
              {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button onClick={() => setTimeLeft(90 * 60)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Agenda Sidebar */}
        <aside className="w-72 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-6">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Meeting Agenda</h2>
            <div className="space-y-2">
              {AGENDA.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(index)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      activeStep === index 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : index < activeStep 
                      ? "text-emerald-600 hover:bg-emerald-50" 
                      : "text-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-bold">{item.title}</span>
                    {index < activeStep && <CheckCircle2 className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-auto p-6 border-t border-slate-100">
            <button 
              onClick={nextStep}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {activeStep === AGENDA.length - 1 ? "Complete Meeting" : "Next Section"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              {activeStep === 0 && (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Users className="w-10 h-10 text-blue-600" />
                  </div>
                  <h2 className="text-4xl font-black uppercase tracking-tight text-slate-800 mb-4">The Segue</h2>
                  <p className="text-slate-500 max-w-md mx-auto font-medium">
                    Start the meeting on a high note. Everyone share one personal and one professional piece of good news.
                  </p>
                </div>
              )}

              {activeStep === 1 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-black uppercase tracking-tight">Scorecard Review</h2>
                    <Link href="/scorecard" className="text-xs font-black text-blue-600 hover:underline">Full Scorecard →</Link>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Measurable</th>
                          <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Goal</th>
                          {weeks.map((w, i) => (
                            <th key={i} className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">{format(w, "MM/dd")}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {measurables.map((m) => (
                          <tr key={m.id} className="border-t border-slate-100">
                            <td className="p-4 font-bold text-slate-700">{m.title}</td>
                            <td className="p-4 font-black text-blue-600 text-sm">{m.operator}{m.goal}</td>
                            {weeks.map((w, i) => {
                              const val = m.values?.find((v: any) => isSameDay(new Date(v.weekEnding), w))?.value;
                              return (
                                <td key={i} className="p-4 text-center">
                                  {val !== undefined ? (
                                    <span className={`font-black text-sm ${val >= m.goal ? 'text-emerald-600' : 'text-rose-600'}`}>{val}</span>
                                  ) : <span className="text-slate-200">-</span>}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-8">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">Rocks Review</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rocks.map((rock) => (
                      <div key={rock.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg flex justify-between items-center group">
                        <div>
                          <h3 className="font-bold text-slate-800">{rock.title}</h3>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{rock.assignee?.name}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-emerald-100 hover:bg-emerald-100">On Track</button>
                          <button className="bg-rose-50 text-rose-600 text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-rose-100 hover:bg-rose-100">Off Track</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">To-Do List Review</h2>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">7-Day Action Items (90% completion target)</p>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl shadow-xl divide-y divide-slate-100 overflow-hidden">
                    {todos.length > 0 ? todos.map((todo) => (
                      <div key={todo.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => handleToggleTodo(todo.id, todo.status)}
                            className="w-6 h-6 rounded-lg border-2 border-slate-200 flex items-center justify-center hover:border-blue-500 transition-all"
                          >
                            {todo.status === "DONE" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          </button>
                          <div>
                            <span className="font-bold text-slate-700">{todo.title}</span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Owner: {todo.assignee?.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                            todo.status === "DONE" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {todo.status}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="p-10 text-center text-slate-400 italic text-sm">No pending to-dos. You are 100% on track!</div>
                    )}
                  </div>
                </div>
              )}

              {activeStep === 5 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800">IDS™ Workflow</h2>
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Identify · Discuss · Solve</p>
                    </div>
                    <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
                      <input 
                        type="text" 
                        value={newIssue}
                        onChange={(e) => setNewIssue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddIssue()}
                        placeholder="New issue..." 
                        className="bg-transparent text-sm font-bold px-4 outline-none w-64"
                      />
                      <button 
                        onClick={handleAddIssue}
                        className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {topIssue && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-4 shadow-sm">
                        <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-1">1</div>
                        <div className="flex-1">
                          <h4 className="font-black text-blue-900 uppercase text-xs tracking-widest">Current Focus Issue</h4>
                          <p className="text-lg font-bold text-blue-800 mt-1">{topIssue.title}</p>
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Raised by {topIssue.user?.name}</p>
                        </div>
                        <button 
                          onClick={() => handleSolveIssue(topIssue.id)}
                          className="bg-blue-200 text-blue-700 text-[10px] font-black uppercase px-4 py-2 rounded-xl hover:bg-blue-300 transition-all"
                        >
                          Solve Issue
                        </button>
                      </div>
                    )}

                    <div className="bg-white border border-slate-200 rounded-3xl shadow-xl divide-y divide-slate-100 overflow-hidden">
                      {otherIssues.length > 0 ? otherIssues.map((issue) => (
                        <div key={issue.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-all group">
                          <div className="flex items-center gap-4">
                            <span className="text-slate-300 font-black text-xl">#</span>
                            <div>
                              <span className="font-bold text-slate-700">{issue.title}</span>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Raised by {issue.user?.name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handlePrioritizeIssue(issue.id, issue.priority)}
                              className="text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 flex items-center gap-1"
                            >
                              <ArrowUp className="w-3 h-3" /> Prioritize
                            </button>
                            <button 
                              onClick={() => handleSolveIssue(issue.id)}
                              className="text-slate-300 hover:text-emerald-500"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )) : issues.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 italic text-sm">No issues identified yet. Great work!</div>
                      ) : null}
                    </div>
                  </div>
                </div>
              )}

              {activeStep !== 0 && activeStep !== 1 && activeStep !== 2 && activeStep !== 4 && activeStep !== 5 && (
                <div className="text-center py-20">
                  <h2 className="text-3xl font-black uppercase tracking-tight text-slate-800 mb-4">{AGENDA[activeStep].title}</h2>
                  <p className="text-slate-500 font-medium">{AGENDA[activeStep].description}</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
