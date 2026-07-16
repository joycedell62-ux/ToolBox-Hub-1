import React, { useState, useEffect, useRef } from 'react';
import { Bell, X } from 'lucide-react';

const NOTIFICATIONS = [
  {
    id: 'n3',
    icon: '🚀',
    title: '122+ tools now live!',
    body: 'New writing, design, and marketing tools just launched. Explore the latest additions.',
    date: 'Today',
    href: '/?q=new',
  },
  {
    id: 'n2',
    icon: '🏆',
    title: '500K+ tool runs milestone',
    body: 'Toolbox Hub crossed 500,000 tool uses. Thank you for being part of the community!',
    date: '3 days ago',
    href: null,
  },
  {
    id: 'n1',
    icon: '💡',
    title: 'Tip: Keyboard shortcuts',
    body: 'Press / or ⌘K from anywhere to instantly search all 122+ tools.',
    date: '1 week ago',
    href: null,
  },
];

const READ_KEY = 'tbh_notif_read';

function getRead(): string[] {
  try { return JSON.parse(localStorage.getItem(READ_KEY) || '[]'); } catch { return []; }
}
function setRead(ids: string[]) {
  try { localStorage.setItem(READ_KEY, JSON.stringify(ids)); } catch {}
}

export default function NotificationBell() {
  const [open, setOpen]   = useState(false);
  const [read, setReadState] = useState<string[]>(getRead);
  const ref = useRef<HTMLDivElement>(null);

  const unread = NOTIFICATIONS.filter(n => !read.includes(n.id)).length;

  const markAllRead = () => {
    const all = NOTIFICATIONS.map(n => n.id);
    setRead(all);
    setReadState(all);
  };

  const openPanel = () => {
    setOpen(o => !o);
    if (!open) {
      // mark all as read when panel opens
      setTimeout(markAllRead, 1500);
    }
  };

  /* close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={openPanel}
        aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ''}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center leading-none">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-600" />
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Notifications</span>
              {unread > 0 && (
                <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* List */}
          <div className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {NOTIFICATIONS.map(n => {
              const isUnread = !read.includes(n.id);
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 px-4 py-3.5 transition-colors ${isUnread ? 'bg-blue-50/50 dark:bg-blue-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}
                >
                  <span className="text-xl leading-none flex-shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                      {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{n.date}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
            <button
              onClick={markAllRead}
              className="text-xs text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
