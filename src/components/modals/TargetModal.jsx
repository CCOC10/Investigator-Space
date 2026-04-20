import { useState, useMemo } from 'react'
import { Save } from 'lucide-react'
import Modal from './Modal'
import { Field, Input, Textarea, SelectField } from './CaseModal'
import { useStore } from '../../store'
import { COLOR_OPTIONS, DEFAULT_COLOR, getPillStyle, getDotColor } from '../../utils/statusColors'

function useAllStatuses() {
  return useStore(
    useMemo(() => (s) => {
      const seen = new Set()
      s.cases.forEach((c) => c.targets.forEach((t) => { if (t.status) seen.add(t.status) }))
      return [...seen]
    }, [])
  )
}

function StatusInput({ value, onChange }) {
  const statusColors = useStore((s) => s.statusColors)
  const setStatusColor = useStore((s) => s.setStatusColor)
  const suggestions = useAllStatuses()

  const currentColorKey = statusColors[value] || DEFAULT_COLOR

  return (
    <div className="space-y-3">
      <Input
        value={value}
        onChange={onChange}
        placeholder="เช่น ยังไม่จับ, หลบหนี, ถูกคุมขัง, ดำเนินคดีแล้ว..."
      />

      {/* Color picker — shows when there's a value */}
      {value.trim() && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">สี:</span>
          <div className="flex gap-1.5">
            {COLOR_OPTIONS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setStatusColor(value, c.key)}
                title={c.key}
                style={{ backgroundColor: c.dot }}
                className={`w-5 h-5 rounded-full transition-all duration-150 ${currentColorKey === c.key
                  ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500 scale-125'
                  : 'opacity-60 hover:opacity-100 hover:scale-110'
                  }`}
              />
            ))}
          </div>
          {/* Preview pill */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${getPillStyle(currentColorKey)}`}>
            <span style={{ backgroundColor: getDotColor(currentColorKey) }} className="w-1.5 h-1.5 rounded-full" />
            {value}
          </span>
        </div>
      )}

      {/* Suggestion pills */}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-0.5">
          {suggestions.map((s) => {
            const ck = statusColors[s] || DEFAULT_COLOR
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange(s)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${getPillStyle(ck)
                  } ${value === s ? 'ring-2 ring-current ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
              >
                <span style={{ backgroundColor: getDotColor(ck) }} className="w-2 h-2 rounded-full flex-shrink-0" />
                {s}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TargetModal({ caseId, target, onClose }) {
  const addTarget = useStore((s) => s.addTarget)
  const updateTarget = useStore((s) => s.updateTarget)
  const isEdit = !!target

  const [form, setForm] = useState({
    code: target?.code || '',
    name: target?.name || '',
    citizenId: target?.citizenId || '',
    role: target?.role || '',
    behavior: target?.behavior || '',
    status: target?.status || 'ยังไม่จับ',
    priority: target?.priority || 'Medium',
    photo: target?.photo || '',
    assignedUnit: target?.assignedUnit || '',
    notes: target?.notes || '',
  })
  const [errors, setErrors] = useState({})

  const setField = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.name.trim()) { setErrors({ name: 'กรุณาระบุชื่อ-นามสกุล' }); return }
    isEdit ? updateTarget(caseId, target.id, form) : addTarget(caseId, form)
    onClose()
  }

  return (
    <Modal
      title={isEdit ? 'แก้ไขข้อมูลบุคคลเป้าหมาย' : 'เพิ่มบุคคลเป้าหมาย'}
      onClose={onClose}
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} className="px-7 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all text-sm">
            <Save size={16} />
            {isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มบุคคลเป้าหมาย'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="รหัสเป้าหมาย">
            <Input value={form.code} onChange={(v) => setField('code', v)} placeholder="เช่น AA, B1..." />
          </Field>
          <Field label="ระดับความสำคัญ">
            <SelectField value={form.priority} onChange={(v) => setField('priority', v)}>
              <option value="High">สูง (High)</option>
              <option value="Medium">กลาง (Medium)</option>
              <option value="Low">ต่ำ (Low)</option>
            </SelectField>
          </Field>
        </div>

        <Field label="ชื่อ-นามสกุล" error={errors.name}>
          <Input value={form.name} onChange={(v) => setField('name', v)} placeholder="ระบุชื่อ-นามสกุลจริง..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="เลขประจำตัวประชาชน">
            <Input value={form.citizenId} onChange={(v) => setField('citizenId', v)} placeholder="13 หลัก..." maxLength={13} />
          </Field>
          <Field label="สถานะ">
            <StatusInput value={form.status} onChange={(v) => setField('status', v)} />
          </Field>
        </div>

        <Field label="บทบาท / ความเกี่ยวข้องในเครือข่าย">
          <Input value={form.role} onChange={(v) => setField('role', v)} placeholder="เช่น บัญชีม้าแถว 1, ผู้สั่งการ..." />
        </Field>

        <Field label="พฤติการณ์กระทำความผิด">
          <Textarea value={form.behavior} onChange={(v) => setField('behavior', v)} placeholder="อธิบายพฤติการณ์โดยสรุป..." rows={3} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="ชป. ที่รับผิดชอบ">
            <Input value={form.assignedUnit} onChange={(v) => setField('assignedUnit', v)} placeholder="เช่น 15, 14..." />
          </Field>
          <Field label="URL รูปถ่าย (ไม่บังคับ)">
            <Input value={form.photo} onChange={(v) => setField('photo', v)} placeholder="https://..." />
          </Field>
        </div>

        <Field label="บันทึกเพิ่มเติม">
          <Textarea value={form.notes} onChange={(v) => setField('notes', v)} placeholder="บันทึกข้อมูลเพิ่มเติม..." rows={2} />
        </Field>
      </div>
    </Modal>
  )
}
