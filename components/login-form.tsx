"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LockKeyhole, Shield, UserRound } from "lucide-react";
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
    <main className="page-shell page-shell-narrow">
      <section className="hero">
        <div className="eyebrow">
          <Shield size={16} />
          Protected internal access
        </div>
        <h1 className="hero-title">Sign in to the operating layer.</h1>
        <p className="hero-copy">
          Phase 2 adds lightweight protected access and server-side persistence. Use one of the seeded accounts
          below or enter the credentials manually.
        </p>
      </section>

      <section className="section login-grid">
        <div className="panel surface panel">
          <h2 className="panel-title">Login</h2>
          <div className="stack section">
            <div className="field-stack">
              <label className="field-label" htmlFor="email">
                Email
              </label>
              <input
                className="text-input"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                value={email}
              />
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="passcode">
                Passcode
              </label>
              <input
                className="text-input"
                id="passcode"
                onChange={(event) => setPasscode(event.target.value)}
                type="password"
                value={passcode}
              />
            </div>

            <button
              className="primary-button"
              disabled={!email.trim() || !passcode.trim() || isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await loginAction({ email, passcode });

                  if (!result.ok) {
                    setError(result.error ?? "Unable to sign in.");
                    return;
                  }

                  router.push("/");
                  router.refresh();
                });
              }}
              type="button"
            >
              {isPending ? "Signing in..." : "Enter platform"}
            </button>

            {error ? <div className="error-note">{error}</div> : null}
          </div>
        </div>

        <div className="panel surface panel">
          <h2 className="panel-title">Seeded accounts</h2>
          <div className="stack section">
            {accounts.map((account) => (
              <button className="account-card" key={account.id} onClick={() => fillAccount(account)} type="button">
                <div className="inline-between">
                  <strong>{account.name}</strong>
                  <span className={`badge ${account.systemRole === "manager" ? "badge-good" : "badge-warn"}`}>
                    {account.systemRole}
                  </span>
                </div>
                <div className="account-line">
                  <UserRound size={15} />
                  {account.roleLabel}
                </div>
                <div className="account-line">
                  <LockKeyhole size={15} />
                  {account.email} / {account.passcode}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
