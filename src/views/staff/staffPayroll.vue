<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="dashboard">

      <!-- ── TOP BAR ────────────────────────────────────────── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ todayFull }}</p>
          <h1 class="topbar-title">My <span class="accent">Payroll</span></h1>
          <p class="topbar-sub">View your monthly hours and payroll status</p>
        </div>
        <div class="topbar-right">

        </div>
      </div>

      <!-- ── SUMMARY CARDS ──────────────────────────────────── -->
      <PayrollSummaryCards :records="payrollRecords" />

      <!-- ── CURRENT MONTH HIGHLIGHT ────────────────────────── -->
      <div class="panel current-month-panel">
        <div class="card-header">
          <div>
            <p class="card-title">Current Period</p>
            <p class="card-sub">{{ currentRecord.monthLabel }}</p>
          </div>
          <span class="badge"
            :class="currentRecord.isReceived ? 'green' : currentRecord.isCreated ? 'blue' : 'amber'">
            {{ currentRecord.isReceived ? 'Received' : currentRecord.isCreated ? 'Generated' : 'Pending' }}
          </span>
        </div>

        <div class="current-body">
          <!-- Big hours number -->
          <div class="current-hours">
            <span class="ch-val">{{ currentRecord.hoursWorked }}<span class="ch-unit">h</span></span>
            <span class="ch-label">hours logged this month</span>
            <div class="ch-bar">
              <div class="ch-fill" :style="`width:${Math.min((currentRecord.hoursWorked/200)*100,100)}%`" />
            </div>
            <div class="ch-legend"><span>0h</span><span>200h target</span></div>
          </div>

          <!-- Progress steps -->
          <div class="current-progress">
            <p class="prog-eyebrow">Payroll Status</p>
            <div class="progress-track">
              <div class="prog-step active">
                <div class="prog-dot filled" />
                <span>Logged</span>
              </div>
              <div class="prog-line" :class="{ filled: currentRecord.isCreated }" />
              <div class="prog-step" :class="{ active: currentRecord.isCreated }">
                <div class="prog-dot" :class="{ filled: currentRecord.isCreated }" />
                <span>Generated</span>
              </div>
              <div class="prog-line" :class="{ filled: currentRecord.isReceived }" />
              <div class="prog-step" :class="{ active: currentRecord.isReceived }">
                <div class="prog-dot" :class="{ filled: currentRecord.isReceived }" />
                <span>Received</span>
              </div>
            </div>

            <div class="prog-note" v-if="!currentRecord.isCreated">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Payroll is pending admin approval. You will be notified once generated.
            </div>
            <div class="prog-note success" v-else-if="currentRecord.isReceived">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Payroll received. Check with your manager for details.
            </div>
            <div class="prog-note info" v-else>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              Payroll generated. Awaiting disbursement.
            </div>
          </div>
        </div>
      </div>

      <!-- ── HISTORY TABLE ──────────────────────────────────── -->
      <PayrollHistoryTable
        :records="payrollRecords"
        @view="openDetailModal"
      />

      <!-- ── DETAIL MODAL ───────────────────────────────────── -->
      <PayrollDetailModal
        :show="showModal"
        :record="selectedRecord"
        @close="showModal = false"
      />

    </main>
  </div>
</template>

<script>
import StaffSidebar       from '@/components/sidebar/staffSidebar.vue'
import PayrollSummaryCards from '@/components/staff-payroll/PayrollSummaryCards.vue'
import PayrollHistoryTable from '@/components/staff-payroll/PayrollHistoryTable.vue'
import PayrollDetailModal  from '@/components/staff-payroll/PayrollDetailModal.vue'

import { CURRENT_STAFF, PAYROLL_RECORDS } from '@/data/staffPayrollData.js'

export default {
  name: 'StaffPayroll',
  components: {
    StaffSidebar,
    PayrollSummaryCards,
    PayrollHistoryTable,
    PayrollDetailModal,
  },

  data() {
    const now = new Date()
    return {
      todayFull: now.toLocaleDateString('en-MY', {
        weekday:'long', day:'numeric', month:'long', year:'numeric',
      }),

      staff: CURRENT_STAFF,
      payrollRecords: PAYROLL_RECORDS,

      showModal:      false,
      selectedRecord: null,
    }
  },

  computed: {
    // Most recent record = current month
    currentRecord() {
      return this.payrollRecords[0] ?? null
    },
  },

  methods: {
    openDetailModal(record) {
      this.selectedRecord = record
      this.showModal = true
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

.app-layout {
  display:flex; min-height:100vh;
  background:#f6f7fb;
  font-family:'DM Sans', sans-serif;
  color:#1e293b;
}
.dashboard {
  flex:1; padding:32px 36px 48px;
  overflow-x:hidden;
  display:flex; flex-direction:column; gap:20px;
}

/* ── Top Bar ───────────────────────────────────────────────────── */
.topbar {
  display:flex; align-items:flex-start;
  justify-content:space-between;
  flex-wrap:wrap; gap:16px;
}
.topbar-date { font-size:12px; color:#94a3b8; margin-bottom:4px; }
.topbar-title {
  font-size:26px; font-weight:600;
  color:#0f172a; letter-spacing:-.025em; margin-bottom:4px;
}
.topbar-title .accent { color:#6366f1; }
.topbar-sub { font-size:13px; color:#64748b; }


.staff-avatar {
  width:36px; height:36px; border-radius:9px;
  display:flex; align-items:center; justify-content:center;
  font-size:13px; font-weight:600; color:#fff; flex-shrink:0;
}
.staff-name { display:block; font-size:13.5px; font-weight:600; color:#0f172a; }
.staff-dept { display:block; font-size:11.5px; color:#94a3b8; margin-top:1px; }

/* ── Panel base ────────────────────────────────────────────────── */
.panel {
  background:#fff;
  border:1px solid #f1f5f9;
  border-radius:14px;
  padding:20px 22px;
  box-shadow:0 1px 3px rgba(0,0,0,.04);
}
.card-header {
  display:flex; align-items:flex-start;
  justify-content:space-between;
  margin-bottom:20px; gap:12px;
}
.card-title { font-size:14.5px; font-weight:600; color:#0f172a; margin-bottom:2px; }
.card-sub   { font-size:12px; color:#94a3b8; }

.badge {
  display:inline-flex; align-items:center;
  padding:4px 11px; border-radius:6px;
  font-size:12px; font-weight:600; white-space:nowrap; flex-shrink:0;
}
.badge.blue  { background:#eff6ff; color:#1d4ed8; }
.badge.green { background:#f0fdf4; color:#15803d; }
.badge.amber { background:#fffbeb; color:#b45309; }

/* ── Current Month Panel ───────────────────────────────────────── */
.current-body {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:24px;
}

.current-hours {
  background:#f8fafc; border-radius:12px; padding:20px 22px;
}
.ch-val  { font-size:48px; font-weight:700; color:#0f172a; letter-spacing:-.04em; }
.ch-unit { font-size:22px; font-weight:500; color:#94a3b8; }
.ch-label {
  display:block; font-size:13px; color:#64748b;
  margin-top:4px; margin-bottom:16px;
}
.ch-bar {
  height:6px; background:#e2e8f0; border-radius:99px;
  overflow:hidden; margin-bottom:6px;
}
.ch-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6);
  transition:width .6s ease;
}
.ch-legend {
  display:flex; justify-content:space-between;
  font-size:11px; color:#94a3b8;
  font-family:'DM Mono',monospace;
}

/* Progress in current panel */
.current-progress { padding:4px 0; }
.prog-eyebrow {
  font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.07em;
  margin-bottom:16px;
}
.progress-track { display:flex; align-items:center; margin-bottom:16px; }
.prog-step { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }
.prog-step span { font-size:11px; color:#94a3b8; white-space:nowrap; }
.prog-step.active span { color:#475569; font-weight:500; }
.prog-dot {
  width:10px; height:10px; border-radius:50%;
  border:2px solid #e2e8f0; background:#fff; transition:all .3s;
}
.prog-dot.filled { background:#0f172a; border-color:#0f172a; }
.prog-line {
  flex:1; height:2px; background:#e2e8f0;
  margin-bottom:18px; transition:background .3s;
}
.prog-line.filled { background:#0f172a; }

.prog-note {
  display:flex; align-items:flex-start; gap:7px;
  font-size:12.5px; color:#64748b; line-height:1.55;
  background:#f8fafc; border-radius:8px; padding:10px 12px;
}
.prog-note.success { background:#f0fdf4; color:#15803d; }
.prog-note.info    { background:#eff6ff; color:#1d4ed8; }

/* ── Responsive ────────────────────────────────────────────────── */
@media(max-width:900px) {
  .current-body { grid-template-columns:1fr; }
}
@media(max-width:768px) {
  .dashboard { padding:20px 18px 40px; }
  .topbar    { flex-direction:column; }
}
@media(max-width:560px) {
  .topbar-title { font-size:20px; }
}
</style>