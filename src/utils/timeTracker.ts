// Utilities for computing and formatting task time information.
// - `getTimeLogs`: aggregates time spent per status from time logs
// - `formatDuration`: human-friendly duration string from milliseconds
// - `formatDate`: localized display string for ISO timestamps
import { Task, TaskStatus } from "@/types/task";

export function getTimeLogs(task: Task): Record<TaskStatus, number> {
  const now = Date.now();
  const result = {} as Record<TaskStatus, number>;

  task.timeLogs.forEach((log) => {
    const end = log.endedAt ? new Date(log.endedAt).getTime() : now;
    const dur = end - new Date(log.startedAt).getTime();
    result[log.status] = (result[log.status] || 0) + dur;
  });

  return result;
}

export function formatDuration(ms: number): string {
  // Convert milliseconds to a short human readable string (s/m/h)
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function formatDate(iso: string): string {
  // Format ISO timestamp into a short localized date + time string
  const d = new Date(iso);
  return (
    d.toLocaleDateString("es", { day: "2-digit", month: "short" }) +
    " " +
    d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })
  );
}
