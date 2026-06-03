"use client";
// Hook that manages task state, syncing localStorage with the backend API.
// Provides CRUD helpers and utilities for manipulating tasks and subtasks.
import { useEffect, useCallback, useRef } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useTaskApi } from "@/hooks/useTaskApi";
import { Task, TaskStatus, SubItem } from "@/types/task";

function uid(): string {
  // Generate a short unique id for new tasks/subitems.
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

const STORAGE_KEY = "taskos_v1";

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEY, []);
  const {
    fetchTasks,
    createTask: apiCreate,
    updateTask: apiUpdate,
    deleteTask: apiDelete,
  } = useTaskApi();

  // Sync localStorage -> MongoDB once on mount
  const _synced = useRef(false);
  useEffect(() => {
    if (_synced.current) return;
    _synced.current = true;
    // On first mount, fetch remote tasks and reconcile with local storage.
    (async () => {
      try {
        const remoteTasks = await fetchTasks();

        const remoteMap = new Map(remoteTasks.map((r) => [r.id, r]));
        const localMap = new Map(tasks.map((t) => [t.id, t]));

        // Upload local-only tasks and reconcile differences
        // Upload local-only tasks and reconcile conflicts with remote version
        for (const lt of tasks) {
          const rt = remoteMap.get(lt.id);
          if (!rt) {
            try {
              const saved = await apiCreate(lt);
              setTasks((prev) => prev.map((t) => (t.id === lt.id ? saved : t)));
            } catch (err) {
              console.error("sync create failed for", lt.id, err);
            }
          } else {
            if (JSON.stringify(lt) !== JSON.stringify(rt)) {
              // Simple conflict resolution: prefer the one with later createdAt or more timeLogs
              const ltTime = new Date(lt.createdAt).getTime();
              const rtTime = new Date(rt.createdAt).getTime();
              const ltLogs = lt.timeLogs?.length || 0;
              const rtLogs = rt.timeLogs?.length || 0;
              // Simple conflict resolution: prefer later createdAt or more time logs
              if (ltTime >= rtTime || ltLogs >= rtLogs) {
                try {
                  await apiUpdate(lt);
                } catch (err) {
                  console.error("sync update failed for", lt.id, err);
                }
              } else {
                setTasks((prev) => prev.map((t) => (t.id === rt.id ? rt : t)));
              }
            }
          }
        }

        // Add remote-only tasks into local state
        const merged = [
          ...remoteTasks.filter((r) => !localMap.has(r.id)),
          ...tasks,
        ];
        if (merged.length) setTasks(merged);
      } catch (err) {
        console.error("initial sync failed", err);
      }
    })();
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createTask = useCallback(
    (title: string) => {
      if (!title.trim()) return;

      const task: Task = {
        id: uid(),
        title: title.trim(),
        status: "inbox",
        createdAt: new Date().toISOString(),
        timeLogs: [
          {
            status: "inbox",
            startedAt: new Date().toISOString(),
            endedAt: null,
          },
        ],
        subItems: [],
      };

      // Optimistically add locally, then replace with server version when available
      setTasks((prev) => [task, ...prev]);
      apiCreate(task)
        .then((saved) => {
          // Replace local task with API-saved version
          setTasks((prev) => prev.map((t) => (t.id === task.id ? saved : t)));
          // Re-fetch remote tasks to ensure server state is reflected
          // (useful when multiple clients are open or server adds fields)
          fetchTasks()
            .then((remote) => {
              setTasks((prev) => {
                // Merge remote tasks with local ones, preserving local-only newer items
                const localIds = new Set(prev.map((p) => p.id));
                const merged = [
                  ...remote.filter((r) => !localIds.has(r.id)),
                  ...prev,
                ];
                return merged;
              });
            })
            .catch(() => undefined);
        })
        .catch((err) => {
          console.error("apiCreate error:", err);
        });
    },
    [apiCreate, setTasks],
  );

  const changeStatus = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      // Update status locally and append a time log; fire API update in background
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const now = new Date().toISOString();
          const logs = [...t.timeLogs];
          if (logs.length)
            logs[logs.length - 1] = { ...logs[logs.length - 1], endedAt: now };
          const updated = {
            ...t,
            status: newStatus,
            timeLogs: [
              ...logs,
              { status: newStatus, startedAt: now, endedAt: null },
            ],
          };
          apiUpdate(updated).catch(() => undefined);
          return updated;
        }),
      );
    },
    [apiUpdate, setTasks],
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      // Remove locally and request deletion on server
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      apiDelete(taskId).catch(() => undefined);
    },
    [apiDelete, setTasks],
  );

  const updateTitle = useCallback(
    (taskId: string, title: string) => {
      // Update the title locally and send the change to the API
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const updated = { ...t, title };
          apiUpdate(updated).catch(() => undefined);
          return updated;
        }),
      );
    },
    [apiUpdate, setTasks],
  );

  const addSubItem = useCallback(
    (taskId: string, text: string) => {
      if (!text.trim()) return;
      // Append a sub-item locally and update the server
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const sub: SubItem = { id: uid(), text: text.trim(), done: false };
          const updated = { ...t, subItems: [...t.subItems, sub] };
          apiUpdate(updated).catch(() => undefined);
          return updated;
        }),
      );
    },
    [apiUpdate, setTasks],
  );

  const toggleSubItem = useCallback(
    (taskId: string, subId: string) => {
      // Toggle sub-item done state locally and persist to API
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const updated = {
            ...t,
            subItems: t.subItems.map((s) =>
              s.id === subId ? { ...s, done: !s.done } : s,
            ),
          };
          apiUpdate(updated).catch(() => undefined);
          return updated;
        }),
      );
    },
    [apiUpdate, setTasks],
  );

  const deleteSubItem = useCallback(
    (taskId: string, subId: string) => {
      // Remove a sub-item locally and update the backend
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id !== taskId) return t;
          const updated = {
            ...t,
            subItems: t.subItems.filter((s) => s.id !== subId),
          };
          apiUpdate(updated).catch(() => undefined);
          return updated;
        }),
      );
    },
    [apiUpdate, setTasks],
  );

  return {
    tasks,
    createTask,
    changeStatus,
    deleteTask,
    updateTitle,
    addSubItem,
    toggleSubItem,
    deleteSubItem,
  };
}
