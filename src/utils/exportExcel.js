import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function photoToBase64(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()

  // Get natural dimensions via object URL
  const objUrl = URL.createObjectURL(blob)
  const { w, h } = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(objUrl) }
    img.onerror = () => { resolve({ w: 1, h: 1 }); URL.revokeObjectURL(objUrl) }
    img.src = objUrl
  })

  // Base64
  const { base64, mime } = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve({ base64: reader.result.split(',')[1], mime: blob.type })
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  return { base64, mime, w, h }
}

function imgExt(url = '', mime = '') {
  if (mime.includes('png') || /\.png(\?|$)/i.test(url)) return 'png'
  if (mime.includes('gif') || /\.gif(\?|$)/i.test(url)) return 'gif'
  return 'jpeg'
}

// Fit image into cell while preserving aspect ratio (object-fit: contain)
// Returns { ext: {width, height}, tl offset adjustments }
function fitInCell(imgW, imgH, cellW, cellH) {
  const scale = Math.min(cellW / imgW, cellH / imgH)
  const dispW = Math.round(imgW * scale)
  const dispH = Math.round(imgH * scale)
  const padX = (cellW - dispW) / 2   // centering offset in px
  const padY = (cellH - dispH) / 2
  return { dispW, dispH, padX, padY }
}

const HEADER_BG = 'FF4F46E5' // indigo-600
const EV_BG = 'FF6366F1' // indigo-500
const TITLE_BG = 'FFE0E7FF' // indigo-100
const ROW_ALT_BG = 'FFF8FAFC' // slate-50
const WHITE = 'FFFFFFFF'
const DARK_TEXT = 'FF1E293B'
const BORDER_CLR = 'FFE2E8F0'

function border(style = 'thin') {
  const b = { style, color: { argb: BORDER_CLR } }
  return { top: b, bottom: b, left: b, right: b }
}

function fillSolid(argb) {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb } }
}

// ─────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────
export async function exportCaseToExcel(caseData, onProgress = null) {
  const wb = new ExcelJS.Workbook()
  wb.creator = 'Investigator Space'
  wb.created = new Date()

  const ws = wb.addWorksheet('เป้าหมายบุคคล', {
    pageSetup: { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1 },
  })

  const targets = caseData.targets || []

  // ── Collect all unique evidence titles (human then forensic, preserving order) ──
  const seenHuman = new Set()
  const seenForensic = new Set()
  const humanTitles = []
  const forensicTitles = []
  targets.forEach((t) => {
    ; (t.evidence?.human || []).forEach((e) => { if (!seenHuman.has(e.title)) { seenHuman.add(e.title); humanTitles.push(e.title) } })
      ; (t.evidence?.forensic || []).forEach((e) => { if (!seenForensic.has(e.title)) { seenForensic.add(e.title); forensicTitles.push(e.title) } })
  })
  const allEvTitles = [...humanTitles, ...forensicTitles]

  // ── Column indices (1-based) ──
  // A=1 ลำดับ  B=2 รหัส  C=3 ภาพ  D=4 ชื่อ  E=5 บัตร  F=6 สถานะ
  // G=7 ระดับ  H=8 บทบาท  I=9 พฤติการณ์  J=10 ชุดปฏิบัติการ
  // K+ evidence columns  …  scoreCol  notesCol
  const BASE = 10
  const evStartCol = BASE + 1                     // K
  const scoreCol = evStartCol + allEvTitles.length
  const notesCol = scoreCol + 1
  const totalCols = notesCol

  // ── Column widths ──
  const colWidths = [
    6,  // A ลำดับ
    8,  // B รหัส
    16, // C ภาพ
    28, // D ชื่อ
    20, // E บัตร
    14, // F สถานะ
    10, // G ระดับ
    22, // H บทบาท
    32, // I พฤติการณ์
    12, // J ชุดปฏิบัติการ
  ]
  colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w })
  for (let i = 0; i < allEvTitles.length; i++) ws.getColumn(evStartCol + i).width = 18
  ws.getColumn(scoreCol).width = 12
  ws.getColumn(notesCol).width = 32

  // ════════════════════════════════════════════
  // ROW 1 — Case title
  // ════════════════════════════════════════════
  ws.addRow([])
  ws.mergeCells(1, 1, 1, totalCols)
  const titleCell = ws.getCell('A1')
  titleCell.value = caseData.title
  titleCell.font = { size: 16, bold: true, color: { argb: DARK_TEXT } }
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' }
  titleCell.fill = fillSolid(TITLE_BG)
  ws.getRow(1).height = 38

  // ════════════════════════════════════════════
  // ROW 2 — Sub-headers (evidence group label)
  // ════════════════════════════════════════════
  ws.addRow([])
  ws.getRow(2).height = 26

  if (allEvTitles.length > 0) {
    if (humanTitles.length > 0) {
      ws.mergeCells(2, evStartCol, 2, evStartCol + humanTitles.length - 1)
      const hCell = ws.getCell(2, evStartCol)
      hCell.value = 'พยานบุคคล / เอกสาร'
      hCell.font = { size: 11, bold: true, color: { argb: WHITE } }
      hCell.alignment = { horizontal: 'center', vertical: 'middle' }
      hCell.fill = fillSolid('FF6366F1') // indigo
    }
    if (forensicTitles.length > 0) {
      const fStart = evStartCol + humanTitles.length
      ws.mergeCells(2, fStart, 2, fStart + forensicTitles.length - 1)
      const fCell = ws.getCell(2, fStart)
      fCell.value = 'พยานนิติวิทยาศาสตร์'
      fCell.font = { size: 11, bold: true, color: { argb: WHITE } }
      fCell.alignment = { horizontal: 'center', vertical: 'middle' }
      fCell.fill = fillSolid('FFE91E8C') // pink
    }
  }

  // ════════════════════════════════════════════
  // ROW 3 — Column headers
  // ════════════════════════════════════════════
  // Collect max weight per evidence title for header display
  const maxWeightForTitle = {}
  allEvTitles.forEach((title) => {
    let maxW = 1
    targets.forEach((t) => {
      const ev = [...(t.evidence?.human || []), ...(t.evidence?.forensic || [])].find(e => e.title === title)
      if (ev && (ev.weight || 1) > maxW) maxW = ev.weight || 1
    })
    maxWeightForTitle[title] = maxW
  })

  const headerValues = [
    'ลำดับ', 'รหัส', 'ภาพใบหน้า', 'ชื่อ - สกุล', 'เลขประจำตัวประชาชน',
    'สถานะ', 'ระดับ', 'บทบาท', 'พฤติการณ์', 'ชป. ที่รับผิดชอบ',
    ...allEvTitles.map(t => maxWeightForTitle[t] > 1 ? `${t} (×${maxWeightForTitle[t]})` : t),
    'คะแนน (%)',
    'บันทึก / สิ่งที่ต้องทำ',
  ]

  const hRow = ws.addRow(headerValues)
  hRow.height = 46
  hRow.eachCell((cell) => {
    cell.font = { size: 10, bold: true, color: { argb: WHITE } }
    cell.fill = fillSolid(HEADER_BG)
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    cell.border = border()
  })

  // ════════════════════════════════════════════
  // DATA ROWS
  // ════════════════════════════════════════════
  const ROW_HEIGHT = 68 // ~90px for photo

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i]
    const rowNum = 4 + i // Excel row number (1-based)

    // Evidence cells
    const evValues = allEvTitles.map((title) => {
      const item = [...(t.evidence?.human || []), ...(t.evidence?.forensic || [])].find(e => e.title === title)
      if (!item) return ''
      return item.status ? '✔' : '✗'
    })

    // Score
    const allItems = [...(t.evidence?.human || []), ...(t.evidence?.forensic || [])]
    const scorePct = allItems.length > 0
      ? Math.round(allItems.filter(e => e.status).length / allItems.length * 100)
      : 0

    const rowValues = [
      i + 1,
      t.code || '',
      '',   // photo — inserted via addImage
      t.name || '',
      t.citizenId || '',
      t.status || '',
      t.priority || '',
      t.role || '',
      t.behavior || '',
      t.assignedUnit || '',
      ...evValues,
      `${scorePct}%`,
      t.notes || '',
    ]

    const dataRow = ws.addRow(rowValues)
    dataRow.height = ROW_HEIGHT

    const isAlt = i % 2 === 1

    dataRow.eachCell((cell, colIdx) => {
      cell.border = border()
      cell.alignment = { vertical: 'middle', wrapText: true }

      if (isAlt && colIdx !== 3) cell.fill = fillSolid(ROW_ALT_BG)

      // Evidence columns
      if (colIdx >= evStartCol && colIdx < scoreCol) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        if (cell.value === '✔') {
          cell.font = { size: 14, bold: true, color: { argb: 'FF10B981' } }
          cell.fill = fillSolid(isAlt ? 'FFD1FAE5' : 'FFECFdF5')
        } else if (cell.value === '✗') {
          cell.font = { size: 12, color: { argb: 'FFEF4444' } }
        } else if (cell.value === '') {
          cell.fill = fillSolid('FFF1F5F9')
        }
      }

      // Score column
      if (colIdx === scoreCol) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' }
        const pct = parseInt(cell.value) || 0
        if (pct === 100) cell.font = { bold: true, size: 11, color: { argb: 'FF10B981' } }
        else if (pct >= 70) cell.font = { bold: true, size: 11, color: { argb: 'FF3B82F6' } }
        else if (pct >= 40) cell.font = { size: 11, color: { argb: 'FFF59E0B' } }
        else cell.font = { size: 11, color: { argb: 'FFEF4444' } }
      }

      // Center small columns
      if (colIdx <= 3 || colIdx === 7) {
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
      }
    })

    // ── Photo ──
    // Strategy A (Excel 365): IMAGE() formula → image lives INSIDE the cell as a value.
    //   Truly "Place in Cell" — sorts perfectly. Requires the URL to be reachable by Excel.
    // Strategy B (all versions): addImage with editAs:'oneCell' + ext sizing.
    //   Technically a floating image but ANCHORED to this cell, so it moves with the
    //   row when sorting. Image is sized to fill the cell.
    // We write BOTH: Strategy A as the cell formula, Strategy B as an embedded image.
    // On Excel 365 Strategy A takes visual priority; on older Excel Strategy B shows.
    if (t.photo) {
      // A — IMAGE() formula (in-cell, Excel 365+)
      const photoCell = dataRow.getCell(3)
      photoCell.value = { formula: `IMAGE("${t.photo}")` }
      photoCell.alignment = { horizontal: 'center', vertical: 'middle' }

      // B — embedded base64 image, aspect-ratio preserved (object-fit: contain)
      try {
        const { base64, mime, w, h } = await photoToBase64(t.photo)
        const imgId = wb.addImage({ base64, extension: imgExt(t.photo, mime) })

        // Cell C dimensions: 16 chars ≈ 113px wide, 68pt ≈ 91px tall
        const CELL_W = 113, CELL_H = 91
        const { dispW, dispH, padX, padY } = fitInCell(w, h, CELL_W, CELL_H)

        // Convert pixel padding to fractional column/row offsets
        const colOff = padX / CELL_W   // fraction of column width
        const rowOff = padY / CELL_H   // fraction of row height

        ws.addImage(imgId, {
          tl: { col: 2 + colOff, row: (rowNum - 1) + rowOff },
          ext: { width: dispW, height: dispH },
          editAs: 'oneCell',
        })
      } catch (e) {
        console.warn('Photo embed failed:', t.name, e?.message)
      }
    }

    if (onProgress) onProgress(Math.round(((i + 1) / targets.length) * 100))

  }

  // ════════════════════════════════════════════
  // Freeze header rows + first 2 cols
  // ════════════════════════════════════════════
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 3, activeCell: 'D4' }]

  // Auto-filter on header row
  ws.autoFilter = { from: { row: 3, column: 1 }, to: { row: 3, column: totalCols } }

  // ════════════════════════════════════════════
  // Download
  // ════════════════════════════════════════════
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const safeTitle = caseData.title.replace(/[/\\?%*:|"<>]/g, '-')
  const date = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
  saveAs(blob, `${safeTitle}_${date}.xlsx`)
}
