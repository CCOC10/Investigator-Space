import { useState } from 'react'
import { Save } from 'lucide-react'
import Modal from './Modal'
import { useStore } from '../../store'

export function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-500 font-semibold">{error}</p>}
    </div>
  )
}

export function Input({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium text-sm outline-none transition-all border-0"
      {...rest}
    />
  )
}

export function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 font-medium text-sm outline-none transition-all resize-none border-0"
    />
  )
}

export function SelectField({ value, onChange, children, ...rest }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 font-medium text-sm outline-none border-0 cursor-pointer"
      {...rest}
    >
      {children}
    </select>
  )
}

export default function CaseModal({ caseData, onClose }) {
  const addCase = useStore((s) => s.addCase)
  const updateCase = useStore((s) => s.updateCase)
  const isEdit = !!caseData

  const [form, setForm] = useState({
    title: caseData?.title || '',
    summary: caseData?.summary || '',
    status: caseData?.status || 'Active',
  })
  const [errors, setErrors] = useState({})

  const handleSubmit = () => {
    if (!form.title.trim()) {
      setErrors({ title: 'กรุณาระบุชื่อคดี' })
      return
    }
    isEdit ? updateCase(caseData.id, form) : addCase(form)
    onClose()
  }

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  return (
    <Modal
      title={isEdit ? 'แก้ไขข้อมูลคดี' : 'เพิ่มคดีใหม่'}
      onClose={onClose}
      size="md"
      footer={
        <>
          <button onClick={onClose} className="px-6 py-3 rounded-2xl font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} className="px-7 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all text-sm">
            <Save size={16} />
            {isEdit ? 'บันทึกการเปลี่ยนแปลง' : 'สร้างคดี'}
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <Field label="ชื่อคดี" error={errors.title}>
          <Input value={form.title} onChange={(v) => set('title', v)} placeholder="เช่น คดีเครือข่ายบัญชีม้า (Operation X)" />
        </Field>
        <Field label="สรุปคดีโดยย่อ">
          <Textarea value={form.summary} onChange={(v) => set('summary', v)} placeholder="อธิบายภาพรวมของคดี..." rows={4} />
        </Field>
        <Field label="สถานะคดี">
          <SelectField value={form.status} onChange={(v) => set('status', v)}>
            <option value="Active">ดำเนินการอยู่</option>
            <option value="Closed">ปิดคดีแล้ว</option>
            <option value="Archived">เก็บถาวร</option>
          </SelectField>
        </Field>
      </div>
    </Modal>
  )
}
