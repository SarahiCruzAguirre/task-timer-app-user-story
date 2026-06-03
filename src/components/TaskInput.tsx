"use client";
// Simple input component for creating a new task.
// Calls `onCreate` with the entered title when submitted.
import { useState, KeyboardEvent } from 'react';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Props {
  onCreate: (title: string) => void;
}

export default function TaskInput({ onCreate }: Props) {
  const [value, setValue] = useState('');

  const handleCreate = () => {
    onCreate(value);
    setValue('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCreate();
  };

  return (
    // Input row with search icon, text input and add button
    <div className="flex items-center gap-3 bg-[#0f0c1f]/90 border border-purple-500/20 rounded-xl px-4 py-3 backdrop-blur-sm">
      <MagnifyingGlassIcon className="w-4 h-4 text-gray-600 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Nueva tarea... escribe y presiona Enter"
        className="flex-1 bg-transparent outline-none text-slate-200 text-sm placeholder:text-gray-600 font-medium"
      />
      <button
        onClick={handleCreate}
        className="flex items-center gap-1.5 bg-purple-700/30 hover:bg-purple-700/50 border border-purple-500/30 text-purple-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
      >
        <PlusIcon className="w-3.5 h-3.5" />
        Agregar
      </button>
    </div>
  );
}