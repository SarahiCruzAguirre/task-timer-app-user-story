"use client";
// Root page that lazy-loads the dashboard client component (no SSR).
import dynamic from 'next/dynamic';

const TodoDashboard = dynamic(() => import('@/components/TodoDashboard'), { ssr: false });

export default function Home() {
  return <TodoDashboard />;
}
