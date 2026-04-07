"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Lock, Shield, User, Crosshair, Satellite } from "lucide-react";
import { loginAction } from "@/app/actions";
import type { SystemRole } from "@/lib/types";

type LoginAccount = {
  id: string;
  name: string;
  email: string;
  passcode: string;
  systemRole: SystemRole;
  roleLabel: string;
};

export function LoginForm({ accounts }: { accounts: LoginAccount[] }) {
  const router = useRouter();
  const [email, setEmail] = useState(accounts[0]?.email ?? "");
  const [passcode, setPasscode] = useState(accounts[0]?.passcode ?? "");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function fillAccount(account: LoginAccount) {
    setEmail(account.email);
    setPasscode(account.passcode);
    setError("");
  }

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
        <div className="hidden md:flex items-center gap-2 text-xs font-bold text-zinc-400">
          <Satellite className="w-3 h-3" /> Secure Access Layer
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 fade-in">
          
          {/* Login Panel */}
          <div className="glass p-8 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">System Login</h1>
              <p className="text-zinc-500 font-bold uppercase text-xs mt-1">Authorized Personnel Only</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-2 tracking-widest" htmlFor="email">
                  Operator Email
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl p-3 pl-10 text-sm focus:border-blue-500 outline-none transition-all"
                    id="email"
                    placeholder="name@truerankdigital.com"
                    onChange={(event) => setEmail(event.target.value)}
                    value={email}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase text-zinc-500 font-bold mb-2 tracking-widest" htmlFor="passcode">
                  Security Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-xl p-3 pl-10 text-sm focus:border-blue-500 outline-none transition-all"
                    id="passcode"
                    type="password"
                    placeholder="••••••"
                    onChange={(event) => setPasscode(event.target.value)}
                    value={passcode}
                  />
                </div>
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!email.trim() || !passcode.trim() || isPending}
                onClick={() => {
                  startTransition(async () => {
                    const result = await loginAction({ email, passcode });
                    if (!result.ok) {
                      setError(result.error ?? "Invalid credentials.");
                      return;
                    }
                    router.push("/");
                    router.refresh();
                  });
                }}
              >
                {isPending ? "Authenticating..." : "Initialize Command"}
              </button>

              {error && (
                <div className="bg-red-950/30 border border-red-500/50 text-red-400 p-3 rounded-lg text-xs font-bold uppercase tracking-wider text-center">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Seeded Accounts / Info */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="glass p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Quick Access Protocols
              </h2>
              <div className="space-y-3">
                {accounts.map((account) => (
                  <button 
                    key={account.id} 
                    onClick={() => fillAccount(account)}
                    className="w-full text-left bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl hover:border-blue-500/50 hover:bg-zinc-900 transition-all group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{account.name}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        account.systemRole === "manager" 
                          ? "border-blue-500/30 text-blue-400 bg-blue-500/5" 
                          : "border-amber-500/30 text-amber-400 bg-amber-500/5"
                      }`}>
                        {account.systemRole}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-bold tracking-wider uppercase">{account.roleLabel}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-2">
              <p className="text-[10px] text-zinc-600 font-bold leading-relaxed uppercase tracking-widest">
                System optimized for high-velocity operation. Unauthorized access attempts are logged and reported to BishopTech security.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
