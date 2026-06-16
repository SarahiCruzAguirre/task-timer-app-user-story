"use client";
// Column that displays tasks for a given `TaskStatus`.
// Supports drag-and-drop to change task status and shows a header + task cards.
import { DragEvent } from 'react';
import { Task, TaskStatus } from '@/types/task';
import TaskCard from './TaskCard';

const COL_CONFIG: Record<TaskStatus, { label: string; dot: string; name: string }> = {
  inbox:       { label: 'Inbox',      dot: 'bg-gray-500',    name: 'text-gray-400' },
  pending:     { label: 'Pendiente',  dot: 'bg-amber-400',   name: 'text-amber-300' },
  in_progress: { label: 'En proceso', dot: 'bg-purple-500',  name: 'text-purple-300' },
  done:        { label: 'Hecha',      dot: 'bg-emerald-400', name: 'text-emerald-300' },
};

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onChangeStatus: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onAddSubItem: (id: string, text: string) => void;
  onToggleSubItem: (id: string, subId: string) => void;
  onDeleteSubItem: (id: string, subId: string) => void;
}

export default function TaskColumn({ status, tasks, ...handlers }: Props) {
  const cfg = COL_CONFIG[status];

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) handlers.onChangeStatus(taskId, status);
    e.currentTarget.classList.remove('border-purple-500/50');
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-purple-500/50');
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('border-purple-500/50');
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className="bg-[#0c0c16]/80 border border-white/5 rounded-xl p-2.5 min-h-[300px] transition-colors"
    >
      {/* Column header with color dot and count */}
      <div className="flex items-center gap-2 pb-2 mb-2 border-b border-white/5">
        <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
        <span className={`text-[10px] font-semibold uppercase tracking-widest flex-1 ${cfg.name}`}>{cfg.label}</span>
        <span className="text-[10px] bg-white/5 text-gray-600 rounded-full px-2 py-0.5">{tasks.length}</span>
      </div>

      {/* Task cards area: empty state or mapped TaskCard components */}
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-gray-800 text-[10px] border border-dashed border-white/4 rounded-lg">
          Sin tareas
        </div>
      ) : (
        tasks.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onChangeStatus={handlers.onChangeStatus}
            onDelete={handlers.onDelete}
            onUpdateTitle={handlers.onUpdateTitle}
            onAddSubItem={handlers.onAddSubItem}
            onToggleSubItem={handlers.onToggleSubItem}
            onDeleteSubItem={handlers.onDeleteSubItem}
          />
        ))
      )}
    </div>
  );
}