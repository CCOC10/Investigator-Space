import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X, Users, Database, Shield, ShieldOff, Trash2,
  CheckCircle, XCircle, Clock, RefreshCw, ChevronDown, ChevronRight, Eye
} from 'lucide-react'
import {
  subscribeAllUsers, updateUserStatus, toggleAdmin,
  deleteUserData, getAllWorkspaces
} from '../../services/users'

const STATUS_STYLE = {
  approved: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  pending:  'bg-amber-50  dark:bg-amber-500/10  text-amber-600  dark:text-amber-400',
  rejected: 'bg-rose-50   dark:bg-rose-500/10   text-rose-500   dark:text-rose-400',
}
const STATUS_LABEL = { approved: 'อนุมัติแล้ว', pending: 'รอการอนุมัติ', rejected: 'ปฏิเสธ' }

export default function AdminDashboard({ adminUid, onClose }) {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [workspaces, setWorkspaces] = useState([])
  const [wsLoading, setWsLoading] = useState(false)
  const [filter, setFilter] = useState('all')
  const [expandedWs, setExpandedWs] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    const unsub = subscribeAllUsers(setUsers)
    return unsub
  }, [])

  const loadWorkspaces = async () => {
    setWsLoading(true)
    const ws = await getAllWorkspaces()
    setWorkspaces(ws)
    setWsLoading(false)
  }

  useEffect(() => {
    if (tab === 'data') loadWorkspaces()
  }, [tab])

  const handleApprove = (uid) => updateUserStatus(uid, 'approved', adminUid)
  const handleReject  = (uid) => updateUserStatus(uid, 'rejected', adminUid)
  const handlePending = (uid) => updateUserStatus(uid, 'pending',  adminUid)
  const handleToggleAdmin = (uid, current) => toggleAdmin(uid, !current)
  const handleDelete = async (uid) => {
    await deleteUserData(uid)
    setConfirmDelete(null)
  }

  const filtered = filter === 'all' ? users : users.filter(u => u.status === filter)
  const counts = {
    all:      users.length,
    pending:  users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  }

  const getUserEmail = (uid) => users.find(u => u.uid === uid)?.email || uid

  return createPortal(
    <div className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm flex items-stretch justify-end">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 flex flex-col shadow-2xl animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 dark:text-white text-base">แผงควบคุมผู้ดูแลระบบ</h2>
              <p className="text-xs text-slate-400">Firebase Admin Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 flex-shrink-0">
          {[
            { id: 'users', label: 'ผู้ใช้งาน', icon: <Users size={14} />, badge: counts.pending },
            { id: 'data',  label: 'ข้อมูลระบบ', icon: <Database size={14} /> },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold border-b-2 transition-colors ${
                tab === t.id
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span className="bg-amber-400 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{t.badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── USERS TAB ── */}
          {tab === 'users' && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: 'all',      label: 'ทั้งหมด',    color: 'from-slate-500 to-slate-600' },
                  { key: 'pending',  label: 'รออนุมัติ',   color: 'from-amber-400 to-orange-500' },
                  { key: 'approved', label: 'อนุมัติแล้ว', color: 'from-emerald-400 to-green-500' },
                  { key: 'rejected', label: 'ปฏิเสธ',      color: 'from-rose-400 to-red-500' },
                ].map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setFilter(s.key)}
                    className={`p-4 rounded-2xl text-left transition-all ${
                      filter === s.key
                        ? 'bg-gradient-to-br ' + s.color + ' text-white shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className={`text-2xl font-black ${filter === s.key ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                      {counts[s.key]}
                    </div>
                    <div className={`text-xs font-semibold mt-0.5 ${filter === s.key ? 'text-white/80' : 'text-slate-400'}`}>
                      {s.label}
                    </div>
                  </button>
                ))}
              </div>

              {/* User list */}
              <div className="space-y-2">
                {filtered.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-8">ไม่มีผู้ใช้งาน</p>
                )}
                {filtered.map((u) => (
                  <div key={u.uid} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                      {u.photoURL
                        ? <img src={u.photoURL} className="w-full h-full object-cover" />
                        : <span className="text-sm font-black text-white">{(u.displayName || u.email || '?').charAt(0).toUpperCase()}</span>
                      }
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                          {u.displayName || '(ไม่ระบุชื่อ)'}
                        </span>
                        {u.isAdmin && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                            ADMIN
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[u.status] || STATUS_STYLE.pending}`}>
                          {STATUS_LABEL[u.status] || u.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                      <p className="text-[10px] text-slate-300 dark:text-slate-600 mt-0.5">
                        สมัคร: {u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {u.status !== 'approved' && (
                        <ActionBtn onClick={() => handleApprove(u.uid)} color="emerald" title="อนุมัติ">
                          <CheckCircle size={13} />
                        </ActionBtn>
                      )}
                      {u.status === 'approved' && (
                        <ActionBtn onClick={() => handlePending(u.uid)} color="amber" title="ระงับ">
                          <Clock size={13} />
                        </ActionBtn>
                      )}
                      {u.status !== 'rejected' && (
                        <ActionBtn onClick={() => handleReject(u.uid)} color="rose" title="ปฏิเสธ">
                          <XCircle size={13} />
                        </ActionBtn>
                      )}
                      <ActionBtn
                        onClick={() => handleToggleAdmin(u.uid, u.isAdmin)}
                        color={u.isAdmin ? 'slate' : 'indigo'}
                        title={u.isAdmin ? 'ถอนสิทธิ์แอดมิน' : 'ให้สิทธิ์แอดมิน'}
                      >
                        {u.isAdmin ? <ShieldOff size={13} /> : <Shield size={13} />}
                      </ActionBtn>
                      {u.uid !== adminUid && (
                        <ActionBtn onClick={() => setConfirmDelete(u)} color="red" title="ลบข้อมูล">
                          <Trash2 size={13} />
                        </ActionBtn>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── DATA TAB ── */}
          {tab === 'data' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  Workspace ทั้งหมด ({workspaces.length})
                </h3>
                <button onClick={loadWorkspaces} disabled={wsLoading}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-600 transition">
                  <RefreshCw size={12} className={wsLoading ? 'animate-spin' : ''} /> รีเฟรช
                </button>
              </div>

              {wsLoading && (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                </div>
              )}

              <div className="space-y-2">
                {workspaces.map((ws) => {
                  const email = getUserEmail(ws.uid)
                  const caseCount = ws.cases?.length || 0
                  const targetCount = ws.cases?.reduce((s, c) => s + (c.targets?.length || 0), 0) || 0
                  const isExpanded = expandedWs === ws.uid

                  return (
                    <div key={ws.uid} className="rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800">
                        <button onClick={() => setExpandedWs(isExpanded ? null : ws.uid)}
                          className="text-slate-400 hover:text-slate-600 transition">
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ws.uid}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                          <span><b className="text-slate-700 dark:text-slate-300">{caseCount}</b> คดี</span>
                          <span><b className="text-slate-700 dark:text-slate-300">{targetCount}</b> เป้าหมาย</span>
                          <span className="hidden sm:block text-[10px] text-slate-300 dark:text-slate-600">
                            {ws.savedAt ? new Date(ws.savedAt).toLocaleDateString('th-TH') : '—'}
                          </span>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-2 bg-white dark:bg-slate-900/60">
                          {(ws.cases || []).length === 0 && (
                            <p className="text-xs text-slate-400 italic">ไม่มีคดี</p>
                          )}
                          {(ws.cases || []).map((c) => (
                            <div key={c.id} className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.title}</p>
                                <p className="text-[10px] text-slate-400">
                                  {c.targets?.length || 0} เป้าหมาย · {c.status}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 max-w-sm w-full">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4 mx-auto">
              <Trash2 size={22} className="text-rose-500" />
            </div>
            <h3 className="text-base font-black text-slate-800 dark:text-white text-center mb-2">ลบข้อมูลผู้ใช้</h3>
            <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
              ลบข้อมูลทั้งหมดของ <b>{confirmDelete.displayName || confirmDelete.email}</b> ออกจากระบบ (ผู้ใช้ยังล็อกอินได้ แต่ข้อมูลจะหายทั้งหมด)
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                ยกเลิก
              </button>
              <button onClick={() => handleDelete(confirmDelete.uid)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-sm font-bold text-white transition">
                ลบข้อมูล
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}

function ActionBtn({ onClick, color, title, children }) {
  const colors = {
    emerald: 'hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400',
    amber:   'hover:bg-amber-50  dark:hover:bg-amber-500/10  hover:text-amber-600  dark:hover:text-amber-400',
    rose:    'hover:bg-rose-50   dark:hover:bg-rose-500/10   hover:text-rose-500   dark:hover:text-rose-400',
    indigo:  'hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400',
    slate:   'hover:bg-slate-100 dark:hover:bg-slate-700     hover:text-slate-600  dark:hover:text-slate-300',
    red:     'hover:bg-rose-50   dark:hover:bg-rose-500/10   hover:text-rose-600   dark:hover:text-rose-400',
  }
  return (
    <button onClick={onClick} title={title}
      className={`p-2 rounded-lg text-slate-300 dark:text-slate-600 transition-colors ${colors[color] || ''}`}>
      {children}
    </button>
  )
}
