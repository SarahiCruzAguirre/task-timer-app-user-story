
'use client';
// Main dashboard UI composed of header, task columns and side panels.
// - Renders `HeroBanner`, `TaskInput`, four `TaskColumn`s and side widgets.

/**
 * TODO DASHBOARD COMPONENT
 * ---------------------------------------------------------------------------
 * This is the central hub of our TodoList application. It renders the sidebar,
 * top header, stats overview, main task board (using columns), and sidebar widgets
 * like the clock and Spline 3D view.
 * 
 * HOW THE I18N WAS INTEGRATED:
 * 1. Hook Invocation: We call `useTranslation()` to retrieve the current locale
 *    and translation function `t`.
 * 2. Component Integration: We render `<LanguageSwitcher />` in the top header
 *    for user access.
 * 3. Dynamic Text Lookup: Hardcoded Spanish strings are replaced with `t('key')` calls
 *    corresponding to the language configuration files (`en.json` / `es.json`).
 * 4. Locale-Specific Date Formatting: The clock/date widget reads the active `locale`
 *    and formats the date accordingly.
 */
import { useState, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { TaskStatus } from '@/types/task';
import HeroBanner from './HeroBanner';
import SplineCard from './SplineCard';
import TaskInput from './TaskInput';
import TaskColumn from './TaskColumn';
import { ThemeSwitcher } from './theme-switcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from '@/hooks/useTranslation';


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
  const { t, locale } = useTranslation();

  const countByStatus = (s: TaskStatus) => tasks.filter((t) => t.status === s).length;

  return (
    <div className="flex min-h-screen bg-bg-main text-text-main font-sans overflow-hidden">
      {/* Sidebar */}
      {/* Left sidebar with navigation icons */}
      <aside className="w-[52px] shrink-0 bg-bg-sidebar border-r border-border-main flex flex-col items-center py-4 gap-2 z-10">
        <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-600 to-purple-900 flex items-center justify-center mb-2">
          <span className="text-white text-xs font-bold">T</span>
        </div>
        {['layout-kanban', 'calendar', 'chart-bar', 'bell', 'settings'].map((icon) => (
          <button key={icon} className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-600 hover:text-purple-400 hover:bg-purple-500/10 transition-colors">
            <i className={`ti ti-${icon} text-lg`} />
          </button>
        ))}
        <div className="mt-auto w-7 h-7 rounded-full bg-linear-to-br from-purple-600 to-violet-400 flex items-center justify-center text-[10px] font-bold text-white">
          TU
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        {/* Top header: greeting, search and status counters */}
        <div className="shrink-0 px-6 pt-5 pb-4 border-b border-border-main">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-semibold text-text-main">{t('greeting')}</h1>
              <p className="text-xs text-text-muted mt-0.5 tracking-wide">{t('subtitle')}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-bg-input border border-border-main rounded-lg px-3 py-1.5">
                <i className="ti ti-search text-text-muted text-sm" />
                <input
                  type="text"
                  placeholder={t('search')}
                  className="bg-transparent outline-none text-xs text-text-main placeholder:text-text-muted/50 w-24 focus:w-36 transition-all"
                />
              </div>
              <LanguageSwitcher />
              <ThemeSwitcher />
              <button className="bg-linear-to-r from-purple-700 to-purple-900 text-white text-xs font-semibold px-4 py-1.5 rounded-lg">
                ✦
              </button>
            </div>
          </div>
          <div className="flex gap-3">
            {STATUSES.map((s) => {
              const labelMap: Record<TaskStatus, string> = {
                inbox: t('inbox'),
                pending: t('pending'),
                in_progress: t('progress'),
                done: t('done'),
              };
              return (
                <div key={s} className="bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-1 flex items-center gap-2">
                  <span className="text-purple-300 font-semibold text-sm">{countByStatus(s)}</span>
                  <span className="text-[10px] text-purple-500/70">{labelMap[s]}</span>
                </div>
              );
            })}
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
            <div className="rounded-2xl overflow-hidden border border-border-main bg-bg-card" style={{ height: '220px', position: 'relative' }}>
              <SplineCard />
            </div>

            {/* Progreso */}
            <div className="bg-bg-card border border-border-main rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-3">{t('progress_title')}</p>
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
                  inbox: t('inbox'),
                  pending: t('pending'),
                  in_progress: t('progress'),
                  done: t('done'),
                };
                return (
                  <div key={s} className="mb-2">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-gray-500">{labels[s]}</span>
                      <span className="text-purple-400 font-semibold">{pct}%</span>
                    </div>
                    <div className="h-1 bg-bg-input rounded-full overflow-hidden">
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
            <div className="bg-bg-card border border-border-main rounded-xl p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-600 mb-2">{t('today')}</p>
              <p className="text-xs text-gray-500 capitalize">
                {new Date().toLocaleDateString(locale === 'es' ? 'es' : 'en', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <ClockDisplay />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}