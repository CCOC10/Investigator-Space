import { useState, useMemo } from 'react'
import {
  Shield, FolderOpen, Search, Plus, Filter, X, Edit3, Trash2,
  ChevronDown, FileDown, Loader2
} from 'lucide-react'
import { useStore } from '../store'
import { getCaseStats, isPositiveStatus } from '../utils/helpers'
import { exportCaseToExcel } from '../utils/exportExcel'
import TargetCard from './TargetCard'
import ThemeToggle from './ThemeToggle'
import CaseModal from './modals/CaseModal'
import TargetModal from './modals/TargetModal'
import ConfirmDialog from './modals/ConfirmDialog'
import EmptyState from './EmptyState'

export default function CaseView() {
  const cases = useStore((s) => s.cases)
  const activeCaseId = useStore((s) => s.activeCaseId)
  const setActiveCase = useStore((s) => s.setActiveCase)
  const deleteCase = useStore((s) => s.deleteCase)

  const activeCase = useMemo(
    () => cases.find((c) => c.id === activeCaseId) || cases[0],
    [cases, activeCaseId]
  )

  const [search, setSearch] = useState('')
  const [showCaseModal, setShowCaseModal] = useState(false)
  const [showAddCase, setShowAddCase] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)
  const [confirmDeleteCase, setConfirmDeleteCase] = useState(null)
  const [showCaseDropdown, setShowCaseDropdown] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportPct, setExportPct] = useState(0)

  const handleExport = async () => {
    if (!activeCase || exporting) return
    setExporting(true)
    setExportPct(0)
    try {
      await exportCaseToExcel(activeCase, setExportPct)
    } catch (e) {
      console.error('Export failed:', e)
      alert('ส่งออกไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setExporting(false)
      setExportPct(0)
    }
  }

  const stats = activeCase ? getCaseStats(activeCase) : { total: 0, captured: 0 }

  const filtered = activeCase
    ? activeCase.targets.filter((t) => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
          t.name.includes(search) ||
          t.citizenId.includes(search) ||
          t.code.toLowerCase().includes(q) ||
          t.role.includes(search) ||
          (t.status || '').toLowerCase().includes(q)
        )
      })
    : []

  return (
    <>
      {/* Main Card */}
      <div className="max-w-[1400px] mx-auto min-h-[85vh] rounded-[2rem] md:rounded-[2.5rem]
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border border-white/60 dark:border-slate-800
        shadow-[0_8px_40px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_40px_rgb(0,0,0,0.4)]
        overflow-hidden flex flex-col"
      >
        {/* ── HEADER ── */}
        <header className="px-8 pt-8 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Shield size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
                Investigator Space
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                ระบบสรุปวิเคราะห์ข้อมูลคดีและพยานหลักฐาน
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <hr className="border-slate-100 dark:border-slate-800/50 mx-8" />

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 p-8 overflow-y-auto">

          {/* Case selector (multi-case) */}
          {cases.length > 0 && (
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              {/* Current case badge / dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCaseDropdown((v) => !v)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                >
                  <FolderOpen size={15} />
                  {cases.length === 1 ? 'คดีปัจจุบัน' : (activeCase?.title || 'เลือกคดี')}
                  {cases.length > 1 && <ChevronDown size={14} className={`transition-transform ${showCaseDropdown ? 'rotate-180' : ''}`} />}
                </button>

                {showCaseDropdown && cases.length > 1 && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCaseDropdown(false)} />
                    <div className="absolute top-full left-0 mt-2 z-20 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-slide-up">
                      {cases.map((c) => (
                        <div
                          key={c.id}
                          className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
                            c.id === activeCaseId
                              ? 'bg-indigo-50 dark:bg-indigo-500/10'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                          onClick={() => { setActiveCase(c.id); setShowCaseDropdown(false) }}
                        >
                          <FolderOpen size={15} className={c.id === activeCaseId ? 'text-indigo-500' : 'text-slate-400'} />
                          <span className={`flex-1 text-sm font-semibold truncate ${
                            c.id === activeCaseId ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'
                          }`}>{c.title}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmDeleteCase(c.id) }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-rose-500 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Add new case */}
              <button
                onClick={() => setShowAddCase(true)}
                title="เพิ่มคดีใหม่"
                className="w-8 h-8 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          )}

          {!activeCase ? (
            <EmptyState
              message="ยังไม่มีคดี"
              actionLabel="สร้างคดีแรก"
              onAction={() => setShowAddCase(true)}
            />
          ) : (
            <>
              {/* Case Title + Stats */}
              <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-10">
                <div className="flex-1 min-w-0">
                  <div className="relative group/title inline-block w-full mb-3">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">
                      {activeCase.title}
                    </h2>
                    <button
                      onClick={() => setShowCaseModal(true)}
                      className="absolute -top-1 -right-1 p-2 rounded-xl opacity-0 group-hover/title:opacity-100 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-all"
                      title="แก้ไขข้อมูลคดี"
                    >
                      <Edit3 size={16} />
                    </button>
                  </div>
                  {activeCase.summary && (
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {activeCase.summary}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 flex-shrink-0">
                  <StatBox label="เป้าหมายทั้งหมด" value={stats.total} type="primary" />
                  <StatBox label="จับกุมแล้ว" value={stats.captured} type="success" />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="ค้นหาชื่อ, เลขประชาชน หรือรหัส..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-14 pr-10 py-4 bg-slate-50 dark:bg-slate-800/50 border-0 text-slate-800 dark:text-slate-200 placeholder-slate-400 rounded-2xl ring-1 ring-inset ring-slate-200/60 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-all shadow-sm font-medium outline-none"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600">
                      <X size={16} />
                    </button>
                  )}
                </div>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-2xl transition-all">
                  <Filter size={18} />
                  กรองข้อมูล
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  title="ส่งออก Excel"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
                >
                  {exporting
                    ? <><Loader2 size={18} className="animate-spin" />{exportPct > 0 ? `${exportPct}%` : '...'}</>
                    : <><FileDown size={18} />Excel</>
                  }
                </button>
                <button
                  onClick={() => setShowTargetModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all hover:-translate-y-0.5"
                >
                  <Plus size={20} />
                  เพิ่มเป้าหมาย
                </button>
              </div>

              {/* Target cards */}
              {filtered.length === 0 ? (
                <EmptyState
                  message={search ? `ไม่พบ "${search}"` : 'ยังไม่มีบุคคลเป้าหมายในคดีนี้'}
                  actionLabel={!search ? 'เพิ่มเป้าหมายแรก' : undefined}
                  onAction={!search ? () => setShowTargetModal(true) : undefined}
                />
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {filtered.map((t) => (
                    <TargetCard key={t.id} target={t} caseId={activeCase.id} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Footer */}
          <div className="mt-12 text-center text-slate-400 dark:text-slate-500 text-sm">
            <p>Investigator Space © 2026 · Designed with Soft UI Principles.</p>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showCaseModal && activeCase && (
        <CaseModal caseData={activeCase} onClose={() => setShowCaseModal(false)} />
      )}
      {showAddCase && (
        <CaseModal onClose={() => setShowAddCase(false)} />
      )}
      {showTargetModal && activeCase && (
        <TargetModal caseId={activeCase.id} onClose={() => setShowTargetModal(false)} />
      )}
      {confirmDeleteCase && (
        <ConfirmDialog
          title="ลบคดี"
          message="คุณต้องการลบคดีนี้ทั้งหมด รวมถึงข้อมูลเป้าหมายและพยานหลักฐาน? การดำเนินการนี้ไม่สามารถยกเลิกได้"
          onConfirm={() => { deleteCase(confirmDeleteCase); setConfirmDeleteCase(null) }}
          onCancel={() => setConfirmDeleteCase(null)}
        />
      )}
    </>
  )
}

function StatBox({ label, value, type }) {
  const styles = {
    primary: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400',
    success: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  }
  return (
    <div className={`px-6 py-4 rounded-2xl flex flex-col justify-center items-center min-w-[130px] ${styles[type]}`}>
      <span className="text-4xl font-black mb-1 tabular-nums">{value}</span>
      <span className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</span>
    </div>
  )
}
