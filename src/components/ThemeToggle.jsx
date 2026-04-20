import { Sun, Moon } from 'lucide-react'
import { useStore } from '../store'

export default function ThemeToggle() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const isDark = theme === 'dark'

  const toggle = () => setTheme(isDark ? 'light' : 'dark')

  return (
    <div className="flex items-center gap-3 bg-white/50 dark:bg-slate-800/50 py-2.5 px-4 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-sm backdrop-blur-md transition-all">
      <Sun
        size={18}
        className={`transition-colors duration-300 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`}
      />
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className={`relative w-12 h-6 rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 ${
          isDark ? 'bg-indigo-500 shadow-inner shadow-indigo-900/20' : 'bg-slate-200 shadow-inner shadow-slate-400/20'
        }`}
      >
        <div
          className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-[0_2px_4px_rgb(0,0,0,0.2)] transform transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDark ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      <Moon
        size={18}
        className={`transition-colors duration-300 ${isDark ? 'text-indigo-400' : 'text-slate-400'}`}
      />
    </div>
  )
}
