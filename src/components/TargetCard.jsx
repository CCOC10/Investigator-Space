import { useState } from 'react'
import { UserCheck, AlertCircle, CheckCircle2, Edit3, Trash2, FileText, Fingerprint } from 'lucide-react'
import { useStore } from '../store'
import { getEvidenceProgress, isPositiveStatus } from '../utils/helpers'
import { getPillStyle, getDotColor, DEFAULT_COLOR } from '../utils/statusColors'
import EvidenceSection from './EvidenceSection'
import TargetModal from './modals/TargetModal'
import ConfirmDialog from './modals/ConfirmDialog'
import ContextMenu from './ContextMenu'

const PRIORITY = {
  High:   { bg: 'from-rose-400 to-red-500',     shadow: 'shadow-rose-500/30' },
  Medium: { bg: 'from-amber-400 to-orange-500',  shadow: 'shadow-amber-500/30' },
  Low:    { bg: 'from-slate-400 to-slate-500',   shadow: 'shadow-slate-400/30' },
}

export default function TargetCard({ target, caseId }) {
  const deleteTarget = useStore((s) => s.deleteTarget)

  const [showEdit, setShowEdit] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [menu, setMenu] = useState(null) // { x, y }

  const pc = PRIORITY[target.priority] || PRIORITY.Medium
  const progress = getEvidenceProgress(target)
  const isCapture = isPositiveStatus(target.status)

  const statusColors = useStore((s) => s.statusColors)
  const colorKey = statusColors[target.status] || (isCapture ? 'emerald' : 'amber')

  const handleContextMenu = (e) => {
    // Don't hijack right-click inside evidence sections (inputs, checkboxes)
    if (e.target.closest('[data-evidence]')) return
    e.preventDefault()
    setMenu({ x: e.clientX, y: e.clientY })
  }

  return (
    <>
      <div
        onContextMenu={handleContextMenu}
        className="group relative flex flex-col lg:flex-row gap-0 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md dark:hover:border-slate-700 transition-all duration-300 overflow-hidden"
      >
        {/* Priority stripe */}
        <div className={`lg:w-1 w-full h-1 lg:h-auto bg-gradient-to-b lg:bg-gradient-to-b ${pc.bg} flex-shrink-0`} />

        <div className="flex flex-col lg:flex-row flex-1 gap-8 p-8 lg:p-10">
          {/* LEFT: Profile */}
          <div className="lg:w-72 xl:w-80 flex flex-col gap-5 flex-shrink-0">
            <div className="flex gap-5 items-start">
              <div className="relative flex-shrink-0">
                <div
                  style={{
                    width: 96,
                    height: 128,
                    flexShrink: 0,
                    backgroundImage: target.photo ? `url(${target.photo})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                  }}
                  className="rounded-3xl shadow-md bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center"
                >
                  {!target.photo && (
                    <span className="text-3xl font-black text-slate-400 dark:text-slate-500 select-none">
                      {target.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className={`absolute -top-2.5 -right-2.5 min-w-[2rem] h-8 px-2 rounded-full bg-gradient-to-br ${pc.bg} shadow-md ${pc.shadow} flex items-center justify-center text-xs font-black text-white`}>
                  {target.code || '?'}
                </div>
              </div>

              <div className="flex-1 min-w-0 pt-1">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-2.5 max-w-full ${getPillStyle(colorKey)}`}>
                  <span style={{ backgroundColor: getDotColor(colorKey) }} className="w-1.5 h-1.5 rounded-full flex-shrink-0" />
                  <span className="truncate">{target.status || 'ไม่ระบุ'}</span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">{target.name}</h3>
                <p className="text-xs font-mono text-slate-400 dark:text-slate-500 mt-1">
                  NID : {target.citizenId || '—'}
                </p>
                {target.assignedUnit && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ชป. : {target.assignedUnit}</p>
                )}
              </div>
            </div>

            {/* Role + Behavior */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 space-y-4">
              <div>
                <p className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold mb-1.5 uppercase tracking-wide">
                  <UserCheck size={12} /> บทบาทในเครือข่าย
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{target.role || '—'}</p>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="flex items-center gap-1.5 text-rose-500 dark:text-rose-400 text-xs font-extrabold mb-1.5 uppercase tracking-wide">
                  <AlertCircle size={12} /> พฤติการณ์
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{target.behavior || '—'}</p>
              </div>
            </div>

            {/* Progress bar */}
            {progress.total > 0 && (
              <div className="px-1">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400 dark:text-slate-500">พยานหลักฐาน</span>
                  <span className="text-slate-700 dark:text-slate-300 tabular-nums">
                    {progress.done}/{progress.total} ({progress.pct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      progress.pct === 100
                        ? 'bg-gradient-to-r from-emerald-400 to-green-500'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                    }`}
                    style={{ width: `${progress.pct}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-slate-100 dark:bg-slate-800 flex-shrink-0 self-stretch" />

          {/* RIGHT: Evidence — marked so right-click on this area doesn't trigger card menu */}
          <div data-evidence className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 min-w-0">
            <EvidenceSection
              title="พยานบุคคล / เอกสาร"
              category="human"
              items={target.evidence.human}
              caseId={caseId}
              targetId={target.id}
              colorClass="indigo"
              icon={<FileText size={15} strokeWidth={2.5} />}
            />
            <EvidenceSection
              title="พยานนิติวิทยาศาสตร์"
              category="forensic"
              items={target.evidence.forensic}
              caseId={caseId}
              targetId={target.id}
              colorClass="pink"
              icon={<Fingerprint size={15} strokeWidth={2.5} />}
            />
          </div>
        </div>
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: 'แก้ไขข้อมูลเป้าหมาย', icon: <Edit3 size={11} />, action: () => setShowEdit(true) },
            { label: 'ลบเป้าหมาย',           icon: <Trash2 size={11} />, action: () => setShowConfirm(true), danger: true },
          ]}
        />
      )}

      {showEdit && (
        <TargetModal caseId={caseId} target={target} onClose={() => setShowEdit(false)} />
      )}
      {showConfirm && (
        <ConfirmDialog
          title="ลบบุคคลเป้าหมาย"
          message={`คุณต้องการลบ "${target.name}" ออกจากคดี? รวมถึงพยานหลักฐานทั้งหมดที่เชื่อมโยง การดำเนินการนี้ไม่สามารถยกเลิกได้`}
          onConfirm={() => { deleteTarget(caseId, target.id); setShowConfirm(false) }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}
