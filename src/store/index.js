import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { sampleData } from '../data/sampleData'

let _c = 0
const genId = (prefix) => `${prefix}-${Date.now()}-${++_c}`

// Apply theme class to <html>
export const applyTheme = (theme) => {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const dark = theme === 'dark' || (theme === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', dark)
}

// Push snapshot before mutation (for undo)
const snap = (s) => ({
  past: [...s.past.slice(-80), s.cases],
  future: [],
})

export const useStore = create(
  persist(
    (set) => ({
      cases: sampleData,
      activeCaseId: sampleData[0]?.id || null,
      theme: 'system',
      statusColors: { Pending: 'amber', Captured: 'emerald', 'ยังไม่จับ': 'amber', 'จับกุมแล้ว': 'emerald' },
      past: [],
      future: [],

      setStatusColor: (label, colorKey) =>
        set((s) => ({ statusColors: { ...s.statusColors, [label]: colorKey } })),

      // ── Undo / Redo ──
      undo: () =>
        set((s) => {
          if (s.past.length === 0) return {}
          const prev = s.past[s.past.length - 1]
          return {
            cases: prev,
            past: s.past.slice(0, -1),
            future: [s.cases, ...s.future.slice(0, 80)],
          }
        }),

      redo: () =>
        set((s) => {
          if (s.future.length === 0) return {}
          const next = s.future[0]
          return {
            cases: next,
            past: [...s.past.slice(-80), s.cases],
            future: s.future.slice(1),
          }
        }),

      // Theme
      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      // Cases
      setActiveCase: (id) => set({ activeCaseId: id }),

      addCase: (data) =>
        set((s) => {
          const c = {
            id: genId('case'),
            title: data.title,
            summary: data.summary || '',
            status: data.status || 'Active',
            createdAt: new Date().toISOString(),
            targets: [],
          }
          return { ...snap(s), cases: [...s.cases, c], activeCaseId: c.id }
        }),

      updateCase: (caseId, updates) =>
        set((s) => ({
          ...snap(s),
          cases: s.cases.map((c) => (c.id === caseId ? { ...c, ...updates } : c)),
        })),

      deleteCase: (caseId) =>
        set((s) => {
          const next = s.cases.filter((c) => c.id !== caseId)
          return {
            ...snap(s),
            cases: next,
            activeCaseId: s.activeCaseId === caseId ? (next[0]?.id || null) : s.activeCaseId,
          }
        }),

      // Targets
      addTarget: (caseId, data) =>
        set((s) => {
          const t = {
            id: genId('target'),
            code: data.code || '',
            priority: data.priority || 'Medium',
            name: data.name || '',
            citizenId: data.citizenId || '',
            role: data.role || '',
            behavior: data.behavior || '',
            status: data.status || 'Pending',
            photo: data.photo || '',
            assignedUnit: data.assignedUnit || '',
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
            evidence: { human: [], forensic: [] },
          }
          return {
            ...snap(s),
            cases: s.cases.map((c) =>
              c.id === caseId ? { ...c, targets: [...c.targets, t] } : c
            ),
          }
        }),

      updateTarget: (caseId, targetId, updates) =>
        set((s) => ({
          ...snap(s),
          cases: s.cases.map((c) =>
            c.id === caseId
              ? { ...c, targets: c.targets.map((t) => (t.id === targetId ? { ...t, ...updates } : t)) }
              : c
          ),
        })),

      deleteTarget: (caseId, targetId) =>
        set((s) => ({
          ...snap(s),
          cases: s.cases.map((c) =>
            c.id === caseId ? { ...c, targets: c.targets.filter((t) => t.id !== targetId) } : c
          ),
        })),

      // Evidence
      addEvidence: (caseId, targetId, category, title) =>
        set((s) => {
          const item = { id: genId('ev'), title, status: false, createdAt: new Date().toISOString() }
          return {
            ...snap(s),
            cases: s.cases.map((c) =>
              c.id === caseId
                ? {
                    ...c,
                    targets: c.targets.map((t) =>
                      t.id === targetId
                        ? { ...t, evidence: { ...t.evidence, [category]: [...t.evidence[category], item] } }
                        : t
                    ),
                  }
                : c
            ),
          }
        }),

      toggleEvidence: (caseId, targetId, category, itemId) =>
        set((s) => ({
          ...snap(s),
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  targets: c.targets.map((t) =>
                    t.id === targetId
                      ? {
                          ...t,
                          evidence: {
                            ...t.evidence,
                            [category]: t.evidence[category].map((ev) =>
                              ev.id === itemId ? { ...ev, status: !ev.status } : ev
                            ),
                          },
                        }
                      : t
                  ),
                }
              : c
          ),
        })),

      deleteEvidence: (caseId, targetId, category, itemId) =>
        set((s) => ({
          ...snap(s),
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  targets: c.targets.map((t) =>
                    t.id === targetId
                      ? {
                          ...t,
                          evidence: {
                            ...t.evidence,
                            [category]: t.evidence[category].filter((ev) => ev.id !== itemId),
                          },
                        }
                      : t
                  ),
                }
              : c
          ),
        })),

      updateEvidenceTitle: (caseId, targetId, category, itemId, title) =>
        set((s) => ({
          ...snap(s),
          cases: s.cases.map((c) =>
            c.id === caseId
              ? {
                  ...c,
                  targets: c.targets.map((t) =>
                    t.id === targetId
                      ? {
                          ...t,
                          evidence: {
                            ...t.evidence,
                            [category]: t.evidence[category].map((ev) =>
                              ev.id === itemId ? { ...ev, title } : ev
                            ),
                          },
                        }
                      : t
                  ),
                }
              : c
          ),
        })),

    }),
    {
      name: 'investigator-space-v1',
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // Exclude undo/redo stacks from localStorage (session-only)
      partialize: (state) => {
        const { past, future, ...rest } = state
        return rest
      },
    }
  )
)
