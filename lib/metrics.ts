import type { Task } from "@/lib/types";

export function getCompletedCount(tasks: Task[]) {
  return tasks.filter((task) => task.status === "done").length;
}

export function getOpenCount(tasks: Task[]) {
  return tasks.length - getCompletedCount(tasks);
}

export function getPacePercent(completedCount: number, dailyQuota: number) {
  if (dailyQuota <= 0) {
    return 0;
  }

  return Math.round((completedCount / dailyQuota) * 100);
}

export function getPaceHealth(percent: number) {
  if (percent >= 100) {
    return {
      label: "Quota hit",
      className: "badge badge-good",
    };
  }

  if (percent >= 70) {
    return {
      label: "On pace",
      className: "badge badge-warn",
    };
  }

  return {
    label: "Needs pressure",
    className: "badge badge-danger",
  };
}

export function getTypeCounts(tasks: Task[]) {
  return tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.type] = (counts[task.type] ?? 0) + 1;
    return counts;
  }, {});
}

export function getMemberRollup(member: { tasks: Task[]; dailyQuota: number }) {
  const completedCount = getCompletedCount(member.tasks);
  const openCount = getOpenCount(member.tasks);
  const pacePercent = getPacePercent(completedCount, member.dailyQuota);

  return {
    completedCount,
    openCount,
    pacePercent,
    health: getPaceHealth(pacePercent),
  };
}

export function getTeamTotals(members: Array<{ tasks: Task[]; dailyQuota: number }>) {
  return members.reduce(
    (totals, member) => {
      const completedCount = getCompletedCount(member.tasks);

      totals.completed += completedCount;
      totals.open += member.tasks.length - completedCount;
      totals.quota += member.dailyQuota;

      return totals;
    },
    {
      completed: 0,
      open: 0,
      quota: 0,
    }
  );
}
