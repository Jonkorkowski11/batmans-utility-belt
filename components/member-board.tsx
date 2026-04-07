"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, CheckCircle2, Circle, NotebookPen, Shield, Sparkles, TriangleAlert } from "lucide-react";
import { addMustWinAction, createTaskAction, deleteMustWinAction, deleteTaskAction, toggleTaskAction, updateBoardAction, updateMustWinAction, updateTaskAction } from "@/app/actions";
import { LogoutButton } from "@/components/logout-button";
import { getMemberRollup, getTypeCounts } from "@/lib/metrics";
import { taskTypeLabel } from "@/lib/seed-data";
import type { Prompt, SystemRole, TaskPriority, TaskType } from "@/lib/types";

const orderedTaskTypes: TaskType[] = ["calls", "follow-up", "build", "admin", "sales", "other"];

type BoardData = {
  boardId: string;
  boardDate: string;
  teamId: string;
  userId: string;
  name: string;
  role: string;
  dailyQuota: number;
  mustWins: {
    id: string;
    text: string;
  }[];
  blockerNote: string;
  coachingNote: string;
  tasks: {
    id: string;
    title: string;
    type: TaskType;
    priority: TaskPriority;
    status: "todo" | "done";
    createdAt: string;
  }[];
};

export function MemberBoard({
  board,
  prompts,
  teamName,
  viewerRole,
}: {
  board: BoardData;
  prompts: Prompt[];
  teamName: string;
  viewerRole: SystemRole;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState<TaskType>("follow-up");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("Level 2: Strategic");
  const [newMustWin, setNewMustWin] = useState("");
  const [blockerDraft, setBlockerDraft] = useState(board.blockerNote);
  const [coachingDraft, setCoachingDraft] = useState(board.coachingNote);
  const [dailyQuotaDraft, setDailyQuotaDraft] = useState(board.dailyQuota.toString());

  const rollup = getMemberRollup(board);
  const typeCounts = getTypeCounts(board.tasks);
  const isManager = viewerRole === "manager";

  function refreshAfter(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="board-header">
          <div>
            <div className="toolbar toolbar-inline toolbar-compact">
              <Link className="ghost-link" href={isManager ? "/" : `/team/${board.teamId}/member/${board.userId}`}>
                <ArrowLeft size={16} />
                {isManager ? "Back to dashboard" : "Refresh board"}
              </Link>
              <LogoutButton />
            </div>
            <div className="eyebrow" style={{ marginTop: "1rem" }}>
              <Shield size={16} />
              {teamName}
            </div>
            <h1 className="board-name">{board.name}&apos;s day plan</h1>
            <p className="hero-copy">
              {board.role}. {isManager ? "Manager view with board editing controls." : "Member view with personal execution controls."}
            </p>
          </div>

          <div className="stack">
            <div className="panel surface-strong panel">
              <div className="inline-between">
                <h2 className="panel-title">Current pace</h2>
                <span className={rollup.health.className}>{rollup.health.label}</span>
              </div>
              <div className="stat-grid section">
                <BoardStat label="Daily quota" value={board.dailyQuota.toString()} help="Expected actions today" />
                <BoardStat label="Completed" value={rollup.completedCount.toString()} help="Visible finished work" />
                <BoardStat label="Open" value={rollup.openCount.toString()} help="Still on the board" />
              </div>
              <div className="footer-note">
                Pace: {rollup.pacePercent}% of quota completed. Board date: {board.boardDate}.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section stack">
        <div className="inline-between">
          <div>
            <h2 className="section-title">Must-win standards</h2>
            <p className="section-copy">These are persisted as board-level standards, not static copy.</p>
          </div>
          {isManager ? (
            <div className="toolbar toolbar-inline toolbar-compact">
              <input
                className="text-input"
                onChange={(event) => setNewMustWin(event.target.value)}
                placeholder="Add a must-win standard..."
                value={newMustWin}
              />
              <button
                className="secondary-button"
                disabled={isPending || !newMustWin.trim()}
                onClick={() =>
                  refreshAfter(async () => {
                    await addMustWinAction({ userId: board.userId, text: newMustWin, teamId: board.teamId });
                    setNewMustWin("");
                  })
                }
                type="button"
              >
                Add standard
              </button>
            </div>
          ) : null}
        </div>

        <div className="must-win-grid">
          {board.mustWins.map((mustWin) => (
            <EditableMustWinCard
              canEdit={isManager}
              disabled={isPending}
              key={mustWin.id}
              mustWin={mustWin}
              onDelete={() => refreshAfter(async () => deleteMustWinAction({ userId: board.userId, mustWinId: mustWin.id, teamId: board.teamId }))}
              onSave={(text) =>
                refreshAfter(async () => updateMustWinAction({ userId: board.userId, mustWinId: mustWin.id, text, teamId: board.teamId }))
              }
            />
          ))}
        </div>
      </section>

      <section className="section panel-grid">
        <div className="panel surface panel">
          <div className="detail-heading">
            <div>
              <h2 className="panel-title">Today&apos;s execution list</h2>
              <p className="panel-copy">Tasks now persist server-side and can be created, edited, toggled, or deleted.</p>
            </div>
            <div className="type-grid">
              {orderedTaskTypes.map((type) => {
                if (!typeCounts[type]) {
                  return null;
                }

                return (
                  <div className="type-card" key={type}>
                    <div className="meta-label">{taskTypeLabel[type]}</div>
                    <div style={{ fontSize: "1.45rem", fontWeight: 700, marginTop: "0.35rem" }}>{typeCounts[type]}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="toolbar">
            <div className="field-stack">
              <label className="field-label" htmlFor="new-task-title">
                New action
              </label>
              <input
                className="text-input"
                id="new-task-title"
                onChange={(event) => setNewTaskTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    refreshAfter(async () => createTaskAction({ userId: board.userId, title: newTaskTitle, type: newTaskType, priority: newTaskPriority, teamId: board.teamId }));
                    setNewTaskTitle("");
                  }
                }}
                placeholder="Add another countable action..."
                value={newTaskTitle}
              />
            </div>

            <div className="field-stack" style={{ minWidth: "180px" }}>
              <label className="field-label" htmlFor="new-task-type">
                Task type
              </label>
              <select
                className="select-input"
                id="new-task-type"
                onChange={(event) => setNewTaskType(event.target.value as TaskType)}
                value={newTaskType}
              >
                {orderedTaskTypes.map((type) => (
                  <option key={type} value={type}>
                    {taskTypeLabel[type]}
                  </option>
                ))}
              </select>
            </div>

            <div className="field-stack" style={{ minWidth: "180px" }}>
              <label className="field-label" htmlFor="new-task-priority">
                Priority
              </label>
              <select
                className="select-input"
                id="new-task-priority"
                onChange={(event) => setNewTaskPriority(event.target.value as TaskPriority)}
                value={newTaskPriority}
              >
                <option value="Level 1: Critical">Level 1: Critical</option>
                <option value="Level 2: Strategic">Level 2: Strategic</option>
                <option value="Level 3: Operational">Level 3: Operational</option>
              </select>
            </div>

            <button
              className="primary-button"
              disabled={!newTaskTitle.trim() || isPending}
              onClick={() =>
                refreshAfter(async () => {
                  await createTaskAction({ userId: board.userId, title: newTaskTitle, type: newTaskType, priority: newTaskPriority, teamId: board.teamId });
                  setNewTaskTitle("");
                  setNewTaskType("follow-up");
                  setNewTaskPriority("Level 2: Strategic");
                })
              }
              type="button"
            >
              Add action
            </button>
          </div>

          <div className="task-list">
            {board.tasks.map((task) => (
              <EditableTaskRow
                disabled={isPending}
                key={task.id}
                task={task}
                onDelete={() => refreshAfter(async () => deleteTaskAction({ userId: board.userId, taskId: task.id, teamId: board.teamId }))}
                onSave={(title, type, priority) =>
                  refreshAfter(async () => updateTaskAction({ userId: board.userId, taskId: task.id, title, type, priority, teamId: board.teamId }))
                }
                onToggle={() =>
                  refreshAfter(async () =>
                    toggleTaskAction({
                      userId: board.userId,
                      taskId: task.id,
                      nextStatus: task.status === "done" ? "todo" : "done",
                      teamId: board.teamId,
                    })
                  )
                }
              />
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="panel surface warning-panel panel">
            <div className="inline-between">
              <h2 className="panel-title">Blockers</h2>
              <TriangleAlert size={18} color="#ff7b7b" />
            </div>
            <p className="panel-copy">This note persists on the server so managers can reopen the board with the same context.</p>
            <div className="field-stack section">
              <label className="field-label" htmlFor="blocker-note">
                Blocker note
              </label>
              <textarea
                className="text-area"
                id="blocker-note"
                onChange={(event) => setBlockerDraft(event.target.value)}
                value={blockerDraft}
              />
            </div>
          </div>

          <div className="panel surface success-panel panel">
            <div className="inline-between">
              <h2 className="panel-title">Coaching note</h2>
              <NotebookPen size={18} color="#6df1cf" />
            </div>
            <p className="panel-copy">
              {isManager
                ? "Managers can update coaching context and quota calibration here."
                : "Members can see the current coaching context while quota settings remain manager-owned."}
            </p>
            <div className="stack section">
              <div className="field-stack">
                <label className="field-label" htmlFor="daily-quota">
                  Daily quota
                </label>
                <input
                  className="text-input"
                  disabled={!isManager}
                  id="daily-quota"
                  min={1}
                  onChange={(event) => setDailyQuotaDraft(event.target.value)}
                  type="number"
                  value={dailyQuotaDraft}
                />
              </div>

              <div className="field-stack">
                <label className="field-label" htmlFor="coaching-note">
                  Manager guidance
                </label>
                <textarea
                  className="text-area"
                  disabled={!isManager}
                  id="coaching-note"
                  onChange={(event) => setCoachingDraft(event.target.value)}
                  value={coachingDraft}
                />
              </div>
            </div>

            <button
              className="secondary-button"
              disabled={isPending || (viewerRole !== "manager" && blockerDraft === board.blockerNote)}
              onClick={() =>
                refreshAfter(async () =>
                  updateBoardAction({
                    userId: board.userId,
                    teamId: board.teamId,
                    blockerNote: blockerDraft,
                    coachingNote: isManager ? coachingDraft : board.coachingNote,
                    dailyQuota: isManager ? Number(dailyQuotaDraft) : board.dailyQuota,
                  })
                )
              }
              type="button"
            >
              Save board context
            </button>
          </div>

          <div className="panel surface panel">
            <div className="inline-between">
              <h2 className="panel-title">Manager prompts</h2>
              <Sparkles size={18} color="#f6c453" />
            </div>
            <div className="stack section">
              {prompts.map((prompt) => (
                <div className="prompt-row" key={prompt.id}>
                  {prompt.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function EditableTaskRow({
  disabled,
  onDelete,
  onSave,
  onToggle,
  task,
}: {
  disabled: boolean;
  onDelete: () => void;
  onSave: (title: string, type: TaskType, priority: TaskPriority) => void;
  onToggle: () => void;
  task: BoardData["tasks"][number];
}) {
  const [title, setTitle] = useState(task.title);
  const [type, setType] = useState(task.type);
  const [priority, setPriority] = useState(task.priority);
  const done = task.status === "done";

  return (
    <div className={`task-row ${done ? "task-row-done" : ""}`}>
      <div className="task-row-header">
        <button
          aria-label={done ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
          className={`task-toggle ${done ? "task-toggle-done" : ""}`}
          disabled={disabled}
          onClick={onToggle}
          type="button"
        >
          {done ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        <div className="field-stack" style={{ flex: 1 }}>
          <input
            className={`text-input ${done ? "task-row-title-done" : ""}`}
            onChange={(event) => setTitle(event.target.value)}
            value={title}
          />
          <div className="task-toolbar">
            <select className="select-input select-input-inline" onChange={(event) => setType(event.target.value as TaskType)} value={type}>
              {orderedTaskTypes.map((taskType) => (
                <option key={taskType} value={taskType}>
                  {taskTypeLabel[taskType]}
                </option>
              ))}
            </select>
            <select className="select-input select-input-inline" onChange={(event) => setPriority(event.target.value as TaskPriority)} value={priority}>
              <option value="Level 1: Critical">L1</option>
              <option value="Level 2: Strategic">L2</option>
              <option value="Level 3: Operational">L3</option>
            </select>
            <span className="muted-text">{done ? "Completed" : "Open"}</span>
          </div>
        </div>
      </div>

      <div className="toolbar toolbar-inline toolbar-compact">
        <button className="secondary-button" disabled={disabled || !title.trim()} onClick={() => onSave(title, type, priority)} type="button">
          Save task
        </button>
        <button className="danger-button" disabled={disabled} onClick={onDelete} type="button">
          Delete
        </button>
      </div>
    </div>
  );
}

function EditableMustWinCard({
  canEdit,
  disabled,
  mustWin,
  onDelete,
  onSave,
}: {
  canEdit: boolean;
  disabled: boolean;
  mustWin: { id: string; text: string };
  onDelete: () => void;
  onSave: (text: string) => void;
}) {
  const [text, setText] = useState(mustWin.text);

  if (!canEdit) {
    return <div className="must-win-card">{mustWin.text}</div>;
  }

  return (
    <div className="must-win-card">
      <textarea className="text-area" onChange={(event) => setText(event.target.value)} value={text} />
      <div className="toolbar toolbar-inline toolbar-compact">
        <button className="secondary-button" disabled={disabled || !text.trim()} onClick={() => onSave(text)} type="button">
          Save
        </button>
        <button className="danger-button" disabled={disabled} onClick={onDelete} type="button">
          Delete
        </button>
      </div>
    </div>
  );
}

function BoardStat({ label, value, help }: { label: string; value: string; help: string }) {
  return (
    <div className="stat-card surface-soft">
      <div className="meta-label">{label}</div>
      <div className="metric-value">{value}</div>
      <div className="panel-copy">{help}</div>
    </div>
  );
}
