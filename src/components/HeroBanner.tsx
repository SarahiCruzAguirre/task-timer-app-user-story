import { SparklesIcon, BoltIcon, RectangleStackIcon } from '@heroicons/react/24/solid';
import type { Task } from '@/types/task';

interface Props {
  tasks: Task[];
}

import { useTranslation } from '@/hooks/useTranslation';

// Small banner showing summary statistics about current tasks.
export default function HeroBanner({ tasks }: Props) {
  const { t } = useTranslation();

  // Define stats dynamically inside the component to access the t() function
  const stats = [
    { label: t('total'), icon: RectangleStackIcon, key: 'total' },
    { label: t('done'), icon: SparklesIcon, key: 'done' },
    { label: t('progress'), icon: BoltIcon, key: 'in_progress' },
  ];

  const count = {
    total: tasks.length,
    done: tasks.filter((task) => task.status === 'done').length,
    in_progress: tasks.filter((task) => task.status === 'in_progress').length,
  };

  return (
    // Decorative hero section with app info and three stat tiles
    <section className="rounded-4xl border border-purple-500/10 dark:border-white/5 bg-linear-to-br from-violet-100 via-purple-50 to-fuchsia-100 dark:from-[#130b2e] dark:via-[#0e0820] dark:to-[#090710] p-6 shadow-[0_20px_80px_-40px_rgba(139,92,246,0.3)] dark:shadow-[0_20px_120px_-80px_rgba(125,70,255,0.7)] mb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-purple-700/80 dark:text-purple-400/80">TaskOS</p>
          <h2 className="text-3xl md:text-4xl font-semibold text-indigo-950 dark:text-white">{t('board_title')}</h2>
          <p className="max-w-xl text-sm text-slate-600 dark:text-gray-400">{t('board_subtitle')}</p>
        </div>
        <div className="rounded-3xl bg-white/60 dark:bg-white/5 border border-purple-500/15 dark:border-white/10 p-4 grid grid-cols-3 gap-3 min-w-[280px]">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.key} className="flex flex-col gap-2 rounded-3xl bg-white dark:bg-[#0a0815]/90 border border-purple-500/10 dark:border-transparent p-3">
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300">
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] uppercase tracking-[0.3em] text-gray-500">{item.label}</span>
                </div>
                <p className="text-2xl font-semibold text-indigo-950 dark:text-white">{count[item.key as keyof typeof count]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
