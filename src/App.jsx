import { useEffect, useRef, useState, useCallback } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useStore, applyTheme } from './store'
import { loadWorkspace, saveWorkspace, subscribeWorkspace } from './services/db'
import { getUserProfile, createUserProfile, subscribeUserProfile } from './services/users'
import CaseView from './components/CaseView'
import LoginScreen from './components/LoginScreen'
import PendingScreen from './components/PendingScreen'
import ProfileModal from './components/ProfileModal'
import AdminDashboard from './components/admin/AdminDashboard'
import { Shield } from 'lucide-react'

export default function App() {
  const theme = useStore((s) => s.theme)
  const undo  = useStore((s) => s.undo)
  const redo  = useStore((s) => s.redo)
  const fromFirestore = useRef(false)

  const [user, setUser]               = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)
  const [showProfile, setShowProfile]   = useState(false)
  const [showAdmin, setShowAdmin]       = useState(false)

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (!u) { setUserProfile(null); setAuthChecking(false); return }

      // Load or create user profile in Firestore
      let profile = await getUserProfile(u.uid)
      if (!profile) {
        await createUserProfile(u.uid, {
          email: u.email,
          displayName: u.displayName || '',
          photoURL: u.photoURL || '',
        })
        profile = await getUserProfile(u.uid)
      }
      setUserProfile(profile)
      setAuthChecking(false)
    })
    return unsub
  }, [])

  // Real-time profile updates (approval status changes)
  useEffect(() => {
    if (!user) return
    const unsub = subscribeUserProfile(user.uid, (profile) => {
      if (profile) setUserProfile(profile)
    })
    return unsub
  }, [user])

  // Undo / Redo keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      // Don't hijack shortcuts while typing in an input / textarea
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  // Apply theme
  useEffect(() => {
    applyTheme(theme)
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => { if (theme === 'system') applyTheme('system') }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [theme])

  // Firebase data sync — only for approved users
  useEffect(() => {
    if (!user || userProfile?.status !== 'approved') return
    let saveTimer = null

    loadWorkspace(user.uid).then((data) => {
      if (data?.cases?.length > 0) {
        fromFirestore.current = true
        useStore.setState({ cases: data.cases })
        fromFirestore.current = false
      } else {
        saveWorkspace(user.uid, useStore.getState().cases)
      }
    }).catch(console.error)

    const unsubFirestore = subscribeWorkspace(user.uid, (data) => {
      if (!data?.cases) return
      fromFirestore.current = true
      useStore.setState({ cases: data.cases })
      fromFirestore.current = false
    })

    const unsubStore = useStore.subscribe((state, prev) => {
      if (state.cases === prev.cases) return
      if (fromFirestore.current) return
      clearTimeout(saveTimer)
      saveTimer = setTimeout(() => saveWorkspace(user.uid, state.cases), 800)
    })

    return () => { unsubFirestore(); unsubStore(); clearTimeout(saveTimer) }
  }, [user, userProfile?.status])

  // ── Loading ──
  if (authChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    )
  }

  // ── Not logged in ──
  if (!user) return <LoginScreen />

  // ── Pending / Rejected ──
  if (!userProfile || userProfile.status === 'pending' || userProfile.status === 'rejected') {
    return <PendingScreen userProfile={userProfile} />
  }

  // ── Approved: Main app ──
  const initial = (user.displayName || user.email || '?').charAt(0).toUpperCase()
  const isAdmin = user.email === 'commtk22732@gmail.com'

  return (
    <div className={`min-h-screen p-4 md:p-8 lg:p-10 transition-colors duration-500 ease-in-out
      bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50
      dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950`}
    >
      {/* Top-right buttons */}
      <div className="fixed top-5 right-5 z-50 flex items-center gap-2">
        {isAdmin && (
          <button
            onClick={() => setShowAdmin(true)}
            title="แผงควบคุมแอดมิน"
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/30 hover:scale-105 transition-transform"
          >
            <Shield size={13} /> Admin
          </button>
        )}
        <button
          onClick={() => setShowProfile(true)}
          title="โปรไฟล์"
          className="w-10 h-10 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md hover:scale-105 transition-transform ring-2 ring-white dark:ring-slate-900"
        >
          {user.photoURL
            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            : <span className="text-sm font-black text-white select-none">{initial}</span>
          }
        </button>
      </div>

      <CaseView />

      {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
      {showAdmin   && <AdminDashboard adminUid={user.uid} onClose={() => setShowAdmin(false)} />}
    </div>
  )
}
