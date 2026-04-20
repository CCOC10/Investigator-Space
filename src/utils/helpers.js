export const getEvidenceProgress = (target) => {
  const all = [
    ...(target.evidence?.human || []),
    ...(target.evidence?.forensic || []),
  ]
  if (all.length === 0) return { total: 0, done: 0, pct: 0 }
  const done = all.filter((e) => e.status).length
  return { total: all.length, done, pct: Math.round((done / all.length) * 100) }
}

export const getCaseStats = (caseData) => {
  const total = caseData.targets.length
  const captured = caseData.targets.filter((t) => t.status === 'Captured').length
  const pending = total - captured
  const allEvidence = caseData.targets.flatMap((t) => [
    ...(t.evidence?.human || []),
    ...(t.evidence?.forensic || []),
  ])
  const evidenceDone = allEvidence.filter((e) => e.status).length
  return { total, captured, pending, evidenceTotal: allEvidence.length, evidenceDone }
}

// Keywords that indicate a "captured/resolved" status
const POSITIVE_KEYWORDS = ['captured', 'จับกุม', 'จับได้', 'คุมขัง', 'ดำเนินคดี', 'ถูกจับ']

export const isPositiveStatus = (status = '') => {
  const s = status.toLowerCase()
  if (POSITIVE_KEYWORDS.some((k) => s.includes(k))) return true
  // "จับ" without negation words
  if (s.includes('จับ') && !s.includes('ยัง') && !s.includes('ไม่') && !s.includes('หนี')) return true
  return false
}

export const formatDate = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
