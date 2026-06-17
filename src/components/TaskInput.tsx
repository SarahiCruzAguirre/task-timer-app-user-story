"use client";
// Simple input component for creating a new task.
// Calls `onCreate` with the entered title when submitted.
import { useState, KeyboardEvent } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  onCreate: (title: string) => void;
}

export default function TaskInput({ onCreate }: Props) {
  const [value, setValue] = useState('');
  const { t } = useTranslation();

  const handleCreate = () => {
    onCreate(value);
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreate();
  };

  return (
    // Input row with search icon, text input and add button
    <div className="flex items-center gap-3 bg-bg-card border border-border-main rounded-xl px-4 py-3 backdrop-blur-sm">
      <MagnifyingGlassIcon className="w-4 h-4 text-text-muted/60 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder={t('new_task')}
        className="flex-1 bg-transparent outline-none text-text-main text-sm placeholder:text-text-muted/40 font-medium"
      />
      <button
        onClick={handleCreate}
        className="flex items-center gap-1.5 bg-purple-700/10 hover:bg-purple-700/20 dark:bg-purple-700/30 dark:hover:bg-purple-700/50 border border-purple-500/20 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <PlusIcon className="w-3.5 h-3.5" />
        {t('add')}
      </button>
    </div>
  );
}