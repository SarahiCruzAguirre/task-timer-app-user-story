import { Task } from "@/types/task";

/**
 * CLIENT-SIDE COMMENTS & TASK SERVICES
 * ---------------------------------------------------------------------------
 * This file contains the service layer helper functions for Comments and single
 * task fetching.
 * 
 * ARCHITECTURAL DESIGN:
 * This layer abstracts raw `fetch` requests away from frontend components (views),
 * ensuring that components only deal with pure business logic and typed interfaces.
 * 
 * VIEWS ---> SERVICES ---> API ROUTES ---> DATABASE
 */

export interface CommentData {
  _id?: string;
  todoId: string;
  content: string;
  createdAt: string;
}

export const commentsService = {
  /**
   * Fetches comments for a specific task, sorted from oldest to newest.
   * GET /api/comments/[todoId]
   */
  async getComments(todoId: string): Promise<CommentData[]> {
    const res = await fetch(`/api/comments/${encodeURIComponent(todoId)}`, {
      cache: "no-store", // Ensure we load fresh comments from the DB
    });
    if (!res.ok) {
      throw new Error(`Failed to load comments for task: ${todoId}`);
    }
    return res.json();
  },

  /**
   * Submits a new comment for a specific task.
   * POST /api/comments
   */
  async createComment(todoId: string, content: string): Promise<CommentData> {
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ todoId, content }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to submit comment");
    }
    return res.json();
  },

  /**
   * Retrieves single task details (title, status, date records).
   * GET /api/todolist/[id]
   */
  async getTask(id: string): Promise<Task> {
    const res = await fetch(`/api/todolist/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch task with ID: ${id}`);
    }
    return res.json();
  }
};
