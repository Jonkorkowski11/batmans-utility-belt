"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Plus, Users, UserCheck, ShieldCheck, 
  Trash2, Edit3, CheckCircle2, XCircle, Info
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Seat = {
  id: string;
  title: string;
  description: string | null;
  userId: string | null;
  reportsToId: string | null;
  getIt: boolean;
  wantIt: boolean;
  capacity: boolean;
  user: { id: string; name: string | null; image: string | null } | null;
};

export default function AccountabilityPage() {
  const { data: session } = useSession();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newRoles, setNewRoles] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [reportsTo, setReportsTo] = useState("");

  const isAdmin = session?.user?.role === "ADMIN";

  const loadData = async () => {
    try {
      const [sRes, uRes] = await Promise.all([
        fetch("/api/accountability"),
        fetch("/api/users")
      ]);
      
      const sData = await sRes.json();
      const uData = await uRes.json();

      setSeats(Array.isArray(sData) ? sData : []);
      setUsers(Array.isArray(uData) ? uData : []);
    } catch (err) {
      console.error("Failed to load accountability data:", err);
      setSeats([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSeat = async () => {
    if (!newTitle) return;
    await fetch("/api/accountability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle,
        description: newRoles,
        userId: selectedUser || null,
        reportsToId: reportsTo || null,
      }),
    });
    setShowAddModal(false);
    setNewTitle("");
    setNewRoles("");
    loadData();
  };

  const updateGWC = async (seatId: string, field: "getIt" | "wantIt" | "capacity", value: boolean) => {
    await fetch("/api/accountability", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: seatId, [field]: value }),
    });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="text-zinc-500 font-black uppercase tracking-widest animate-pulse">Mapping Accountability...</div>
      </div>
    );
  }

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
                <Users className="w-5 h-5 text-blue-600" /> Accountability Chart
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Right People in the Right Seats</p>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-black uppercase text-xs shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Seat
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {seats.map((seat) => (
            <motion.div 
              key={seat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100">
                <h3 className="text-lg font-black uppercase tracking-tight text-slate-800">{seat.title}</h3>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">
                  {seat.user?.name || "VACANT SEAT"}
                </p>
              </div>
              
              <div className="p-6 flex-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Roles & Responsibilities
                </h4>
                <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line font-medium italic">
                  {seat.description || "No roles defined yet."}
                </div>
              </div>

              <div className="p-6 border-t border-slate-50 bg-slate-50/30">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">GWC Status</h4>
                <div className="flex justify-between gap-2">
                  {[
                    { label: "Gets It", field: "getIt" as const, val: seat.getIt },
                    { label: "Wants It", field: "wantIt" as const, val: seat.wantIt },
                    { label: "Capacity", field: "capacity" as const, val: seat.capacity },
                  ].map((g) => (
                    <button
                      key={g.field}
                      onClick={() => updateGWC(seat.id, g.field, !g.val)}
                      className={`flex-1 flex flex-col items-center p-3 rounded-2xl border transition-all ${
                        g.val 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : "bg-white border-slate-100 text-slate-300"
                      }`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-tighter mb-1">{g.label}</span>
                      {g.val ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
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
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Create New Seat</h2>
              <div className="space-y-4">
                <input 
                  placeholder="Seat Title (e.g. Visionary, Operations)" 
                  className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-100"
                  value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea 
                  placeholder="5 Roles & Responsibilities..." 
                  className="w-full bg-slate-50 p-4 rounded-xl font-medium outline-none border border-slate-100 h-32"
                  value={newRoles} onChange={(e) => setNewRoles(e.target.value)}
                />
                <select 
                  className="w-full bg-slate-50 p-4 rounded-xl font-bold outline-none border border-slate-100"
                  value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
                >
                  <option value="">Vacant Seat</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <button 
                  onClick={handleAddSeat}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-xl"
                >
                  Confirm Seat
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
