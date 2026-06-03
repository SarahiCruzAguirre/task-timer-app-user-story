// Core task-related types used across the app.
// `TaskStatus` — the allowed lifecycle stages for a task.
export type TaskStatus = "inbox" | "pending" | "in_progress" | "done";

// `TimeLog` — records when a task entered/exited a status.
export interface TimeLog {
  status: TaskStatus;
  startedAt: string;
  endedAt: string | null;
}

// `SubItem` — a simple checklist entry belonging to a task.
export interface SubItem {
  id: string;
  text: string;
  done: boolean;
}

// `Task` — main data model representing a to-do item.
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  timeLogs: TimeLog[];
  subItems: SubItem[];
  color?: string;
}
