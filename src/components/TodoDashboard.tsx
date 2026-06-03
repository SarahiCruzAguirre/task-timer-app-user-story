
'use client';
// Main dashboard UI composed of header, task columns and side panels.
// - Renders `HeroBanner`, `TaskInput`, four `TaskColumn`s and side widgets.
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus } from '@/types/task';
import HeroBanner from './HeroBanner';
import SplineCard from './SplineCard';
import TaskInput from './TaskInput';
import TaskColumn from './TaskColumn';

const STATUSES: TaskStatus[] = ['inbox', 'pending', 'in_progress', 'done'];

function ClockDisplay() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () =>
      setTime(new Date().toLocaleTimeString('es', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
      }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    // Small clock component used in the side panel
    <p className="text-xl font-semibold text-purple-300 mt-1 tabular-nums">{time}</p>
  );
}

export default function TodoDashboard() {
  const {
    tasks, createTask, changeStatus, deleteTask,
    updateTitle, addSubItem, toggleSubItem, deleteSubItem,
  } = useTasks();

  const countByStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;

  return (
    <div className="flex min-h-screen bg-[#0d0d14] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      {/* Left sidebar with navigation icons */}
      <aside className="w-[52px] shrink-0 bg-[#090910] border-r border-purple-500/10 flex flex-col items-center py-4 gap-2 z-10">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-purple-900 flex items-center justify-center mb-2">
          <span className="text-white text-xs font-bold">T</span>
        </div>
        {['layout-kanban', 'calendar', 'chart-bar', 'bell', 'settings'].map((icon) => (
          <button key={icon} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 transition-colors">
            <i className={`ti ti-${icon} text-lg`} />
          </button>
        ))}
        <div className="mt-auto w-7 h-7 rounded-full bg-gradient-to-br from-purple-600 to-violet-400 flex items-center justify-center text-[10px] font-bold text-white">
          TU
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* Top header: greeting, search and status counters */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-white/[0.04]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-100">Hola, bienvenido ✦</h1>
              <p className="text-xs text-purple-400/60 mt-0.5 tracking-wide">Tu espacio de tareas · TaskTimer</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-[#0f0f20]/70 border border-purple-500/20 rounded-lg px-3 py-1.5">
                <i className="ti ti-search text-gray-600 text-sm" />
                <span className="text-xs text-gray-600">Buscar...</span>
              </div>
              <button className="bg-gradient-to-r from-purple-700 to-purple-900 text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
                Pro ✦
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            {STATUSES.map((s) => (
              <div key={s} className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1 flex items-center gap-2">
                <span className="text-purple-300 font-semibold text-sm">{countByStatus(s)}</span>
                <span className="text-[10px] text-purple-500/70">{s === 'in_progress' ? 'En proceso' : s === 'inbox' ? 'Inbox' : s === 'pending' ? 'Pendiente' : 'Hecha'}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 pb-4">
          {/* Hero banner with summary stats */}
          <HeroBanner tasks={tasks} />
        </div>

        {/* Body */}
        {/* Main content area: task columns and side panel */}
        <div className="flex-1 overflow-auto p-4 grid grid-cols-[1fr_220px] gap-4">
          <div className="space-y-3">
            <TaskInput onCreate={createTask} />
            <div className="grid grid-cols-4 gap-3">
              {STATUSES.map((s) => (
                <TaskColumn
                  key={s}
                  status={s}
                  tasks={tasks.filter((t) => t.status === s)}
                  onChangeStatus={changeStatus}
                  onDelete={deleteTask}
                  onUpdateTitle={updateTitle}
                  onAddSubItem={addSubItem}
                  onToggleSubItem={toggleSubItem}
                  onDeleteSubItem={deleteSubItem}
                />
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="space-y-3">

            {/* Spline Card */}
            <div className="rounded-2xl overflow-hidden border border-purple-500/15 bg-[#0a0812]" style={{ height: '220px', position: 'relative' }}>
              <SplineCard />
            </div>

            {/* Progreso */}
            <div className="bg-[#0c0c16]/80 border border-white/[0.05] rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">Progreso</p>
              {STATUSES.map((s) => {
                const pct = tasks.length
                  ? Math.round((countByStatus(s) / tasks.length) * 100)
                  : 0;
                const bar: Record<TaskStatus, string> = {
                  inbox:       'bg-gray-500',
                  pending:     'bg-amber-400',
                  in_progress: 'bg-purple-500',
                  done:        'bg-emerald-400',
                };
                const labels: Record<TaskStatus, string> = {
                  inbox: 'Inbox', pending: 'Pendiente',
                  in_progress: 'En proceso', done: 'Hecha',
                };
                return (
                  <div key={s} className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">{labels[s]}</span>
                      <span className="text-purple-400 font-semibold">{pct}%</span>
                    </div>
                    <div className="h-1 bg-white/[0.04] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${bar[s]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reloj */}
            <div className="bg-[#0c0c16]/80 border border-white/5 rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">Hoy</p>
              <p className="text-xs text-gray-500 capitalize">
                {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <ClockDisplay />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}