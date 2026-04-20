import { useState, useRef } from 'react'
import { Plus, CheckCircle2, Check, X, Pencil, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import ContextMenu from './ContextMenu'
import { EVIDENCE_PRESETS } from '../data/evidencePresets'

const COLOR = {
  indigo: {
    icon:  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500',
    check: 'checked:bg-indigo-500 checked:border-indigo-500',
    ring:  'ring-indigo-200 dark:ring-indigo-700',
    save:  'bg-indigo-500 hover:bg-indigo-600 text-white',
    pill:  'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 border border-indigo-100 dark:border-indigo-500/20',
  },
  pink: {
    icon:  'bg-pink-50 dark:bg-pink-500/10 text-pink-500',
    check: 'checked:bg-pink-500 checked:border-pink-500',
    ring:  'ring-pink-200 dark:ring-pink-700',
    save:  'bg-pink-500 hover:bg-pink-600 text-white',
    pill:  'bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-500/20 border border-pink-100 dark:border-pink-500/20',
  },
}

export default function EvidenceSection({ title, category, items, caseId, targetId, colorClass, icon }) {
  const toggleEvidence      = useStore((s) => s.toggleEvidence)
  const addEvidence         = useStore((s) => s.addEvidence)
  const deleteEvidence      = useStore((s) => s.deleteEvidence)
  const updateEvidenceTitle = useStore((s) => s.updateEvidenceTitle)

  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const addInputRef = useRef(null)
  const c = COLOR[colorClass] || COLOR.indigo

  const done     = items.filter((i) => i.status).length
  const presets  = EVIDENCE_PRESETS[category] || []
  // Filter out presets already added
  const usedTitles  = new Set(items.map((i) => i.title))
  const suggestions = presets.filter((p) => !usedTitles.has(p))

  const startAdding = () => {
    setIsAdding(true)
    setTimeout(() => addInputRef.current?.focus(), 40)
  }

  const commitAdd = (title = newTitle) => {
    const t = title.trim()
    if (t) { addEvidence(caseId, targetId, category, t); setNewTitle('') }
    setIsAdding(false)
  }

  const cancelAdd = () => { setIsAdding(false); setNewTitle('') }

  const handleKey = (e) => {
    if (e.key === 'Enter')  commitAdd()
    if (e.key === 'Escape') cancelAdd()
  }

  return (
    <div className="group/section flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${c.icon} flex-shrink-0`}>{icon}</div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{title}</h4>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 tabular-nums">
              {done}/{items.length}
            </span>
          )}
          {!isAdding && (
            <button
              onClick={startAdding}
              title="เพิ่มรายการ"
              className={`opacity-0 group-hover/section:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center ${c.icon} hover:scale-110`}
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 space-y-1">
        {items.map((ev) => (
          <EvidenceItem
            key={ev.id}
            ev={ev}
            checkClass={c.check}
            saveClass={c.save}
            onToggle={() => toggleEvidence(caseId, targetId, category, ev.id)}
            onDelete={() => deleteEvidence(caseId, targetId, category, ev.id)}
            onUpdateTitle={(t) => updateEvidenceTitle(caseId, targetId, category, ev.id, t)}
          />
        ))}

        {/* Add panel */}
        {isAdding && (
          <div className={`rounded-2xl bg-slate-50 dark:bg-slate-800/60 ring-1 ${c.ring} overflow-hidden`}>

            {/* Presets */}
            {suggestions.length > 0 && (
              <div className="px-3 pt-3 pb-2">
                <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  รายการแนะนำ
                </p>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                  {suggestions.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); commitAdd(p) }}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all ${c.pill}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <div className="mt-2.5 h-px bg-slate-200 dark:bg-slate-700/60" />
              </div>
            )}

            {/* Custom input */}
            <div className="flex items-center gap-2 px-3 py-2.5">
              <input
                ref={addInputRef}
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={handleKey}
                placeholder="พิมพ์ชื่อพยานหลักฐานเอง... (Enter)"
                className="flex-1 bg-transparent text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none font-medium"
              />
              <button
                onMouseDown={(e) => { e.preventDefault(); commitAdd() }}
                disabled={!newTitle.trim()}
                className={`flex-shrink-0 rounded-lg p-1.5 transition-colors disabled:opacity-30 ${c.save}`}
                title="บันทึก (Enter)"
              >
                <Check size={11} strokeWidth={2.5} />
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); cancelAdd() }}
                className="flex-shrink-0 rounded-lg p-1.5 transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
                title="ยกเลิก (Esc)"
              >
                <X size={11} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        )}

        {items.length === 0 && !isAdding && (
          <p className="text-xs text-slate-400 dark:text-slate-600 italic px-3 py-1">ยังไม่มีรายการ</p>
        )}
      </div>

      {/* Add button (bottom) */}
      {!isAdding && (
        <button
          onClick={startAdding}
          className={`mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700/80 text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1.5 text-xs font-bold transition-all
            hover:text-${colorClass === 'pink' ? 'pink' : 'indigo'}-600 dark:hover:text-${colorClass === 'pink' ? 'pink' : 'indigo'}-400
            hover:border-${colorClass === 'pink' ? 'pink' : 'indigo'}-300 dark:hover:border-${colorClass === 'pink' ? 'pink' : 'indigo'}-700
            hover:bg-${colorClass === 'pink' ? 'pink' : 'indigo'}-50 dark:hover:bg-${colorClass === 'pink' ? 'pink' : 'indigo'}-500/5`}
        >
          <Plus size={14} /> เพิ่มรายการ
        </button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
function EvidenceItem({ ev, onToggle, onDelete, onUpdateTitle, checkClass, saveClass }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState(ev.title)
  const [menu, setMenu]       = useState(null)
  const inputRef = useRef(null)

  const startEdit = () => {
    setDraft(ev.title)
    setEditing(true)
    setTimeout(() => { inputRef.current?.focus(); inputRef.current?.select() }, 30)
  }

  const commit = () => {
    const t = draft.trim()
    if (t && t !== ev.title) onUpdateTitle(t)
    else setDraft(ev.title)
    setEditing(false)
  }

  const cancel = () => { setDraft(ev.title); setEditing(false) }

  const handleKey = (e) => {
    if (e.key === 'Enter')  commit()
    if (e.key === 'Escape') cancel()
  }

  return (
    <>
      <div
        onContextMenu={(e) => { if (!editing) { e.preventDefault(); setMenu({ x: e.clientX, y: e.clientY }) } }}
        className="group flex items-start gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors select-none cursor-default"
      >
        {/* Checkbox */}
        <label className="relative flex items-center justify-center mt-0.5 flex-shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={ev.status}
            onChange={onToggle}
            className={`peer appearance-none w-[18px] h-[18px] border-2 border-slate-300 dark:border-slate-600 rounded-md transition-all cursor-pointer ${checkClass}`}
          />
          <CheckCircle2 size={11} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
        </label>

        {/* Text */}
        {editing ? (
          <>
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={handleKey}
              className="flex-1 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-transparent outline-none border-b border-indigo-400 dark:border-indigo-500 pb-0.5 min-w-0 cursor-text select-text"
            />
            <button
              onMouseDown={(e) => { e.preventDefault(); commit() }}
              className={`flex-shrink-0 rounded-lg p-1 transition-colors ${saveClass}`}
              title="บันทึก (Enter)"
            >
              <Check size={10} strokeWidth={2.5} />
            </button>
            <button
              onMouseDown={(e) => { e.preventDefault(); cancel() }}
              className="flex-shrink-0 rounded-lg p-1 transition-colors bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400"
              title="ยกเลิก (Esc)"
            >
              <X size={10} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <span
            onDoubleClick={startEdit}
            className={`flex-1 text-xs leading-relaxed transition-colors ${
              ev.status
                ? 'text-slate-600 dark:text-slate-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {ev.title}
          </span>
        )}
      </div>

      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: 'แก้ไข',    icon: <Pencil size={11} />, action: startEdit },
            { label: 'ลบรายการ', icon: <Trash2 size={11} />, action: onDelete, danger: true },
          ]}
        />
      )}
    </>
  )
}
