"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Plus, BookOpen, User, 
  ShieldCheck, FileText, CheckCircle2, TrendingUp, 
  ArrowRight, Search, Activity
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Process = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  ownerId: string;
  isCore: boolean;
  adherenceScore: number;
  owner: { id: string; name: string | null };
};

export default function ProcessLibraryPage() {
  const { data: session } = useSession();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [isCore, setIsCore] = useState(true);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  const loadData = async () => {
    try {
      const [pRes, uRes] = await Promise.all([
        fetch("/api/processes"),
        fetch("/api/users")
      ]);
      
      const pData = await pRes.json();
      const uData = await uRes.json();

      setProcesses(Array.isArray(pData) ? pData : []);
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (err) {
      console.error("Failed to load process data:", err);
      setProcesses([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddProcess = async () => {
    if (!newTitle) return;
    await fetch("/api/processes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newDesc,
        ownerId: newOwner || (session?.user as any)?.id,
        isCore,
      }),
    });
    setShowAddModal(false);
    setNewTitle("");
    setNewDesc("");
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase tracking-widest animate-pulse">Documenting Knowledge...</div>
      </div>
    );
  }

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
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
                <BookOpen className="w-5 h-5 text-blue-600" /> Process Library
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Documented · Simplified · Followed by All</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-black uppercase text-xs shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Process
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Library */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
              <Search className="w-5 h-5 text-slate-400" />
              <input placeholder="Search processes..." className="bg-transparent flex-1 outline-none font-bold text-sm" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {processes.map((proc) => (
                <motion.div 
                  key={proc.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="show"
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${proc.isCore ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 uppercase tracking-tight">{proc.title}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        Owner: {proc.owner.name} • {proc.isCore ? 'CORE' : 'SUPPORT'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adherence</p>
                      <p className="text-lg font-black text-emerald-600">{proc.adherenceScore}%</p>
                    </div>
                    <button className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Library Stats
              </h4>
              <div className="space-y-6">
                <div>
                  <p className="text-3xl font-black text-slate-800">{processes.length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Total Documented</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">{processes.filter(p => p.isCore).length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Core Processes</p>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Average Adherence</p>
                    <p className="font-black text-emerald-600">92%</p>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[92%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl relative z-10 border border-slate-200"
            >
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">New Process</h2>
              <div className="space-y-4">
                <input 
                  placeholder="Process Title (e.g. Sales, HR, Finance)" 
                  className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-100"
                  value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea 
                  placeholder="Brief description of this process..." 
                  className="w-full bg-slate-50 p-4 rounded-xl font-medium outline-none border border-slate-100 h-24"
                  value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                />
                <select 
                  className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-100"
                  value={newOwner} onChange={(e) => setNewOwner(e.target.value)}
                >
                  <option value="">Select Owner</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <input 
                    type="checkbox" checked={isCore} onChange={(e) => setIsCore(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-700">This is a Core Process</span>
                </div>
                <button 
                  onClick={handleAddProcess}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl"
                >
                  Confirm Process
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
