import { signOut } from 'firebase/auth'
import { auth } from '../firebase'
import { ShieldCheck, Clock, LogOut, XCircle } from 'lucide-react'

export default function PendingScreen({ userProfile }) {
  const isRejected = userProfile?.status === 'rejected'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center mb-6">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg ${
            isRejected
              ? 'bg-gradient-to-br from-rose-400 to-red-500 shadow-rose-500/30'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/30'
          }`}>
            {isRejected ? <XCircle size={30} className="text-white" /> : <Clock size={30} className="text-white" />}
          </div>
        </div>

        <h1 className="text-xl font-black text-slate-800 dark:text-white mb-2">
          {isRejected ? 'ไม่ได้รับอนุมัติ' : 'รอการอนุมัติ'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-2">
          {isRejected
            ? 'บัญชีของคุณถูกปฏิเสธจากผู้ดูแลระบบ กรุณาติดต่อผู้ดูแลระบบเพื่อสอบถามเพิ่มเติม'
            : 'บัญชีของคุณอยู่ระหว่างการตรวจสอบ กรุณารอผู้ดูแลระบบอนุมัติก่อนเข้าใช้งาน'
          }
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
          {userProfile?.email}
        </p>

        <button
          onClick={() => signOut(auth)}
          className="flex items-center gap-2 mx-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:border-rose-200 dark:hover:border-rose-800 text-sm font-semibold transition-all"
        >
          <LogOut size={14} /> ออกจากระบบ
        </button>
      </div>
    </div>
  )
}
