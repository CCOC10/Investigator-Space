import { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../firebase'
import { createUserProfile } from '../services/users'
import { ShieldCheck, Eye, EyeOff, Lock, Mail, User } from 'lucide-react'

const googleProvider = new GoogleAuthProvider()

export default function RegisterScreen({ onBack }) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPw) { setError('รหัสผ่านไม่ตรงกัน'); return }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setError(''); setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: displayName.trim() || email.split('@')[0] })
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: displayName.trim() || email.split('@')[0],
      })
      // Auth state listener in App.jsx will pick up the new user
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'อีเมลนี้มีบัญชีอยู่แล้ว',
        'auth/invalid-email':        'รูปแบบอีเมลไม่ถูกต้อง',
        'auth/weak-password':        'รหัสผ่านไม่ปลอดภัยพอ',
      }[err.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      setError(msg); setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true)
    try {
      const { user } = await signInWithPopup(auth, googleProvider)
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') setError('ไม่สามารถสมัครด้วย Google ได้')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
            <ShieldCheck size={30} className="text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">สมัครใช้งาน</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">รอผู้ดูแลระบบอนุมัติก่อนเข้าใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl p-8 space-y-4">
          {/* Display name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ชื่อ-นามสกุล / ยศ</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                placeholder="พ.ต.ต. ชื่อ นามสกุล" required autoFocus
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">อีเมล</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@example.com" required
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">รหัสผ่าน</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="อย่างน้อย 6 ตัวอักษร" required
                className="w-full pl-9 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">ยืนยันรหัสผ่าน</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••" required
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs font-semibold text-rose-500 bg-rose-50 dark:bg-rose-500/10 rounded-xl px-4 py-2.5">{error}</p>
          )}

          <button type="submit" disabled={loading || googleLoading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold shadow-md shadow-indigo-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'กำลังสมัคร...' : 'สมัครใช้งาน'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 font-medium">หรือ</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          <button type="button" onClick={handleGoogle} disabled={loading || googleLoading}
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 text-sm font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-60">
            {googleLoading ? <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-indigo-500 animate-spin" /> : <GoogleIcon />}
            สมัครด้วย Google
          </button>
        </form>

        <button onClick={onBack}
          className="mt-4 w-full text-center text-sm text-slate-400 hover:text-indigo-500 transition font-medium">
          ← กลับไปเข้าสู่ระบบ
        </button>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
      <path d="M47.532 24.552c0-1.636-.132-3.2-.396-4.704H24.48v8.928h13.008c-.564 3.012-2.256 5.568-4.8 7.284v6.048h7.764c4.548-4.188 7.08-10.356 7.08-17.556z" fill="#4285F4"/>
      <path d="M24.48 48c6.516 0 11.988-2.16 15.984-5.868l-7.764-6.048c-2.16 1.44-4.92 2.304-8.22 2.304-6.312 0-11.664-4.26-13.572-9.996H2.88v6.24C6.864 42.948 15.12 48 24.48 48z" fill="#34A853"/>
      <path d="M10.908 28.392A14.43 14.43 0 0 1 10.02 24c0-1.524.264-3 .888-4.392v-6.24H2.88A23.962 23.962 0 0 0 .48 24c0 3.864.924 7.524 2.4 10.632l8.028-6.24z" fill="#FBBC05"/>
      <path d="M24.48 9.612c3.564 0 6.756 1.224 9.276 3.624l6.948-6.948C36.456 2.412 30.996 0 24.48 0 15.12 0 6.864 5.052 2.88 13.368l8.028 6.24c1.908-5.736 7.26-9.996 13.572-9.996z" fill="#EA4335"/>
    </svg>
  )
}
