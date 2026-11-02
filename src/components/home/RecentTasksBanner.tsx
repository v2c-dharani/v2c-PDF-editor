'use client';

import React, { useEffect, useState } from 'react';
import { History, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { formatBytes } from '@/lib/format-utils';

interface TaskRecord {
  id: string;
  tool_id: string;
  tool_name: string;
  file_name: string;
  file_size: number;
  status: string;
  created_at: string;
}

export function RecentTasksBanner() {
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch('/api/tasks/log');
        const data = await res.json();
        if (data && data.tasks) {
          setTasks(data.tasks);
        }
      } catch (err) {
        // Non-blocking
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const handleClearHistory = async () => {
    try {
      await fetch('/api/tasks/log', { method: 'DELETE' });
      setTasks([]);
    } catch {}
  };

  if (loading || tasks.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-slate-50/60 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Activity
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Ephemeral &bull; Auto-purged after 5 min
            </span>
            <button
              onClick={handleClearHistory}
              title="Clear activity log"
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 truncate max-w-[140px]">
                    {task.file_name}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {task.tool_name} &bull; {formatBytes(task.file_size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3 h-3" />
                <span>Done</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
