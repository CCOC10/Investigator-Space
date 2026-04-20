import { FolderOpen, Plus } from 'lucide-react'

export default function EmptyState({ message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-5">
        <FolderOpen size={34} className="text-slate-300 dark:text-slate-600" />
      </div>
      <p className="text-slate-400 dark:text-slate-500 font-medium text-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition-all hover:-translate-y-0.5 text-sm"
        >
          <Plus size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  )
}
