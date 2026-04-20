export const COLOR_OPTIONS = [
  { key: 'amber',   dot: '#f59e0b', pill: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700/40' },
  { key: 'rose',    dot: '#f43f5e', pill: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-700/40' },
  { key: 'emerald', dot: '#10b981', pill: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700/40' },
  { key: 'sky',     dot: '#0ea5e9', pill: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-200 dark:border-sky-700/40' },
  { key: 'indigo',  dot: '#6366f1', pill: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700/40' },
  { key: 'violet',  dot: '#8b5cf6', pill: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-700/40' },
  { key: 'pink',    dot: '#ec4899', pill: 'bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-700/40' },
  { key: 'slate',   dot: '#64748b', pill: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700' },
]

export const DEFAULT_COLOR = 'amber'

export const getPillStyle = (colorKey) =>
  (COLOR_OPTIONS.find((c) => c.key === colorKey) ?? COLOR_OPTIONS[0]).pill

export const getDotColor = (colorKey) =>
  (COLOR_OPTIONS.find((c) => c.key === colorKey) ?? COLOR_OPTIONS[0]).dot
