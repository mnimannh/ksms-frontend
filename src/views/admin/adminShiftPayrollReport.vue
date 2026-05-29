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

      <!-- Error state -->
      <div v-if="error" class="error-banner">{{ error }}</div>

      <!-- Empty state -->
      <div v-if="!generated && !generating" class="empty-state">
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

      <!-- Loading state -->
      <div v-if="generating" class="empty-state">
        <div class="empty-icon">
          <svg class="spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <p class="empty-title">Generating report…</p>
      </div>

      <!-- Report Document -->
      <div v-else-if="generated" class="report-doc" id="report-document">

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
import axios from 'axios'
import API_BASE_URL from '@/services/api'
import AdminSidebar       from '@/components/sidebar/adminSidebar.vue'
import ShiftReportToolbar     from '@/components/admin-shiftpayrollreport/ShiftReportToolbar.vue'
import ShiftReportSummary     from '@/components/admin-shiftpayrollreport/ShiftReportSummary.vue'
import ReportStaffTable       from '@/components/admin-shiftpayrollreport/ReportStaffTable.vue'
import ReportAttendanceLog    from '@/components/admin-shiftpayrollreport/ReportAttendanceLog.vue'
import ReportPayrollBreakdown from '@/components/admin-shiftpayrollreport/ReportPayrollBreakdown.vue'

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
      generating:   false,
      generatedAt:  '',
      error:        '',

      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      years,

      staffList:      [],
      attendanceLogs: [],
      payrollData:    [],
    }
  },

  computed: {
    monthStr() {
      if (this.appliedMonth === null) return ''
      return `${this.appliedYear}-${String(this.appliedMonth + 1).padStart(2, '0')}`
    },

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
      if (!this.appliedStaff) return this.payrollData
      return this.payrollData.filter(r => r.userID === +this.appliedStaff)
    },

    summaryCards() {
      const rows = this.filteredStaffRows
      const logs = this.filteredLogs
      const totalShifts     = logs.length
      const completedShifts = logs.filter(l => l.status === 'Completed').length
      const lateShifts      = logs.filter(l => l.status === 'Late').length
      const missedShifts    = logs.filter(l => l.status === 'Missed').length
      const totalHours      = rows.reduce((s, r) => s + r.hoursWorked, 0)
      const totalPay        = rows.reduce((s, r) => s + r.totalPay, 0)
      const payrollCreated  = rows.filter(r => r.payrollCreated).length
      const attendRate      = totalShifts > 0
        ? Math.round(((completedShifts + lateShifts) / totalShifts) * 100) : 0
      const fmtRM = v => 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 })

      return [
        { label:'Total Staff',     value: rows.length,                           icon:'users',   color:'#6366f1' },
        { label:'Total Shifts',    value: totalShifts,                           icon:'clock',   color:'#0f172a' },
        { label:'Completed',       value: completedShifts,                       icon:'check',   color:'#10b981' },
        { label:'Late / Missed',   value: `${lateShifts} / ${missedShifts}`,    icon:'alert',   color:'#ef4444' },
        { label:'Total Hours',     value: totalHours.toFixed(2) + ' h',         icon:'clock',   color:'#3b82f6', sub:'from payroll records' },
        { label:'Total Payroll',   value: fmtRM(totalPay),                       icon:'dollar',  color:'#f59e0b', sub:'hourly rate × hours' },
        { label:'Payroll Created', value: `${payrollCreated} / ${rows.length}`, icon:'dollar',  color:'#6366f1' },
        { label:'Attendance Rate', value: attendRate + '%',                      icon:'percent', color:'#14b8a6', sub:'completed + late' },
      ]
    },
  },

  async created() {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/reports/shift-payroll/staff`)
      this.staffList = data.data
    } catch (err) {
      console.error('Failed to load staff list', err)
    }
  },

  methods: {
    async generateReport() {
      this.generating = true
      this.error = ''
      const month = `${this.selectedYear}-${String(this.selectedMonth + 1).padStart(2, '0')}`
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/reports/shift-payroll`, {
          params: { month },
        })
        this.payrollData    = data.data.staffRows
        this.attendanceLogs = data.data.attendanceLogs
        this.appliedMonth   = this.selectedMonth
        this.appliedYear    = this.selectedYear
        this.appliedStaff   = this.staffFilter
        this.generatedAt    = new Date().toLocaleString('en-MY', {
          day:'numeric', month:'short', year:'numeric',
          hour:'2-digit', minute:'2-digit',
        })
        this.generated = true
      } catch (err) {
        this.error = 'Failed to load report data. Please try again.'
        console.error(err)
      } finally {
        this.generating = false
      }
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

/* Error banner */
.error-banner {
  padding: 12px 16px; border-radius: 10px;
  background: #fef2f2; border: 1px solid #fecaca;
  color: #dc2626; font-size: 13.5px; font-weight: 500;
}

/* Spinner */
.spin { animation: spin .7s linear infinite; color: #6366f1; }
@keyframes spin { to { transform: rotate(360deg); } }

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