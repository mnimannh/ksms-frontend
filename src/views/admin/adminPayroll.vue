<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="main-content">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <span class="header-eyebrow">ADMINISTRATION</span>
          <h1 class="page-title">Payroll Management</h1>
          <p class="page-subtitle">Calculate and generate payroll based on staff attendance logs</p>
        </div>
      </div>

      <!-- Summary Cards -->
      <PayrollSummaryCards :staffList="staffList" />

      <!-- Controls: search, filter, period, generate-all -->
      <PayrollControls
        v-model:searchQuery="searchQuery"
        v-model:activeFilter="activeFilter"
        v-model:selectedMonth="selectedMonth"
        v-model:selectedYear="selectedYear"
        :pendingCount="pendingCount"
        :isGeneratingAll="isGeneratingAll"
        :months="MONTHS"
        :years="YEARS"
        :filterCounts="filterCounts"
        @generate-all="handleGenerateAll"
      />

      <!-- Payroll Table -->
      <PayrollTable
        :staffList="filteredStaff"
        @generate="openGenerateModal"
        @view="handleView"
        @view-log="openLogModal"
      />

      <!-- Generate Payroll Modal -->
      <GeneratePayrollModal
        :show="showGenerateModal"
        :staff="selectedStaff"
        :periodLabel="currentPeriodLabel"
        :isProcessing="isProcessing"
        @close="closeGenerateModal"
        @confirm="handleConfirmGenerate"
      />

      <!-- Attendance Log Modal -->
      <AttendanceLogModal
        :show="showLogModal"
        :staff="logStaff"
        :periodLabel="currentPeriodLabel"
        @close="showLogModal = false"
      />

      <!-- Toast Notification -->
      <PayrollToast
        :show="toast.show"
        :message="toast.message"
        :type="toast.type"
      />

    </main>
  </div>
</template>

<script>
import AdminSidebar         from '@/components/sidebar/AdminSidebar.vue'
import PayrollSummaryCards  from '@/components/admin-payroll/PayrollSummaryCards.vue'
import PayrollControls      from '@/components/admin-payroll/PayrollControls.vue'
import PayrollTable         from '@/components/admin-payroll/PayrollTable.vue'
import GeneratePayrollModal from '@/components/admin-payroll/GeneratePayrollModal.vue'
import AttendanceLogModal   from '@/components/admin-payroll/AttendanceLogModal.vue'
import PayrollToast         from '@/components/admin-payroll/PayrollToast.vue'

import { MONTHS, YEARS, STAFF_LIST } from '@/data/payrollData.js'

export default {
  name: 'AdminPayroll',

  components: {
    AdminSidebar,
    PayrollSummaryCards,
    PayrollControls,
    PayrollTable,
    GeneratePayrollModal,
    AttendanceLogModal,
    PayrollToast,
  },

  data() {
    const now = new Date()
    return {
      // Period
      selectedMonth: now.getMonth() + 1,
      selectedYear:  now.getFullYear(),
      MONTHS,
      YEARS,

      // Staff data (reactive copy)
      staffList: STAFF_LIST.map(s => ({ ...s, attendance: { ...s.attendance } })),

      // Filters
      searchQuery:  '',
      activeFilter: 'all',

      // Modals
      showGenerateModal: false,
      showLogModal:      false,
      selectedStaff:     null,
      logStaff:          null,

      // State
      isProcessing:    false,
      isGeneratingAll: false,

      // Toast
      toast: { show: false, message: '', type: 'success' },
    }
  },

  computed: {
    currentPeriodLabel() {
      const m = this.MONTHS.find(x => x.value === this.selectedMonth)
      return `${m?.label} ${this.selectedYear}`
    },

    filteredStaff() {
      const q = this.searchQuery.toLowerCase()
      return this.staffList.filter(s => {
        const matchSearch = !q
          || s.name.toLowerCase().includes(q)
          || s.department.toLowerCase().includes(q)
        const matchFilter = this.activeFilter === 'all'
          || s.payrollStatus === this.activeFilter
        return matchSearch && matchFilter
      })
    },

    pendingCount() {
      return this.staffList.filter(s => s.payrollStatus === 'pending').length
    },

    filterCounts() {
      return {
        all:       this.staffList.length,
        pending:   this.staffList.filter(s => s.payrollStatus === 'pending').length,
        generated: this.staffList.filter(s => s.payrollStatus === 'generated').length,
        received:  this.staffList.filter(s => s.payrollStatus === 'received').length,
      }
    },
  },

  methods: {
    // ── Generate single ──────────────────────────────────────────
    openGenerateModal(staff) {
      this.selectedStaff = staff
      this.showGenerateModal = true
    },
    closeGenerateModal() {
      this.showGenerateModal = false
      this.selectedStaff = null
    },
    handleConfirmGenerate({ notes }) {
      this.isProcessing = true
      // Simulate async API call
      setTimeout(() => {
        const s = this.staffList.find(x => x.userID === this.selectedStaff.userID)
        if (s) s.payrollStatus = 'generated'
        this.isProcessing = false
        this.closeGenerateModal()
        this.showToast(`Payroll generated for ${s.name} — ${s.hoursWorked}h logged.`, 'success')
      }, 1400)
    },

    // ── Generate all pending ──────────────────────────────────────
    handleGenerateAll() {
      const pending = this.staffList.filter(s => s.payrollStatus === 'pending')
      if (!pending.length) {
        this.showToast('No pending payrolls to generate.', 'info')
        return
      }
      this.isGeneratingAll = true
      setTimeout(() => {
        pending.forEach(s => { s.payrollStatus = 'generated' })
        this.isGeneratingAll = false
        this.showToast(`${pending.length} payroll(s) generated successfully.`, 'success')
      }, 1800)
    },

    // ── View generated payroll ────────────────────────────────────
    handleView(staff) {
      this.showToast(`Payroll for ${staff.name} is already ${staff.payrollStatus}.`, 'info')
    },

    // ── Attendance log ────────────────────────────────────────────
    openLogModal(staff) {
      this.logStaff    = staff
      this.showLogModal = true
    },

    // ── Toast helper ──────────────────────────────────────────────
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type }
      setTimeout(() => { this.toast.show = false }, 3500)
    },
  },
}
</script>

<style>
/* Global font import — put in main.js or App.vue if already imported */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  font-family: 'DM Sans', sans-serif;
  background: #f8f9fb;
  color: #1e293b;
  -webkit-font-smoothing: antialiased;
}
</style>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fb;
}

.main-content {
  flex: 1;
  padding: 36px 40px;
  overflow-x: hidden;
  max-width: 100%;
}

/* Page Header */
.page-header {
  margin-bottom: 28px;
}
.header-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 4px;
}
.page-title {
  font-size: 24px; font-weight: 600;
  color: #0f172a; letter-spacing: -.02em;
  margin-bottom: 4px;
}
.page-subtitle {
  font-size: 13.5px; color: #64748b;
}

@media (max-width: 700px) {
  .main-content { padding: 20px 16px; }
}
</style>