"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, Save, Plus, Target, CheckCircle2, TrendingUp, ShieldAlert, 
  Crosshair, Users, LayoutDashboard, BrainCircuit, Lightbulb, UserCheck, 
  Settings2, Eye, MessageSquare, Sparkles, Zap
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// Types
type VTO = {
  id?: string;
  userId: string;
  coreValues: string;
  coreFocus: string;
  tenYearTarget: string;
  marketingStrategy: string;
  threeYearPicture: string;
  oneYearPlan: string;
  quarterlyRocks: string;
  issuesList: string;
  feedback: string;
};

type VTOSettings = {
  id: string;
  coreValuesPrompt: string;
  coreFocusPrompt: string;
  tenYearTargetPrompt: string;
  marketingStrategyPrompt: string;
  threeYearPicturePrompt: string;
  oneYearPlanPrompt: string;
  quarterlyRocksPrompt: string;
  issuesListPrompt: string;
};

type Goal = {
  id: string;
  title: string;
  assignee: { name: string | null };
};

type UserShort = {
  id: string;
  name: string | null;
  role: string;
};

export default function VTOEditor() {
  const { data: session } = useSession();
  const [vto, setVto] = useState<VTO | null>(null);
  const [settings, setSettings] = useState<VTOSettings | null>(null);
  const [users, setUsers] = useState<UserShort[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [yearlyGoals, setYearlyGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"vision" | "traction">("vision");
  const [editMode, setEditMode] = useState<"USER" | "GUIDANCE">("USER");
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!session) return;
    
    // Initial load: requester's VTO
    loadVTO(session.user.id);
    
    if (isAdmin) {
      fetch("/api/users")
        .then(res => res.json())
        .then(data => setUsers(data));
    }
  }, [session, isAdmin]);

  const loadVTO = async (userId: string) => {
    setLoading(true);
    const res = await fetch(`/api/vto?userId=${userId}`);
    const data = await res.json();
    setVto(data.vto);
    setSettings(data.settings);
    setYearlyGoals(data.yearlyGoals || []);
    setSelectedUserId(userId);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!vto || !settings) return;
    setSaving(true);
    
    if (editMode === "GUIDANCE") {
      await fetch("/api/vto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, type: "SETTINGS" }),
      });
    } else {
      await fetch("/api/vto", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vto),
      });
    }
    setSaving(false);
  };

  const handleAIButtonClick = async (field: keyof VTO, promptField: keyof VTOSettings, title: string) => {
    if (!vto || !settings) return;
    setGeneratingField(field);

    try {
      const res = await fetch("/api/ai/vto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: title,
          currentContent: vto[field],
          guidance: settings[promptField],
          teamContext: "A high-growth digital SEO and performance marketing agency."
        }),
      });

      const data = await res.json();
      if (data.text) {
        handleFieldChange(field, data.text);
      } else if (data.error === "AI NOT CONFIGURED") {
        alert("GEMINI_API_KEY is missing. Please add it to your .env.local to enable AI EOS features.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingField(null);
    }
  };

  const handleFieldChange = (field: keyof VTO, value: string) => {
    setVto((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handlePromptChange = (field: keyof VTOSettings, value: string) => {
    setSettings((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex flex-col items-center text-slate-400 gap-4"
        >
          <Target className="w-12 h-12 text-blue-600" />
          <span className="font-semibold tracking-widest uppercase">Initializing V/TO...</span>
        </motion.div>
      </div>
    );
  }

  const Section = ({ 
    title, 
    icon: Icon, 
    field, 
    promptField, 
    colorClass, 
    placeholder, 
    className = "" 
  }: { 
    title: string, 
    icon: any, 
    field: keyof VTO, 
    promptField: keyof VTOSettings, 
    colorClass: string, 
    placeholder: string,
    className?: string
  }) => (
    <motion.div variants={itemVariants} className={`bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group ${className}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass} rounded-l-2xl`}></div>
      <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Icon className={`w-6 h-6 ${colorClass.replace("bg-", "text-")}`} />
          <h2 className="text-lg font-black uppercase tracking-widest text-slate-800">{title}</h2>
        </div>
        <div className="flex gap-2">
          {editMode === "USER" && (
            <button
              onClick={() => handleAIButtonClick(field, promptField, title)}
              disabled={generatingField === field}
              title="AI Assist"
              className={`p-2 rounded-lg transition-all ${
                generatingField === field 
                ? "bg-slate-100 text-slate-400" 
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
              }`}
            >
              {generatingField === field ? (
                <Zap className="w-4 h-4 animate-pulse" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </button>
          )}
          {isAdmin && editMode === "USER" && (
            <button className="text-slate-300 hover:text-blue-500 transition-colors p-2">
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {editMode === "GUIDANCE" ? (
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-blue-600 tracking-tighter">Jon's Workflow Prompt (Global)</label>
          <textarea
            value={settings?.[promptField] as string || ""}
            onChange={(e) => handlePromptChange(promptField, e.target.value)}
            className="w-full h-32 bg-blue-50/50 rounded-xl p-4 text-blue-900 border border-blue-100 outline-none resize-none font-medium text-sm italic"
            placeholder="Add guidance for this section..."
          />
        </div>
      ) : (
        <>
          {settings?.[promptField] && (
            <div className="mb-4 bg-slate-50 border border-slate-100 p-3 rounded-xl flex gap-3 items-start">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed font-medium italic">{settings[promptField]}</p>
            </div>
          )}
          <textarea
            value={vto?.[field] as string || ""}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            placeholder={placeholder}
            className="w-full h-48 bg-transparent text-slate-700 placeholder-slate-300 outline-none resize-none leading-relaxed"
          />
        </>
      )}
    </motion.div>
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
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
              <Crosshair className="w-5 h-5 text-blue-600" />
              <h1 className="font-black tracking-tight text-xl">Vision/Traction™</h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {isAdmin && (
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setEditMode("USER")}
                  className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all flex items-center gap-2 ${
                    editMode === "USER" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                  }`}
                >
                  <Eye className="w-3 h-3" /> Review
                </button>
                <button
                  onClick={() => setEditMode("GUIDANCE")}
                  className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all flex items-center gap-2 ${
                    editMode === "GUIDANCE" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                  }`}
                >
                  <Settings2 className="w-3 h-3" /> Guidance
                </button>
              </div>
            )}

            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("vision")}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                  activeTab === "vision" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Vision
              </button>
              <button
                onClick={() => setActiveTab("traction")}
                className={`px-4 py-1.5 text-sm font-bold rounded-md transition-all ${
                  activeTab === "traction" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Traction
              </button>
            </div>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70"
            >
              <Save className="w-4 h-4" />
              {saving ? "Deploying..." : "Save V/TO"}
            </button>
          </div>
        </div>
      </div>

      {/* Admin User Selector */}
      {isAdmin && editMode === "USER" && (
        <div className="bg-white border-b border-slate-200 px-6 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <select 
              value={selectedUserId}
              onChange={(e) => loadVTO(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none"
            >
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 py-10">
        {editMode === "GUIDANCE" && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-blue-600 rounded-2xl text-white flex items-center justify-between"
          >
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Guidance Mode Active</h2>
              <p className="text-blue-100 text-sm font-medium">You are currently editing the master prompts that appear for all users.</p>
            </div>
            <Settings2 className="w-10 h-10 opacity-20" />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "vision" ? (
            <motion.div
              key="vision"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <Section 
                title="Core Values" 
                icon={ShieldAlert} 
                field="coreValues" 
                promptField="coreValuesPrompt"
                colorClass="bg-blue-500" 
                placeholder="1. Write your guiding principles..."
              />
              <Section 
                title="Core Focus™" 
                icon={BrainCircuit} 
                field="coreFocus" 
                promptField="coreFocusPrompt"
                colorClass="bg-indigo-500" 
                placeholder="Purpose/Cause/Passion & Our Niche..."
              />
              <Section 
                title="10-Year Target™" 
                icon={Target} 
                field="tenYearTarget" 
                promptField="tenYearTargetPrompt"
                colorClass="bg-sky-500" 
                placeholder="What is the ultimate goal?"
                className="lg:col-span-2"
              />
              <Section 
                title="Marketing Strategy" 
                icon={Users} 
                field="marketingStrategy" 
                promptField="marketingStrategyPrompt"
                colorClass="bg-purple-500" 
                placeholder="Target Market, 3 Uniques, Proven Process..."
              />
              <Section 
                title="3-Year Picture™" 
                icon={TrendingUp} 
                field="threeYearPicture" 
                promptField="threeYearPicturePrompt"
                colorClass="bg-emerald-500" 
                placeholder="Future Date, Revenue, Profit, Measurables..."
              />
            </motion.div>
          ) : (
            <motion.div
              key="traction"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="space-y-8">
                <Section 
                  title="1-Year Plan" 
                  icon={CheckCircle2} 
                  field="oneYearPlan" 
                  promptField="oneYearPlanPrompt"
                  colorClass="bg-orange-500" 
                  placeholder="Future Date, Revenue, Profit..."
                />
                
                {editMode === "USER" && (
                  <motion.div variants={itemVariants} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" /> Linked Yearly Goals
                    </h3>
                    <div className="space-y-2">
                      {yearlyGoals.length > 0 ? (
                        yearlyGoals.map((goal) => (
                          <div key={goal.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                            <span className="text-sm font-semibold text-slate-700 flex-1">{goal.title}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic">No active yearly goals found for this operator.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>

              <Section 
                title="Quarterly Rocks" 
                icon={Target} 
                field="quarterlyRocks" 
                promptField="quarterlyRocksPrompt"
                colorClass="bg-rose-500" 
                placeholder="1. Who - Rock..."
                className="h-full"
              />

              <Section 
                title="Issues List" 
                icon={ShieldAlert} 
                field="issuesList" 
                promptField="issuesListPrompt"
                colorClass="bg-red-500" 
                placeholder="List unresolved issues for IDS..."
                className="lg:col-span-2"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
