import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' }

export default function Modal({ title, children, footer, onClose, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/75 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className={`
        relative w-full ${SIZES[size]}
        bg-white dark:bg-slate-900
        rounded-[2rem] shadow-2xl
        border border-slate-100 dark:border-slate-800
        flex flex-col
        max-h-[88vh]
        animate-slide-up
      `}>
        {/* Header — sticky */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={17} strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-8">{children}</div>

        {/* Footer — sticky */}
        {footer && (
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 flex-shrink-0 bg-slate-50/60 dark:bg-slate-900/80 rounded-b-[2rem]">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
