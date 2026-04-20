import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ContextMenu({ x, y, items, onClose }) {
  const menuRef = useRef(null)

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose()
    }
    const closeKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', closeKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', closeKey)
    }
  }, [onClose])

  // Clamp so menu doesn't overflow viewport
  const menuW = 160
  const menuH = items.length * 36 + 8
  const left = Math.min(x, window.innerWidth - menuW - 8)
  const top  = Math.min(y, window.innerHeight - menuH - 8)

  return createPortal(
    <ul
      ref={menuRef}
      style={{ left, top, minWidth: menuW }}
      className="fixed z-[9999] py-1 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 animate-fade-in"
    >
      {items.map((item) => (
        <li key={item.label}>
          <button
            onMouseDown={(e) => { e.preventDefault(); item.action(); onClose() }}
            className={`w-full text-left px-4 py-2 text-xs font-semibold rounded-xl transition-colors mx-0.5 ${
              item.danger
                ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <span className="flex items-center gap-2">
              {item.icon && <span className="opacity-60">{item.icon}</span>}
              {item.label}
            </span>
          </button>
        </li>
      ))}
    </ul>,
    document.body
  )
}
