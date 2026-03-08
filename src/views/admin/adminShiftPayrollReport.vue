<template>
  <div class="app-layout">
    <AdminSidebar class="no-print" />

    <main class="report-main">

      <!-- Toolbar -->
      <ShiftReportToolbar
        v-model:selectedMonth="selectedMonth"
        v-model:selectedYear="selectedYear"
        v-model:staffFilter="staffFilter"
        :months="months"
        :years="years"
        :staffList="staffList"
        :generated="generated"
        @generate="generateReport"
        @print="handlePrint"
      />

      <!-- Empty state -->
      <div v-if="!generated" class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <p class="empty-title">No report generated yet</p>
        <p class="empty-sub">Select a month, year and (optionally) a staff member, then click <strong>Generate Report</strong>.</p>
      </div>

      <!-- Report Document -->
      <div v-else class="report-doc" id="report-document">

        <!-- Doc Header -->
        <div class="doc-header">
          <div class="doc-header-left">
            <div class="doc-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <p class="doc-store">KSMS</p>
              <h1 class="doc-title">Shift &amp; Payroll Report</h1>
            </div>
          </div>
          <div class="doc-header-right">
            <div class="doc-meta-row">
              <span class="meta-label">Period</span>
              <span class="meta-val">{{ periodLabel }}</span>
            </div>
            <div class="doc-meta-row">
              <span class="meta-label">Staff</span>
              <span class="meta-val">{{ appliedStaffLabel }}</span>
            </div>
            <div class="doc-meta-row">
              <span class="meta-label">Generated</span>
              <span class="meta-val">{{ generatedAt }}</span>
            </div>
          </div>
        </div>

        <div class="doc-divider" />

        <!-- Summary Cards -->
        <ShiftReportSummary :cards="summaryCards" />

        <div class="doc-divider" />

        <!-- Staff Table (with pay columns) -->
        <ReportStaffTable :rows="filteredStaffRows" />

        <div class="doc-divider" />

        <!-- Attendance Log -->
        <ReportAttendanceLog :logs="filteredLogs" />

        <div class="doc-divider" />

        <!-- Payroll Breakdown cards + grand total + footer -->
        <ReportPayrollBreakdown
          :rows="filteredStaffRows"
          :period-label="periodLabel"
          :generated-at="generatedAt"
        />

      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar           from '@/components/sidebar/AdminSidebar.vue'
import ShiftReportToolbar     from '@/components/admin-shiftpayrollreport/ShiftReportToolbar.vue'
import ShiftReportSummary     from '@/components/admin-shiftpayrollreport/ShiftReportSummary.vue'
import ReportStaffTable       from '@/components/admin-shiftpayrollreport/ReportStaffTable.vue'
import ReportAttendanceLog    from '@/components/admin-shiftpayrollreport/ReportAttendanceLog.vue'
import ReportPayrollBreakdown from '@/components/admin-shiftpayrollreport/ReportPayrollBreakdown.vue'

// ── Mock data — replace with API calls ────────────────────────────────────────

// hourlyRate added here; in production fetch from a staff_rate or payroll_config table
const STAFF = [
  { id:1, fullName:'Ahmad Zulkifli',        role:'staff', hourlyRate: 7.50 },
  { id:2, fullName:'Nurul Ain Binti Hamid', role:'staff', hourlyRate: 7.50 },
  { id:3, fullName:'Faizal Ramli',          role:'staff', hourlyRate: 8.00 },
  { id:4, fullName:'Siti Rahayu',           role:'staff', hourlyRate: 7.50 },
  { id:5, fullName:'Muhammad Hakim',        role:'staff', hourlyRate: 8.00 },
]

// shift_attendance_log joined with user
const ATTENDANCE_LOGS = [
  { id:1,  shiftID:101, userID:1, fullName:'Ahmad Zulkifli',        checkIn:'2025-03-01 08:02', checkOut:'2025-03-01 16:05', status:'Completed', notes:'' },
  { id:2,  shiftID:102, userID:2, fullName:'Nurul Ain Binti Hamid', checkIn:'2025-03-01 08:15', checkOut:'2025-03-01 16:00', status:'Late',      notes:'Arrived 15 min late' },
  { id:3,  shiftID:103, userID:3, fullName:'Faizal Ramli',          checkIn:'2025-03-02 08:00', checkOut:'2025-03-02 16:00', status:'Completed', notes:'' },
  { id:4,  shiftID:104, userID:4, fullName:'Siti Rahayu',           checkIn:null,               checkOut:null,               status:'Missed',    notes:'MC submitted' },
  { id:5,  shiftID:105, userID:5, fullName:'Muhammad Hakim',        checkIn:'2025-03-02 08:05', checkOut:'2025-03-02 16:10', status:'Completed', notes:'' },
  { id:6,  shiftID:106, userID:1, fullName:'Ahmad Zulkifli',        checkIn:'2025-03-03 08:00', checkOut:'2025-03-03 16:00', status:'Completed', notes:'' },
  { id:7,  shiftID:107, userID:2, fullName:'Nurul Ain Binti Hamid', checkIn:'2025-03-04 08:30', checkOut:'2025-03-04 16:00', status:'Late',      notes:'' },
  { id:8,  shiftID:108, userID:3, fullName:'Faizal Ramli',          checkIn:null,               checkOut:null,               status:'Missed',    notes:'' },
  { id:9,  shiftID:109, userID:4, fullName:'Siti Rahayu',           checkIn:'2025-03-05 08:00', checkOut:'2025-03-05 16:00', status:'Completed', notes:'' },
  { id:10, shiftID:110, userID:5, fullName:'Muhammad Hakim',        checkIn:'2025-03-05 08:00', checkOut:'2025-03-05 16:00', status:'Completed', notes:'' },
  { id:11, shiftID:111, userID:1, fullName:'Ahmad Zulkifli',        checkIn:'2025-03-06 08:00', checkOut:'2025-03-06 16:00', status:'Completed', notes:'' },
  { id:12, shiftID:112, userID:3, fullName:'Faizal Ramli',          checkIn:'2025-03-07 08:00', checkOut:'2025-03-07 16:00', status:'Completed', notes:'' },
]

// payroll table — hoursWorked comes from here (admin-entered or computed)
const PAYROLL = [
  { userID:1, hoursWorked:24.08, isCreated:true,  isReceived:true  },
  { userID:2, hoursWorked:15.75, isCreated:true,  isReceived:false },
  { userID:3, hoursWorked:16.00, isCreated:false, isReceived:false },
  { userID:4, hoursWorked: 8.00, isCreated:true,  isReceived:true  },
  { userID:5, hoursWorked:16.00, isCreated:true,  isReceived:false },
]

export default {
  name: 'AdminShiftPayrollReport',
  components: {
    AdminSidebar, ShiftReportToolbar, ShiftReportSummary,
    ReportStaffTable, ReportAttendanceLog, ReportPayrollBreakdown,
  },

  data() {
    const now = new Date()
    const years = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) years.push(y)
    return {
      selectedMonth: now.getMonth(),
      selectedYear:  now.getFullYear(),
      staffFilter:   '',

      appliedMonth:  null,
      appliedYear:   null,
      appliedStaff:  '',

      generated:    false,
      generatedAt:  '',

      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      years,

      staffList:      STAFF,
      attendanceLogs: ATTENDANCE_LOGS,
      payrollData:    PAYROLL,
    }
  },

  computed: {
    periodLabel() {
      if (this.appliedMonth === null) return ''
      return `${this.months[this.appliedMonth]} ${this.appliedYear}`
    },

    appliedStaffLabel() {
      if (!this.appliedStaff) return 'All Staff'
      const s = this.staffList.find(x => x.id === +this.appliedStaff)
      return s ? s.fullName : 'All Staff'
    },

    filteredLogs() {
      if (!this.generated) return []
      if (!this.appliedStaff) return this.attendanceLogs
      return this.attendanceLogs.filter(l => l.userID === +this.appliedStaff)
    },

    filteredStaffRows() {
      if (!this.generated) return []
      const staffScope = this.appliedStaff
        ? this.staffList.filter(s => s.id === +this.appliedStaff)
        : this.staffList

      return staffScope.map(s => {
        const logs       = this.attendanceLogs.filter(l => l.userID === s.id)
        const payroll    = this.payrollData.find(p => p.userID === s.id) || {}
        const hoursWorked = payroll.hoursWorked || 0
        const completed   = logs.filter(l => l.status === 'Completed' || l.status === 'Late').length
        // Pay per shift = hourlyRate × (hoursWorked / completedShifts)
        // avgHoursPerShift derived from actual attendance
        const avgHoursPerShift = completed > 0
          ? parseFloat((hoursWorked / completed).toFixed(2)) : 0
        const payPerShift  = parseFloat((s.hourlyRate * avgHoursPerShift).toFixed(2))
        const totalPay     = parseFloat((s.hourlyRate * hoursWorked).toFixed(2))

        return {
          userID:           s.id,
          fullName:         s.fullName,
          role:             s.role,
          hourlyRate:       s.hourlyRate,
          shiftsAssigned:   logs.length,
          completed:        logs.filter(l => l.status === 'Completed').length,
          late:             logs.filter(l => l.status === 'Late').length,
          missed:           logs.filter(l => l.status === 'Missed').length,
          hoursWorked,
          avgHoursPerShift,
          payPerShift,
          totalPay,
          payrollCreated:   !!payroll.isCreated,
          payrollReceived:  !!payroll.isReceived,
        }
      })
    },

    summaryCards() {
      const rows  = this.filteredStaffRows
      const logs  = this.filteredLogs
      const totalShifts      = logs.length
      const completedShifts  = logs.filter(l => l.status === 'Completed').length
      const lateShifts       = logs.filter(l => l.status === 'Late').length
      const missedShifts     = logs.filter(l => l.status === 'Missed').length
      const totalHours       = rows.reduce((s, r) => s + r.hoursWorked, 0)
      const totalPay         = rows.reduce((s, r) => s + r.totalPay, 0)
      const payrollCreated   = rows.filter(r => r.payrollCreated).length
      const attendRate       = totalShifts > 0
        ? Math.round(((completedShifts + lateShifts) / totalShifts) * 100) : 0
      const fmtRM = v => 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 })

      return [
        { label:'Total Staff',      value: rows.length,                           icon:'users',   color:'#6366f1' },
        { label:'Total Shifts',     value: totalShifts,                           icon:'clock',   color:'#0f172a' },
        { label:'Completed',        value: completedShifts,                       icon:'check',   color:'#10b981' },
        { label:'Late / Missed',    value: `${lateShifts} / ${missedShifts}`,    icon:'alert',   color:'#ef4444' },
        { label:'Total Hours',      value: totalHours.toFixed(2) + ' h',         icon:'clock',   color:'#3b82f6', sub:'from payroll records' },
        { label:'Total Payroll',    value: fmtRM(totalPay),                       icon:'dollar',  color:'#f59e0b', sub:'hourly rate × hours' },
        { label:'Payroll Created',  value: `${payrollCreated} / ${rows.length}`, icon:'dollar',  color:'#6366f1' },
        { label:'Attendance Rate',  value: attendRate + '%',                      icon:'percent', color:'#14b8a6', sub:'completed + late' },
      ]
    },
  },

  methods: {
    generateReport() {
      this.appliedMonth = this.selectedMonth
      this.appliedYear  = this.selectedYear
      this.appliedStaff = this.staffFilter
      this.generatedAt  = new Date().toLocaleString('en-MY', {
        day:'numeric', month:'short', year:'numeric',
        hour:'2-digit', minute:'2-digit',
      })
      this.generated = true
    },
    handlePrint() { window.print() },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex; min-height: 100vh;
  background: #eef0f5;
  font-family: 'DM Sans', sans-serif; color: #1e293b;
}

.report-main {
  flex: 1; padding: 28px 32px 60px;
  display: flex; flex-direction: column; gap: 24px; overflow-x: hidden;
}

/* Empty state */
.empty-state {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 80px 20px;
  background: #fff; border-radius: 16px;
  border: 1px dashed #e2e8f0; text-align: center;
}
.empty-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: #eef2ff; display: flex; align-items: center; justify-content: center;
  color: #6366f1; margin-bottom: 4px;
}
.empty-title { font-size: 16px; font-weight: 600; color: #1e293b; }
.empty-sub   { font-size: 13.5px; color: #94a3b8; max-width: 360px; line-height: 1.6; }
.empty-sub strong { color: #6366f1; }

/* Report doc */
.report-doc {
  background: #fff; border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04);
  padding: 40px 44px;
  display: flex; flex-direction: column; gap: 28px;
}

/* Doc Header — identical to AdminInventoryReport */
.doc-header { display: flex; justify-content: space-between; align-items: flex-start; }
.doc-header-left { display: flex; align-items: center; gap: 16px; }
.doc-logo {
  width: 46px; height: 46px; border-radius: 12px;
  background: #eef2ff; display: flex; align-items: center; justify-content: center;
  color: #6366f1; flex-shrink: 0;
}
.doc-store  { font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .06em; }
.doc-title  { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.doc-header-right { display: flex; flex-direction: column; gap: 5px; text-align: right; }
.doc-meta-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 10px; }
.meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; min-width: 64px; text-align: right; }
.meta-val   { font-size: 13px; color: #334155; font-weight: 500; }

.doc-divider { height: 1px; background: #f1f5f9; }

/* Print — identical to AdminInventoryReport */
@media print {
  @page { size: A4; margin: 16mm 14mm; }

  .no-print { display: none !important; }

  .app-layout  { display: block !important; background: #fff !important; }
  .report-main { padding: 0 !important; gap: 0 !important; }

  .report-doc {
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    gap: 16pt !important;
  }
  .doc-title  { font-size: 16pt !important; }
  .doc-store  { font-size: 8pt !important; }
  .meta-val   { font-size: 9pt !important; }
  .meta-label { font-size: 8pt !important; }
}

/* Responsive */
@media (max-width: 1100px) { .report-doc { padding: 28px; } }
@media (max-width: 768px) {
  .report-main { padding: 16px 14px 40px; }
  .report-doc  { padding: 20px 16px; }
  .doc-header  { flex-direction: column; gap: 16px; }
  .doc-header-right { text-align: left; }
  .doc-meta-row { justify-content: flex-start; }
}
</style>