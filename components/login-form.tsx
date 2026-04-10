"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Lock, Crosshair, Satellite, User, Shield } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handlePasscodeLogin = async () => {
    if (!email.trim() || !passcode.trim()) return;
    setIsPending(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      passcode,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or passcode.");
      setIsPending(false);
    } else {
      window.location.href = "/";
    }
  };

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
          <Satellite className="w-3 h-3" /> E.O.S. Accountability Engine
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full fade-in">
          {/* Login Panel */}
          <div className="glass p-8 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-3xl font-black uppercase tracking-tight text-white">System Login</h1>
              <p className="text-zinc-500 font-bold uppercase text-xs mt-1">Authorized Personnel Only</p>
            </div>

            {/* Google SSO Button */}
            <button
              className="w-full bg-white hover:bg-zinc-100 text-black font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-lg mb-6 flex items-center justify-center gap-3"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google Workspace
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[rgba(24,24,27,0.7)] px-4 text-zinc-500 font-bold uppercase tracking-widest">
                  Or use passcode
                </span>
              </div>
            </div>

            <div className="space-y-4">
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
                    onChange={(e) => setEmail(e.target.value)}
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
                    onChange={(e) => setPasscode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasscodeLogin()}
                    value={passcode}
                  />
                </div>
              </div>

              <button
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!email.trim() || !passcode.trim() || isPending}
                onClick={handlePasscodeLogin}
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

          <div className="mt-6 px-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-zinc-600" />
            <p className="text-[10px] text-zinc-600 font-bold leading-relaxed uppercase tracking-widest">
              System optimized for high-velocity operation. Unauthorized access attempts are logged.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
