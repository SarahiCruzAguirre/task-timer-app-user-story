"use client";
// Visual card for a single task, including title editing, status, time logs
// and sub-item management. Supports drag and drop via the parent column.
import { useState, useRef, useEffect } from 'react';
import {
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { Task, TaskStatus } from '@/types/task';
import { getTimeLogs, formatDuration, formatDate } from '@/utils/timeTracker';

const STATUS_CONFIG: Record<TaskStatus, { label: string; badge: string; btn: string }> = {
  inbox:       { label: 'Inbox',      badge: 'bg-gray-500/15 text-gray-400',   btn: 'border-gray-500/40 text-gray-400 hover:bg-gray-500/20' },
  pending:     { label: 'Pendiente',  badge: 'bg-amber-500/15 text-amber-300', btn: 'border-amber-500/40 text-amber-300 hover:bg-amber-500/20' },
  in_progress: { label: 'En proceso', badge: 'bg-purple-500/15 text-purple-300', btn: 'border-purple-500/40 text-purple-300 hover:bg-purple-500/20' },
  done:        { label: 'Hecha',      badge: 'bg-emerald-500/15 text-emerald-300', btn: 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20' },
};

const STATUS_ORDER: TaskStatus[] = ['inbox', 'pending', 'in_progress', 'done'];

interface Props {
  task: Task;
  onChangeStatus: (id: string, s: TaskStatus) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onAddSubItem: (id: string, text: string) => void;
  onToggleSubItem: (id: string, subId: string) => void;
  onDeleteSubItem: (id: string, subId: string) => void;
}

export default function TaskCard({
  task, onChangeStatus, onDelete, onUpdateTitle,
  onAddSubItem, onToggleSubItem, onDeleteSubItem,
}: Props): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(task.title);
  const [subInput, setSubInput] = useState('');
  const editRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) editRef.current?.focus();
  }, [editing]);

  const cfg = STATUS_CONFIG[task.status];
  const tl = getTimeLogs(task);

  const borderColor: Record<TaskStatus, string> = {
    inbox:       'border-l-gray-500',
    pending:     'border-l-amber-400',
    in_progress: 'border-l-purple-500',
    done:        'border-l-emerald-400',
  };

  const handleAddSub = () => {
    onAddSubItem(task.id, subInput);
    setSubInput('');
  };

  return (
    <div
      className={`bg-[#12101f]/95 rounded-xl border-l-2 border-t border-r border-b border-white/5 p-3 mb-2 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 transition-transform ${borderColor[task.status]}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
    >
      {/* Header: title edit, expand toggle and delete */}
      <div className="flex items-start gap-2 mb-2">
        {editing ? (
          <input
            ref={editRef}
            value={editVal}
            onChange={(e) => setEditVal(e.target.value)}
            onBlur={() => { onUpdateTitle(task.id, editVal); setEditing(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onUpdateTitle(task.id, editVal); setEditing(false); }
              if (e.key === 'Escape') setEditing(false);
            }}
            className="flex-1 bg-transparent border-b border-purple-500/50 outline-none text-slate-200 text-xs font-medium"
          />
        ) : (
          <div
            className={`flex-1 text-xs font-medium leading-snug cursor-pointer ${task.status === 'done' ? 'line-through text-gray-600' : 'text-slate-300'}`}
            onDoubleClick={() => setEditing(true)}
          >
            {task.title}
          </div>
        )}
        <button onClick={() => setExpanded(!expanded)} className="text-gray-600 hover:text-purple-400 transition-colors p-0.5">
          <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </button>
        <button onClick={() => onDelete(task.id)} className="text-gray-600 hover:text-red-400 transition-colors p-0.5">
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Meta: status badge, creation date and sub-item summary */}
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{cfg.label}</span>
        <span className="text-[10px] text-gray-600">{formatDate(task.createdAt)}</span>
        {task.subItems.length > 0 && (
          <span className="text-[10px] text-gray-600">· {task.subItems.filter((s) => s.done).length}/{task.subItems.length}</span>
        )}
      </div>

      {/* Time chips: display aggregated time spent per status */}
      <div className="flex flex-wrap gap-1 mb-1">
        {STATUS_ORDER.map((s) => {
          const ms = tl[s];
          if (!ms) return null;
          return (
            <span key={s} className="text-[9px] px-1.5 py-0.5 rounded bg-white/3 border border-white/5 text-gray-600">
              {STATUS_CONFIG[s].label}: {formatDuration(ms)}
            </span>
          );
        })}
      </div>


      {/* Expanded panel: appears when card is expanded; contains controls */}
      {expanded && (
        <div className="border-t border-white/5 pt-2 mt-1 space-y-3">
          {/* Status buttons: let user quickly change task status */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-gray-600 mb-1.5">Cambiar estado</p>
            <div className="flex flex-wrap gap-1">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeStatus(task.id, s)}
                  className={`text-[9px] font-semibold px-2 py-1 rounded-full border transition-all ${STATUS_CONFIG[s].btn} ${task.status === s ? 'opacity-100 scale-105' : 'opacity-60'}`}
                >
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-items: checklist UI for task subtasks */}
          <div>
            <p className="text-[9px] uppercase tracking-wider text-gray-600 mb-1.5">Sub-tareas</p>
            {task.subItems.length === 0 && (
              <p className="text-[10px] text-gray-700 mb-1">Sin sub-tareas aún</p>
            )}
            {task.subItems.map((s) => (
              <div key={s.id} className="flex items-center gap-2 py-1 border-b border-white/4">
                <button
                  onClick={() => onToggleSubItem(task.id, s.id)}
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${s.done ? 'bg-purple-600 border-purple-600' : 'border-gray-600'}`}
                >
                  {s.done && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className={`flex-1 text-[10px] ${s.done ? 'line-through text-gray-600' : 'text-gray-400'}`}>{s.text}</span>
                <button onClick={() => onDeleteSubItem(task.id, s.id)} className="text-gray-700 hover:text-red-400 transition-colors">
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </div>
            ))}
            {/* Add sub-item input and button */}
            <div className="flex gap-1.5 mt-2">
              <input
                value={subInput}
                onChange={(e) => setSubInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                placeholder="Nueva sub-tarea..."
                className="flex-1 bg-purple-500/6 border border-purple-500/15 rounded px-2 py-1 text-[10px] text-slate-300 outline-none placeholder:text-gray-700 focus:border-purple-500/40"
              />
              <button onClick={handleAddSub} className="bg-purple-500/20 border border-purple-500/25 text-purple-300 rounded px-2 py-1 text-[10px] hover:bg-purple-500/35 transition-colors">
                <PlusIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
