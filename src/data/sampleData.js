export const sampleData = [
  {
    id: 'case-001',
    title: 'คดีเครือข่ายบัญชีม้าออนไลน์ (Operation X)',
    summary: 'การสืบสวนเครือข่ายการฟอกเงินข้ามชาติผ่านบัญชีม้าออนไลน์ เชื่อมโยงกลุ่มทุนสีเทา',
    status: 'Active',
    createdAt: '2026-01-15T00:00:00.000Z',
    targets: [
      {
        id: 'target-001',
        code: 'AA',
        priority: 'High',
        name: 'นายธนะพัฒน์ พงษ์วุฒิเศรษฐ์',
        citizenId: '3101500237381',
        role: 'ผู้รับผลประโยชน์',
        behavior: 'ควบคุมกลุ่มบัญชีม้าแถว 1 และ 2 กระจายเงินเข้าบัญชีนอกระบบ',
        status: 'Captured',
        photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        assignedUnit: '15, 14',
        notes: '',
        createdAt: '2026-01-15T00:00:00.000Z',
        evidence: {
          human: [
            { id: 'ev-h1', title: 'คำให้การนายสมเกียรติ (สายลับ)', status: true, createdAt: '2026-01-15T00:00:00.000Z' },
            { id: 'ev-h2', title: 'เจ้าหน้าที่ธนาคารยืนยันการเปิดบัญชี', status: true, createdAt: '2026-01-15T00:00:00.000Z' },
          ],
          forensic: [
            { id: 'ev-f1', title: 'ข้อมูล Digital Footprint การล็อกอิน', status: true, createdAt: '2026-01-15T00:00:00.000Z' },
            { id: 'ev-f2', title: 'ลายนิ้วมือบนสมุดบัญชีที่ตรวจยึด', status: false, createdAt: '2026-01-15T00:00:00.000Z' },
          ],
        },
      },
      {
        id: 'target-002',
        code: 'B1',
        priority: 'Medium',
        name: 'น.ส.สุพิชฌาย์ มงคลสวัสดิ์',
        citizenId: '1110499000622',
        role: 'บัญชีม้าแถว 1',
        behavior: 'เปิดบัญชีและส่งมอบสมุดพร้อมซิมการ์ดให้กลุ่มผู้จัดหาผ่านทางไปรษณีย์',
        status: 'Pending',
        photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        assignedUnit: '13, 19',
        notes: '',
        createdAt: '2026-01-16T00:00:00.000Z',
        evidence: {
          human: [
            { id: 'ev-h3', title: 'ภาพถ่ายวงจรปิดขณะถอนเงิน', status: true, createdAt: '2026-01-16T00:00:00.000Z' },
            { id: 'ev-h4', title: 'พยานแวดล้อมใกล้เคียงสถานที่เกิดเหตุ', status: false, createdAt: '2026-01-16T00:00:00.000Z' },
          ],
          forensic: [
            { id: 'ev-f3', title: 'บันทึกการใช้โทรศัพท์ (CDR)', status: false, createdAt: '2026-01-16T00:00:00.000Z' },
          ],
        },
      },
    ],
  },
]
