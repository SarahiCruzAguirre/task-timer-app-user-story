import { useCallback } from "react";
import type { Task } from "@/types/task";

const TASKS_PATH = "/api/tasks";

// Small wrapper hook that exposes CRUD helpers for the tasks API endpoint.
// Each method throws on non-OK responses to allow callers to handle errors.
export function useTaskApi() {
  const fetchTasks = useCallback(async () => {
    const response = await fetch(TASKS_PATH);
    if (!response.ok) {
      throw new Error("Failed to load tasks");
    }
    return (await response.json()) as Task[];
  }, []);

  // Create a new task via POST
  const createTask = useCallback(async (task: Task) => {
    const response = await fetch(TASKS_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error("Failed to create task");
    }
    return (await response.json()) as Task;
  }, []);

  // Update an existing task via PATCH
  const updateTask = useCallback(async (task: Task) => {
    const response = await fetch(TASKS_PATH, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, fields: task }),
    });
    if (!response.ok) {
      throw new Error("Failed to update task");
    }
    return (await response.json()) as Task;
  }, []);

  // Delete a task by id
  const deleteTask = useCallback(async (taskId: string) => {
    const response = await fetch(
      `${TASKS_PATH}?id=${encodeURIComponent(taskId)}`,
      {
        method: "DELETE",
      },
    );
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
    return true;
  }, []);

  return { fetchTasks, createTask, updateTask, deleteTask };
}
