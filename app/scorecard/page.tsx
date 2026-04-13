"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Save, Plus, BarChart3, TrendingUp, TrendingDown, 
  AlertCircle, CheckCircle2, Crosshair, UserCheck, Settings2, 
  Eye, Calendar, ArrowRight, Trash2, Edit2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";
import { 
  startOfWeek, endOfWeek, addWeeks, format, subWeeks, 
  isSameDay, isAfter, isBefore 
} from "date-fns";

// Types
type ScorecardValue = {
  id: string;
  value: number;
  weekEnding: string;
};

type ScorecardMeasurable = {
  id: string;
  title: string;
  goal: number;
  operator: string;
  userId: string;
  values: ScorecardValue[];
};

type UserShort = {
  id: string;
  name: string | null;
  role: string;
};

export default function ScorecardPage() {
  const { data: session } = useSession();
  const [measurables, setMeasurables] = useState<ScorecardMeasurable[]>([]);
  const [users, setUsers] = useState<UserShort[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal State
  const [newTitle, setNewTitle] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newOperator, setNewOperator] = useState(">=");

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  // Generate last 12 weeks ending on Sundays
  const weeks = useMemo(() => {
    const arr = [];
    const today = new Date();
    // EOS weeks usually end on Sunday. Let's find the most recent Sunday.
    let current = endOfWeek(today, { weekStartsOn: 1 }); // 1 is Monday, so end is Sunday
    
    for (let i = 0; i < 12; i++) {
      arr.push(new Date(current));
      current = subWeeks(current, 1);
    }
    return arr.reverse(); // Chronological order for the chart
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    loadScorecard((session.user as any).id);
    if (isAdmin) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [session, isAdmin]);

  const loadScorecard = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scorecard?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMeasurables(data);
      } else {
        setError(data.details || data.error || "Failed to load measurables");
        setMeasurables([]);
      }
    } catch (err) {
      console.error(err);
      setError("Connection error");
      setMeasurables([]);
    } finally {
      setLoading(false);
      setSelectedUserId(userId);
    }
  };

  const handleAddMeasurable = async () => {
    if (!newTitle || !newGoal) return;
    const res = await fetch("/api/scorecard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        goal: newGoal,
        operator: newOperator,
        userId: selectedUserId
      }),
    });
    if (res.ok) {
      loadScorecard(selectedUserId);
      setShowAddModal(false);
      setNewTitle("");
      setNewGoal("");
    }
  };

  const handleUpdateValue = async (measurableId: string, value: string, weekEnding: Date) => {
    if (value === "") return;
    await fetch("/api/scorecard", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        measurableId,
        value,
        weekEnding: weekEnding.toISOString(),
      }),
    });
    // Refresh local state to update charts immediately
    loadScorecard(selectedUserId);
  };

  const deleteMeasurable = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/scorecard?id=${id}`, { method: "DELETE" });
    loadScorecard(selectedUserId);
  };

  const isGoalMet = (value: number, goal: number, operator: string) => {
    if (operator === ">=") return value >= goal;
    if (operator === "<=") return value <= goal;
    if (operator === "==") return value === goal;
    return value >= goal;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center text-slate-400 gap-4"
        >
          <BarChart3 className="w-12 h-12 text-blue-600" />
          <span className="font-semibold tracking-widest uppercase">Initializing Scorecard...</span>
        </motion.div>
      </div>
    );
  }

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-slate-900 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <img 
              src="https://truerankdigital.com/wp-content/uploads/2024/06/True-Rank-Digital-Logo-1.png" 
              alt="True Rank Digital" 
              className="h-6 w-auto"
            />
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h1 className="font-black tracking-tight text-xl">Weekly Scorecard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <select 
                value={selectedUserId}
                onChange={(e) => loadScorecard(e.target.value)}
                className="bg-slate-100 border-none rounded-lg px-4 py-2 text-sm font-bold text-slate-700 outline-none"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Measurable
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-8">
          {/* Main Scorecard Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest min-w-[250px]">Measurable</th>
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-24">Goal</th>
                    {weeks.map((week, i) => (
                      <th key={i} className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center w-24">
                        {format(week, "MM/dd")}
                      </th>
                    ))}
                    <th className="p-4 text-[10px] font-black uppercase text-slate-400 tracking-widest w-40">Trend (12w)</th>
                  </tr>
                </thead>
                <tbody>
                  {measurables.map((m) => (
                    <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700">{m.title}</span>
                          {isAdmin && (
                            <button 
                              onClick={() => deleteMeasurable(m.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-black text-blue-600 text-sm">
                        {m.operator}{m.goal}
                      </td>
                      {weeks.map((week, i) => {
                        const valObj = m.values.find(v => isSameDay(new Date(v.weekEnding), week));
                        const val = valObj?.value;
                        const met = val !== undefined ? isGoalMet(val, m.goal, m.operator) : null;
                        
                        return (
                          <td key={i} className="p-2">
                            <input 
                              type="number"
                              defaultValue={val ?? ""}
                              onBlur={(e) => handleUpdateValue(m.id, e.target.value, week)}
                              className={`w-full text-center py-2 rounded-lg text-sm font-bold transition-all outline-none border ${
                                met === true ? "bg-emerald-50 text-emerald-700 border-emerald-100" : 
                                met === false ? "bg-rose-50 text-rose-700 border-rose-100" :
                                "bg-slate-50 text-slate-400 border-transparent focus:border-blue-200 focus:bg-white"
                              }`}
                              placeholder="-"
                            />
                          </td>
                        );
                      })}
                      <td className="p-2 h-16 min-w-[160px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={weeks.map(w => ({
                            val: m.values.find(v => isSameDay(new Date(v.weekEnding), w))?.value || 0
                          }))}>
                            <defs>
                              <linearGradient id={`grad-${m.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <Area 
                              type="monotone" 
                              dataKey="val" 
                              stroke="#3b82f6" 
                              fillOpacity={1} 
                              fill={`url(#grad-${m.id})`} 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </td>
                    </tr>
                  ))}
                  {measurables.length === 0 && (
                    <tr>
                      <td colSpan={15} className="p-10 text-center text-slate-400 italic text-sm">
                        No measurables defined for this operator. Add one to start tracking.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {measurables.slice(0, 4).map((m) => (
              <motion.div 
                key={m.id}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">{m.title}</h3>
                    <p className="text-xs font-bold text-slate-400">12 WEEK PERFORMANCE TREND</p>
                  </div>
                  <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter">
                    Goal: {m.operator}{m.goal}
                  </div>
                </div>
                
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeks.map(w => ({
                      week: format(w, "MMM dd"),
                      value: m.values.find(v => isSameDay(new Date(v.weekEnding), w))?.value || 0,
                      goal: m.goal
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 700 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#3b82f6" 
                        strokeWidth={4} 
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 6 }} 
                      />
                      <Line 
                        type="step" 
                        dataKey="goal" 
                        stroke="#94a3b8" 
                        strokeDasharray="5 5" 
                        strokeWidth={1} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 border border-slate-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">New Measurable</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Measurable Title</label>
                  <input 
                    type="text" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Weekly Sales, Client Meetings..."
                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Goal Value</label>
                    <input 
                      type="number" 
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Operator</label>
                    <select 
                      value={newOperator}
                      onChange={(e) => setNewOperator(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl text-sm font-bold outline-none focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value=">=">Greater than or Equal (&gt;=)</option>
                      <option value="<=">Less than or Equal (&lt;=)</option>
                      <option value="==">Exactly (==)</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={handleAddMeasurable}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition-all mt-4"
                >
                  Create Measurable
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
