import { useState } from 'react'
import {
  updateProfile, updatePassword, reauthenticateWithCredential,
  EmailAuthProvider, signOut
} from 'firebase/auth'
import { auth } from '../firebase'
import Modal from './modals/Modal'
import { User, Lock, LogOut, Camera, Check, AlertCircle } from 'lucide-react'

export default function ProfileModal({ user, onClose }) {
  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com')

  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [photoURL, setPhotoURL] = useState(user.photoURL || '')
  const [nameMsg, setNameMsg] = useState(null) // { type: 'ok'|'err', text }

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState(null)
  const [pwLoading, setPwLoading] = useState(false)

  const saveName = async () => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || null,
        photoURL: photoURL.trim() || null,
      })
      setNameMsg({ type: 'ok', text: 'บันทึกโปรไฟล์แล้ว' })
      setTimeout(() => setNameMsg(null), 2500)
    } catch {
      setNameMsg({ type: 'err', text: 'ไม่สามารถบันทึกได้' })
    }
  }

  const changePassword = async () => {
    if (newPw !== confirmPw) { setPwMsg({ type: 'err', text: 'รหัสผ่านใหม่ไม่ตรงกัน' }); return }
    if (newPw.length < 6)    { setPwMsg({ type: 'err', text: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' }); return }
    setPwLoading(true)
    setPwMsg(null)
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, newPw)
      setPwMsg({ type: 'ok', text: 'เปลี่ยนรหัสผ่านสำเร็จ' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
    } catch (err) {
      const msg = {
        'auth/wrong-password':      'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        'auth/invalid-credential':  'รหัสผ่านปัจจุบันไม่ถูกต้อง',
        'auth/too-many-requests':   'พยายามหลายครั้งเกินไป กรุณารอสักครู่',
      }[err.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      setPwMsg({ type: 'err', text: msg })
    } finally {
      setPwLoading(false)
    }
  }

  const avatar = user.photoURL
    ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
    : <span className="text-3xl font-black text-white select-none">
        {(user.displayName || user.email || '?').charAt(0).toUpperCase()}
      </span>

  return (
    <Modal title="โปรไฟล์ของฉัน" onClose={onClose} size="md">
      <div className="space-y-8 py-1">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            {avatar}
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {user.displayName || '(ยังไม่ตั้งชื่อ)'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{user.email}</p>
            {isGoogle && (
              <span className="inline-block mt-1.5 text-[10px] font-semibold text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full">
                Google Account
              </span>
            )}
          </div>
        </div>

        {/* Profile info */}
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <User size={12} /> ข้อมูลโปรไฟล์
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">ชื่อที่แสดง</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="ชื่อ-นามสกุล หรือตำแหน่ง"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Camera size={11} /> URL รูปโปรไฟล์ (ไม่บังคับ)
            </label>
            <input
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
            />
          </div>

          {nameMsg && <Msg msg={nameMsg} />}

          <button
            onClick={saveName}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
          >
            <Check size={13} /> บันทึกโปรไฟล์
          </button>
        </section>

        {/* Change password — only for email/password accounts */}
        {!isGoogle && (
          <section className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <Lock size={12} /> เปลี่ยนรหัสผ่าน
            </h3>

            <Field label="รหัสผ่านปัจจุบัน" value={currentPw} onChange={setCurrentPw} />
            <Field label="รหัสผ่านใหม่" value={newPw} onChange={setNewPw} />
            <Field label="ยืนยันรหัสผ่านใหม่" value={confirmPw} onChange={setConfirmPw} />

            {pwMsg && <Msg msg={pwMsg} />}

            <button
              onClick={changePassword}
              disabled={pwLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all disabled:opacity-60"
            >
              <Lock size={13} /> {pwLoading ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
            </button>
          </section>
        )}

        {/* Sign out */}
        <section className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => signOut(auth)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-bold transition-all"
          >
            <LogOut size={13} /> ออกจากระบบ
          </button>
        </section>
      </div>
    </Modal>
  )
}

function Field({ label, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
      />
    </div>
  )
}

function Msg({ msg }) {
  return (
    <p className={`text-xs font-semibold flex items-center gap-1.5 rounded-xl px-3 py-2 ${
      msg.type === 'ok'
        ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10'
        : 'text-rose-500 bg-rose-50 dark:bg-rose-500/10'
    }`}>
      {msg.type === 'ok' ? <Check size={12} /> : <AlertCircle size={12} />}
      {msg.text}
    </p>
  )
}
