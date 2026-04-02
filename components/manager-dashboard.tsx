"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Shield, Target, TimerReset, TrendingUp, TriangleAlert, UserPlus2 } from "lucide-react";
import { addPromptAction, addTeamMemberAction, deletePromptAction, deleteTeamMemberAction, resetDemoDataAction, updatePromptAction, updateTeamMemberAction } from "@/app/actions";
import { LogoutButton } from "@/components/logout-button";
import { getMemberRollup, getTeamTotals } from "@/lib/metrics";
import type { Prompt, TeamData } from "@/lib/types";

export function ManagerDashboard({ data }: { data: TeamData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newPrompt, setNewPrompt] = useState("");
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    passcode: "",
    roleLabel: "",
    dailyQuota: "40",
  });

  const totals = getTeamTotals(data.members);
  const priorityMembers = data.members
    .map((member) => ({
      member,
      rollup: getMemberRollup(member),
    }))
    .sort((left, right) => left.rollup.pacePercent - right.rollup.pacePercent)
    .slice(0, 2);

  function refreshAfter(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-grid">
          <div>
            <div className="eyebrow">
              <Shield size={16} />
              Manager command center
            </div>
            <h1 className="hero-title">Daily execution discipline for teams that wait for direction.</h1>
            <p className="hero-copy">
              This is the Phase 2 operating surface: protected access, server-persisted boards, and practical
              manager controls layered on top of the original MVP.
            </p>
            <div className="toolbar toolbar-inline">
              <button
                className="secondary-button"
                disabled={isPending}
                onClick={() => refreshAfter(async () => resetDemoDataAction())}
                type="button"
              >
                Reset demo data
              </button>
              <LogoutButton />
            </div>
          </div>

          <div className="hero-stats">
            <StatCard
              icon={<Target size={18} />}
              label="Team quota"
              value={`${totals.quota} actions`}
              copy="Combined target across the team"
            />
            <StatCard
              icon={<TrendingUp size={18} />}
              label="Completed"
              value={`${totals.completed} tasks`}
              copy="Visible finished actions"
            />
            <StatCard
              icon={<TimerReset size={18} />}
              label="Manager mode"
              value={data.team.managerModeLabel}
              copy="Review, intervene, redirect"
            />
          </div>
        </div>
      </section>

      <section className="section detail-grid">
        <div className="stack">
          <div>
            <h2 className="section-title">Team rollup</h2>
            <p className="section-copy">Spot drift fast, then jump directly into an individual day plan.</p>
          </div>

          <div className="card-grid">
            {data.members.map((member) => {
              const rollup = getMemberRollup(member);

              return (
                <div className="member-card" key={member.userId}>
                  <div className="member-card-header">
                    <div>
                      <h3 className="member-name">{member.name}</h3>
                      <div className="role-label">{member.role}</div>
                    </div>
                    <span className={rollup.health.className}>{rollup.health.label}</span>
                  </div>

                  <div className="metric-row">
                    <MetricBox label="Done" value={rollup.completedCount.toString()} />
                    <MetricBox label="Open" value={rollup.openCount.toString()} />
                    <MetricBox label="Daily quota" value={member.dailyQuota.toString()} />
                    <MetricBox label="Pace" value={`${rollup.pacePercent}%`} />
                  </div>

                  <div className="status-note">{member.blockerNote || "No blocker note recorded."}</div>
                  <div className="toolbar toolbar-inline toolbar-compact">
                    <Link className="ghost-link" href={`/team/${member.teamId}/member/${member.userId}`}>
                      Open board
                      <ArrowRight size={15} />
                    </Link>
                    <button
                      className="danger-button"
                      disabled={isPending}
                      onClick={() => refreshAfter(async () => deleteTeamMemberAction({ userId: member.userId, teamId: member.teamId }))}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="stack">
          <div className="panel surface panel">
            <h2 className="panel-title">Priority interventions</h2>
            <p className="panel-copy">The slowest-moving boards surface first so the manager has an obvious next move.</p>
            <div className="stack section">
              {priorityMembers.map(({ member, rollup }) => (
                <Link
                  className="doctrine-row"
                  href={`/team/${member.teamId}/member/${member.userId}`}
                  key={member.userId}
                >
                  <div className="inline-between">
                    <strong>{member.name}</strong>
                    <span className={rollup.health.className}>{rollup.health.label}</span>
                  </div>
                  <p className="panel-copy">{member.blockerNote || "No blocker note recorded."}</p>
                  <span className="ghost-link">
                    Open board
                    <ArrowRight size={15} />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <div className="panel surface panel">
            <h2 className="panel-title">Operating doctrine</h2>
            <div className="stack section">
              {data.doctrine.map((item) => (
                <div className="doctrine-row" key={item.title}>
                  <div className="inline-between">
                    <strong>{item.title}</strong>
                    <Shield size={16} color="#f6c453" />
                  </div>
                  <p className="panel-copy">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel surface warning-panel panel">
            <div className="inline-between">
              <h2 className="panel-title">Pressure cues</h2>
              <TriangleAlert size={18} color="#ff7b7b" />
            </div>
            <p className="panel-copy">
              The quota labels come from one shared metric layer so the dashboard and board stay synchronized.
            </p>
          </div>
        </div>
      </section>

      <section className="section management-grid">
        <div className="panel surface panel">
          <div className="inline-between">
            <h2 className="panel-title">Manage team members</h2>
            <UserPlus2 size={18} color="#f6c453" />
          </div>
          <p className="panel-copy">Phase 2 adds server-backed create, update, and delete flows for the active team.</p>

          <div className="stack section">
            {data.members.map((member) => (
              <EditableMemberCard
                disabled={isPending}
                key={member.userId}
                member={member}
                onSave={(input) => refreshAfter(async () => updateTeamMemberAction(input))}
              />
            ))}
          </div>

          <div className="stack section">
            <div className="field-stack">
              <label className="field-label" htmlFor="member-name">
                Name
              </label>
              <input
                className="text-input"
                id="member-name"
                onChange={(event) => setNewMember((current) => ({ ...current, name: event.target.value }))}
                value={newMember.name}
              />
            </div>

            <div className="split-fields">
              <div className="field-stack">
                <label className="field-label" htmlFor="member-role">
                  Role label
                </label>
                <input
                  className="text-input"
                  id="member-role"
                  onChange={(event) => setNewMember((current) => ({ ...current, roleLabel: event.target.value }))}
                  value={newMember.roleLabel}
                />
              </div>

              <div className="field-stack">
                <label className="field-label" htmlFor="member-quota">
                  Daily quota
                </label>
                <input
                  className="text-input"
                  id="member-quota"
                  min={1}
                  onChange={(event) => setNewMember((current) => ({ ...current, dailyQuota: event.target.value }))}
                  type="number"
                  value={newMember.dailyQuota}
                />
              </div>
            </div>

            <div className="split-fields">
              <div className="field-stack">
                <label className="field-label" htmlFor="member-email">
                  Email
                </label>
                <input
                  className="text-input"
                  id="member-email"
                  onChange={(event) => setNewMember((current) => ({ ...current, email: event.target.value }))}
                  value={newMember.email}
                />
              </div>

              <div className="field-stack">
                <label className="field-label" htmlFor="member-passcode">
                  Passcode
                </label>
                <input
                  className="text-input"
                  id="member-passcode"
                  onChange={(event) => setNewMember((current) => ({ ...current, passcode: event.target.value }))}
                  value={newMember.passcode}
                />
              </div>
            </div>

            <button
              className="primary-button"
              disabled={
                isPending ||
                !newMember.name.trim() ||
                !newMember.roleLabel.trim() ||
                !newMember.email.trim() ||
                !newMember.passcode.trim()
              }
              onClick={() =>
                refreshAfter(async () => {
                  await addTeamMemberAction({
                    teamId: data.team.id,
                    name: newMember.name,
                    email: newMember.email,
                    passcode: newMember.passcode,
                    roleLabel: newMember.roleLabel,
                    dailyQuota: Number(newMember.dailyQuota),
                  });
                  setNewMember({
                    name: "",
                    email: "",
                    passcode: "",
                    roleLabel: "",
                    dailyQuota: "40",
                  });
                })
              }
              type="button"
            >
              Add team member
            </button>
          </div>
        </div>

        <div className="panel surface panel">
          <h2 className="panel-title">Manage coaching prompts</h2>
          <p className="panel-copy">These prompts are stored server-side and reused across all boards for the team.</p>

          <div className="stack section">
            {data.prompts.map((prompt) => (
              <EditablePromptCard
                disabled={isPending}
                key={prompt.id}
                prompt={prompt}
                teamId={data.team.id}
                onDelete={(promptId) => refreshAfter(async () => deletePromptAction({ promptId, teamId: data.team.id }))}
                onSave={(nextPrompt) => refreshAfter(async () => updatePromptAction(nextPrompt))}
              />
            ))}
          </div>

          <div className="stack section">
            <div className="field-stack">
              <label className="field-label" htmlFor="new-prompt">
                New prompt
              </label>
              <textarea
                className="text-area"
                id="new-prompt"
                onChange={(event) => setNewPrompt(event.target.value)}
                value={newPrompt}
              />
            </div>
            <button
              className="primary-button"
              disabled={isPending || !newPrompt.trim()}
              onClick={() =>
                refreshAfter(async () => {
                  await addPromptAction({ teamId: data.team.id, text: newPrompt });
                  setNewPrompt("");
                })
              }
              type="button"
            >
              Add prompt
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function EditableMemberCard({
  disabled,
  member,
  onSave,
}: {
  disabled: boolean;
  member: TeamData["members"][number];
  onSave: (input: {
    userId: string;
    teamId: string;
    name: string;
    email: string;
    passcode: string;
    roleLabel: string;
    dailyQuota: number;
  }) => void;
}) {
  const [name, setName] = useState(member.name);
  const [roleLabel, setRoleLabel] = useState(member.role);
  const [dailyQuota, setDailyQuota] = useState(member.dailyQuota.toString());
  const [email, setEmail] = useState(member.email);
  const [passcode, setPasscode] = useState(member.passcode);

  return (
    <div className="editor-card">
      <div className="split-fields">
        <div className="field-stack">
          <label className="field-label">Name</label>
          <input className="text-input" onChange={(event) => setName(event.target.value)} value={name} />
        </div>
        <div className="field-stack">
          <label className="field-label">Role</label>
          <input className="text-input" onChange={(event) => setRoleLabel(event.target.value)} value={roleLabel} />
        </div>
      </div>

      <div className="split-fields">
        <div className="field-stack">
          <label className="field-label">Email</label>
          <input className="text-input" onChange={(event) => setEmail(event.target.value)} value={email} />
        </div>
        <div className="field-stack">
          <label className="field-label">Passcode</label>
          <input className="text-input" onChange={(event) => setPasscode(event.target.value)} value={passcode} />
        </div>
      </div>

      <div className="split-fields">
        <div className="field-stack">
          <label className="field-label">Daily quota</label>
          <input
            className="text-input"
            min={1}
            onChange={(event) => setDailyQuota(event.target.value)}
            type="number"
            value={dailyQuota}
          />
        </div>
        <div className="field-stack field-stack-end">
          <button
            className="secondary-button"
            disabled={disabled}
            onClick={() =>
              onSave({
                userId: member.userId,
                teamId: member.teamId,
                name,
                email,
                passcode,
                roleLabel,
                dailyQuota: Number(dailyQuota),
              })
            }
            type="button"
          >
            Save member
          </button>
        </div>
      </div>
    </div>
  );
}

function EditablePromptCard({
  disabled,
  onDelete,
  onSave,
  prompt,
  teamId,
}: {
  disabled: boolean;
  onDelete: (promptId: string) => void;
  onSave: (input: { promptId: string; text: string; teamId: string }) => void;
  prompt: Prompt;
  teamId: string;
}) {
  const [text, setText] = useState(prompt.text);

  return (
    <div className="editor-card">
      <textarea className="text-area" onChange={(event) => setText(event.target.value)} value={text} />
      <div className="toolbar toolbar-inline toolbar-compact">
        <button
          className="secondary-button"
          disabled={disabled || !text.trim()}
          onClick={() => onSave({ promptId: prompt.id, text, teamId })}
          type="button"
        >
          Save prompt
        </button>
        <button className="danger-button" disabled={disabled} onClick={() => onDelete(prompt.id)} type="button">
          Delete
        </button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  copy,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  copy: string;
}) {
  return (
    <div className="stat-card surface-strong">
      <div className="muted-text">{icon}</div>
      <div className="subtle-label" style={{ marginTop: "0.7rem" }}>
        {label}
      </div>
      <div className="metric-value">{value}</div>
      <div className="panel-copy">{copy}</div>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-box">
      <div className="meta-label">{label}</div>
      <div style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "0.35rem" }}>{value}</div>
    </div>
  );
}
