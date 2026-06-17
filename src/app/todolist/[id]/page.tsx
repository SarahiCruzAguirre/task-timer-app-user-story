"use client";

/**
 * TASK DETAIL VIEW (todolist/[id])
 * ---------------------------------------------------------------------------
 * This client component renders the dynamic detail view for a specific task.
 * It displays:
 * 1. Task properties: Title, current status badge, and creation date.
 * 2. Time Logs: Aggregate duration spent in each task lifecycle stage.
 * 3. Comments section: Listing historical comments fetched from Mongoose,
 *    and a form to submit comments.
 * 
 * HOW THE I18N WAS INTEGRATED:
 * - We consume the `useTranslation()` hook. This lets us fetch active locale-aware
 *   labels dynamically.
 * - System feedback messages (e.g. error loading, no comments, labels, buttons)
 *   use the `t()` translation helper.
 * - Dates and durations are formatted dynamically using locales.
 * 
 * DYNAMIC NAVIGATION CONSTRAINTS:
 * - We strictly use `useRouter()` from `next/navigation` to route back to the
 *   dashboard main page.
 */

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button, Card } from "@heroui/react";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { commentsService, CommentData } from "@/services/comments";
import { Task, TaskStatus } from "@/types/task";
import { useTranslation } from "@/hooks/useTranslation";
import { formatDate } from "@/utils/timeTracker";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TaskDetailPage({ params }: PageProps) {
  // Unwraps the params Promise in Next.js 15+ using React.use()
  const { id } = use(params);
  const router = useRouter();
  const { t, locale } = useTranslation();

  // Component state
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newCommentText, setNewCommentText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch task and comment data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Parallel requests to get task details and comments
        const [fetchedTask, fetchedComments] = await Promise.all([
          commentsService.getTask(id),
          commentsService.getComments(id),
        ]);
        
        setTask(fetchedTask);
        setComments(fetchedComments);
      } catch (err) {
        console.error("Error loading task details:", err);
        setError(t("task_not_found"));
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, t]);

  // Handle comment form submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    try {
      setSubmitting(true);
      // Calls comments service API POST wrapper
      const savedComment = await commentsService.createComment(id, newCommentText);
      
      // Update state locally so the new comment appears instantly without refreshing
      setComments((prev) => [...prev, savedComment]);
      setNewCommentText("");
    } catch (err) {
      console.error("Error submitting comment:", err);
      alert("Error saving comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to map status to styling classes
  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case "inbox":
        return "bg-gray-500/15 text-gray-400 border border-gray-500/30";
      case "pending":
        return "bg-amber-500/15 text-amber-300 border border-amber-500/30";
      case "in_progress":
        return "bg-purple-500/15 text-purple-300 border border-purple-500/30";
      case "done":
        return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30";
      default:
        return "bg-gray-500/15 text-gray-400";
    }
  };

  // Translate status name
  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case "inbox":       return t("inbox");
      case "pending":     return t("pending");
      case "in_progress": return t("progress");
      case "done":        return t("done");
      default:            return status;
    }
  };

  // Aggregate timeSpent in milliseconds per status from the task logs
  const computeTimeSpent = () => {
    if (!task || !task.timeLogs) return {};
    const logTotals: Record<string, number> = {};
    
    task.timeLogs.forEach((log) => {
      const start = new Date(log.startedAt).getTime();
      const end = log.endedAt ? new Date(log.endedAt).getTime() : Date.now();
      const diff = end - start;
      
      if (diff > 0) {
        logTotals[log.status] = (logTotals[log.status] || 0) + diff;
      }
    });
    
    return logTotals;
  };

  // Helper to format raw duration milliseconds into human-readable strings
  const formatDurationMs = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60) % 60;
    const hrs = Math.floor(totalSecs / 3600);
    
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    if (mins > 0) {
      return `${mins}m`;
    }
    return `${totalSecs % 60}s`;
  };

  // Loading indicator view
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-main text-text-main">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-purple-600/30 border-t-purple-500 rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-wide text-text-muted">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Error boundary view (e.g. task not found)
  if (error || !task) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-main text-text-main p-6">
        <Card className="max-w-md w-full bg-bg-card border border-border-main p-6 text-center shadow-xl">
          <h2 className="text-xl font-bold text-red-400 mb-2">{t("task_not_found")}</h2>
          <p className="text-xs text-text-muted mb-6">The task you are looking for does not exist or has been deleted.</p>
          <Button
            size="sm"
            onPress={() => router.push("/")}
            className="bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center justify-center gap-1"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            {t("back")}
          </Button>
        </Card>
      </div>
    );
  }

  const timeLogsSummary = computeTimeSpent();

  return (
    <div className="min-h-screen bg-bg-main text-text-main font-sans flex flex-col items-center p-4 md:p-8 overflow-y-auto">
      <div className="w-full max-w-3xl flex flex-col gap-6">
        
        {/* Navigation Header */}
        <header className="flex items-center justify-between pb-4 border-b border-border-main">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-main transition-colors bg-bg-input border border-border-main rounded-xl px-3.5 py-2"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            {t("back")}
          </button>
          <span className="text-xs uppercase tracking-widest text-purple-400/80 font-bold">{t("detail_view")}</span>
        </header>

        {/* Task Details Info Card */}
        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <section className="md:col-span-2 flex flex-col gap-6">
            <Card className="bg-bg-card border border-border-main p-6 shadow-lg rounded-2xl flex flex-col gap-4">
              
              {/* Task Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>
                <h1 className="text-2xl font-bold leading-snug tracking-tight text-white">{task.title}</h1>
              </div>

              {/* Task Dates & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-border-main/50 pt-4">
                <div className="flex items-center gap-2 text-text-muted">
                  <CalendarIcon className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>{t("today")}: {formatDate(task.createdAt)}</span>
                </div>
              </div>
            </Card>

            {/* Comments Thread History */}
            <Card className="bg-bg-card border border-border-main p-6 shadow-lg rounded-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border-main/50">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-semibold text-white">{t("comments")}</h2>
                <span className="text-xs bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full ml-auto">
                  {comments.length}
                </span>
              </div>

              {/* Comments List */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {comments.length === 0 ? (
                  <p className="text-xs text-text-muted/60 text-center py-6 italic">{t("no_comments")}</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="flex flex-col gap-1 p-3 bg-bg-column/40 border border-border-main/40 rounded-xl hover:bg-bg-column/60 transition-colors"
                    >
                      <p className="text-xs font-normal text-gray-200 whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </p>
                      <span className="text-[9px] text-text-muted/50 text-right mt-1">
                        {new Date(comment.createdAt).toLocaleDateString(locale === "es" ? "es" : "en", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleCommentSubmit} className="flex gap-2 border-t border-border-main/50 pt-4 mt-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder={`${t("comment")}...`}
                  className="flex-1 bg-bg-input border border-border-main hover:border-purple-500/50 focus:border-purple-500/70 text-text-main text-xs placeholder:text-text-muted/40 outline-none rounded-xl px-3 py-2 transition-colors"
                  disabled={submitting}
                />
                <Button
                  type="submit"
                  isIconOnly
                  size="sm"
                  isDisabled={!newCommentText.trim() || submitting}
                  className={`rounded-xl transition-all ${
                    newCommentText.trim()
                      ? "bg-purple-700 text-white hover:bg-purple-800"
                      : "bg-bg-input text-text-muted/30 border border-border-main cursor-not-allowed"
                  }`}
                >
                  <PaperAirplaneIcon className="w-4 h-4" />
                </Button>
              </form>
            </Card>
          </section>

          {/* Time Tracking / Activity Metrics Sidebar */}
          <aside className="flex flex-col gap-6">
            <Card className="bg-bg-card border border-border-main p-6 shadow-lg rounded-2xl flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border-main/50">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-semibold text-white">{t("progress_title")}</h2>
              </div>

              <div className="space-y-3">
                {Object.keys(STATUS_CONFIG).map((s) => {
                  const statusKey = s as TaskStatus;
                  const duration = timeLogsSummary[statusKey] || 0;
                  const label = getStatusLabel(statusKey);
                  return (
                    <div key={statusKey} className="flex items-center justify-between text-xs py-1 border-b border-border-main/30 last:border-0">
                      <span className="text-text-muted">{label}</span>
                      <span className="font-semibold text-purple-300 tabular-nums">
                        {duration > 0 ? formatDurationMs(duration) : "--"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </aside>
        </main>
      </div>
    </div>
  );
}

// Stub/helper status configurations to map localized labels
const STATUS_CONFIG: Record<TaskStatus, null> = {
  inbox: null,
  pending: null,
  in_progress: null,
  done: null,
};
