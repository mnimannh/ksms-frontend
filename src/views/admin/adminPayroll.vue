<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="dashboard">

      <!-- Top bar -->
      <div class="topbar">
        <div>
          <span class="eyebrow">ADMINISTRATION</span>
          <h1 class="page-title">Payroll <span class="accent">Management</span></h1>
          <p class="page-sub">Generate monthly payroll based on shift attendance hours</p>
        </div>
        <div class="topbar-actions">
          <div class="period-selector">
            <select v-model="selectedMonth" class="sel" @change="fetchSummary">
              <option v-for="m in MONTHS" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
            <select v-model="selectedYear" class="sel" @change="fetchSummary">
              <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <button
            class="btn-generate-all"
            :disabled="pendingCount === 0 || generatingAll || !canGenerate"
            @click="generateAll"
          >
            <svg v-if="generatingAll" class="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
            {{ generatingAll ? 'Generating…' : `Generate All Pending (${pendingCount})` }}
          </button>
        </div>
      </div>

      <!-- Summary strip -->
      <div class="kpi-strip">
        <div class="kpi-card">
          <span class="kpi-label">Total Staff</span>
          <span class="kpi-val">{{ staffList.length }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Pending</span>
          <span class="kpi-val amber">{{ pendingCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Generated</span>
          <span class="kpi-val indigo">{{ generatedCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Received</span>
          <span class="kpi-val green">{{ receivedCount }}</span>
        </div>
        <div class="kpi-card">
          <span class="kpi-label">Total Payout</span>
          <span class="kpi-val indigo">{{ formatMoney(totalPayout) }}</span>
        </div>
      </div>

      <!-- Early-generation warning -->
      <div v-if="!canGenerate" class="early-warning">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <strong>Payroll not ready yet.</strong>
          {{ selectedMonthLabel }} {{ selectedYear }} hasn't ended — attendance data is still incomplete.
          Earliest you can generate is <strong>{{ earliestGenerateLabel }}</strong>.
        </div>
      </div>

      <!-- Search -->
      <div class="search-row">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="searchQuery" class="search-input" placeholder="Search staff…" />
        </div>
        <div class="filter-tabs">
          <button
            v-for="f in FILTERS" :key="f.key"
            class="filter-tab" :class="{ active: activeFilter === f.key }"
            @click="activeFilter = f.key"
          >{{ f.label }}</button>
        </div>
      </div>

      <!-- Table -->
      <div class="table-card">
        <div v-if="loading" class="loading-state">
          <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          <span>Loading payroll data…</span>
        </div>

        <template v-else>
          <template v-if="filteredList.length">
          <div class="table-scroll">
          <table class="payroll-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Staff</th>
                <th class="num">Hours Worked</th>
                <th class="num">Hourly Rate</th>
                <th class="num">Total Pay</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(s, index) in filteredList" :key="s.userID">
                <td class="td-num">{{ index + 1 }}</td>
                <td>
                  <div>
                    <p class="staff-name">{{ s.fullName }}</p>
                    <p class="staff-email">{{ s.email }}</p>
                  </div>
                </td>
                <td class="num mono">{{ Number(s.hoursWorked).toFixed(2) }}h</td>
                <td class="num mono">
                  <span v-if="s.hourlyRate">{{ formatMoney(s.hourlyRate) }}/hr</span>
                  <span v-else class="no-rate">No rate</span>
                </td>
                <td class="num mono strong">
                  <span v-if="s.hourlyRate">{{ formatMoney(s.hoursWorked * s.hourlyRate) }}</span>
                  <span v-else class="no-rate">—</span>
                </td>
                <td>
                  <span class="badge" :class="statusClass(s)">{{ statusLabel(s) }}</span>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-att" @click="openAttendance(s)" title="View attendance">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
                      </svg>
                      Attendance
                    </button>
                    <button
                      v-if="!s.isCreated && s.hourlyRate"
                      class="btn-gen"
                      :disabled="generatingId === s.userID || !canGenerate"
                      @click="generateOne(s)"
                    >
                      <svg v-if="generatingId === s.userID" class="spin" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                      </svg>
                      {{ generatingId === s.userID ? 'Generating…' : 'Generate' }}
                    </button>
                    <span v-else-if="!s.hourlyRate" class="no-rate-hint">Set rate first</span>
                    <span v-else class="done-mark">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Done
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
          </template>
          <div v-else class="empty-state">No staff match your filter.</div>
        </template>
      </div>

      <!-- Attendance modal -->
      <AttendanceLogModal
        :show="attModal.show"
        :logs="attModal.logs"
        :staffName="attModal.staffName"
        :staffDept="''"
        :monthLabel="attModal.monthLabel"
        @close="attModal.show = false"
      />

      <!-- Toast -->
      <Transition name="toast-fade">
        <div v-if="toast.show" class="toast" :class="toast.type">
          <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {{ toast.message }}
        </div>
      </Transition>

    </main>
  </div>
</template>

<script>
import axios from 'axios';
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue';
import AttendanceLogModal from '@/components/staff-payroll/AttendanceLogModal.vue';
import API_BASE_URL from '@/services/api';

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6'];

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
];

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'generated', label: 'Generated' },
  { key: 'received', label: 'Received' },
];

export default {
  name: 'AdminPayroll',
  components: { AdminSidebar, AttendanceLogModal },

  data() {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    const years = [];
    for (let y = yyyy; y >= yyyy - 3; y--) years.push(y);

    return {
      MONTHS,
      FILTERS,
      YEARS: years,
      selectedMonth: mm,
      selectedYear: yyyy,

      staffList: [],
      loading: false,
      generatingId: null,
      generatingAll: false,

      searchQuery: '',
      activeFilter: 'all',

      toast: { show: false, message: '', type: 'success' },
      attModal: { show: false, logs: [], staffName: '', monthLabel: '' },
    };
  },

  computed: {
    monthStr() {
      return `${this.selectedYear}-${this.selectedMonth}`;
    },
    canGenerate() {
      const now = new Date();
      const currentYear  = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const selYear  = Number(this.selectedYear);
      const selMonth = Number(this.selectedMonth);
      return selYear < currentYear || (selYear === currentYear && selMonth < currentMonth);
    },
    selectedMonthLabel() {
      return MONTHS.find(m => m.value === this.selectedMonth)?.label ?? '';
    },
    earliestGenerateLabel() {
      const selYear  = Number(this.selectedYear);
      const selMonth = Number(this.selectedMonth);
      const nextMonth = selMonth === 12 ? 1 : selMonth + 1;
      const nextYear  = selMonth === 12 ? selYear + 1 : selYear;
      const label = MONTHS.find(m => m.value === String(nextMonth).padStart(2, '0'))?.label ?? '';
      return `1 ${label} ${nextYear}`;
    },
    pendingCount()   { return this.staffList.filter(s => !s.isCreated).length; },
    generatedCount() { return this.staffList.filter(s => s.isCreated && !s.isReceived).length; },
    receivedCount()  { return this.staffList.filter(s => s.isReceived).length; },
    totalPayout() {
      return this.staffList
        .filter(s => s.isCreated)
        .reduce((sum, s) => sum + Number(s.totalPay || 0), 0);
    },
    filteredList() {
      const q = this.searchQuery.toLowerCase();
      return this.staffList.filter(s => {
        if (q && !s.fullName.toLowerCase().includes(q) && !s.email.toLowerCase().includes(q)) return false;
        if (this.activeFilter === 'pending'   && s.isCreated)  return false;
        if (this.activeFilter === 'generated' && (!s.isCreated || s.isReceived)) return false;
        if (this.activeFilter === 'received'  && !s.isReceived) return false;
        return true;
      });
    },
  },

  mounted() {
    this.fetchSummary();
  },

  methods: {
    async fetchSummary() {
      this.loading = true;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/payroll/month/${this.monthStr}`);
        this.staffList = res.data;
      } catch (err) {
        this.showToast('Failed to load payroll data.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async generateOne(s) {
      this.generatingId = s.userID;
      try {
        const totalPay = Number(s.hoursWorked) * Number(s.hourlyRate);
        const token = localStorage.getItem('userToken');
        await axios.post(`${API_BASE_URL}/api/payroll/generate`, {
          userID: s.userID,
          month: this.monthStr,
          hoursWorked: s.hoursWorked,
          totalPay: totalPay.toFixed(2),
        }, { headers: { Authorization: `Bearer ${token}` } });
        this.showToast(`Payroll generated for ${s.fullName}.`, 'success');
        await this.fetchSummary();
      } catch (err) {
        this.showToast('Failed to generate payroll.', 'error');
      } finally {
        this.generatingId = null;
      }
    },

    async generateAll() {
      const pending = this.staffList.filter(s => !s.isCreated && s.hourlyRate);
      if (!pending.length) return;
      this.generatingAll = true;
      try {
        const token = localStorage.getItem('userToken');
        const records = pending.map(s => ({
          userID: s.userID,
          hoursWorked: s.hoursWorked,
          totalPay: (Number(s.hoursWorked) * Number(s.hourlyRate)).toFixed(2),
        }));
        await axios.post(`${API_BASE_URL}/api/payroll/generate-all`, {
          month: this.monthStr,
          records,
        }, { headers: { Authorization: `Bearer ${token}` } });
        this.showToast(`${pending.length} payroll(s) generated.`, 'success');
        await this.fetchSummary();
      } catch (err) {
        this.showToast('Failed to generate all payrolls.', 'error');
      } finally {
        this.generatingAll = false;
      }
    },

    statusLabel(s) {
      if (s.isReceived) return 'Received';
      if (s.isCreated)  return 'Generated';
      return 'Pending';
    },
    statusClass(s) {
      if (s.isReceived) return 'green';
      if (s.isCreated)  return 'indigo';
      return 'amber';
    },
    avatarColor(name) {
      return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
    },
    formatMoney(val) {
      return 'RM ' + Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    async openAttendance(s) {
      const monthLabel = (this.MONTHS.find(m => m.value === this.selectedMonth)?.label || '') + ' ' + this.selectedYear;
      this.attModal = { show: true, logs: [], staffName: s.fullName, monthLabel };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/attendance/user/${s.userID}/month/${this.monthStr}`);
        this.attModal.logs = res.data;
      } catch (err) {
        this.showToast('Failed to load attendance.', 'error');
      }
    },

    showToast(message, type = 'success') {
      this.toast = { show: true, message, type };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
}

/* ── Base (mobile) ── */
.dashboard {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px;
  overflow-x: hidden;
}

.topbar {
  display: flex; flex-direction: column; gap: 12px;
}
.eyebrow {
  display: block; font-size: 11px; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase;
  color: #94a3b8; margin-bottom: 4px;
}
.page-title {
  font-size: 22px; font-weight: 700;
  color: #0f172a; letter-spacing: -.025em; margin-bottom: 4px;
}
.accent { color: #6366f1; }
.page-sub { font-size: 13px; color: #64748b; }

.topbar-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.period-selector { display: flex; gap: 6px; }
.sel {
  padding: 8px 10px; border-radius: 9px;
  border: 1px solid #e2e8f0; background: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: #374151;
  cursor: pointer; outline: none; transition: border-color .15s;
}
.sel:focus { border-color: #6366f1; }

.btn-generate-all {
  display: flex; align-items: center; gap: 7px;
  background: #6366f1; color: #fff; border: none;
  border-radius: 9px; padding: 9px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background .15s, transform .1s;
  white-space: nowrap;
}
.btn-generate-all:hover:not(:disabled) { background: #4f46e5; transform: translateY(-1px); }
.btn-generate-all:disabled { opacity: .5; cursor: not-allowed; }

/* KPI strip — 2 col on mobile */
.kpi-strip {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.kpi-card {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; padding: 14px 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  display: flex; flex-direction: column; gap: 4px;
}
.kpi-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; }
.kpi-val { font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'DM Mono', monospace; }
.kpi-val.amber  { color: #b45309; }
.kpi-val.indigo { color: #6366f1; }
.kpi-val.green  { color: #15803d; }

/* Search / filter — stacked on mobile */
.search-row { display: flex; flex-direction: column; gap: 10px; }
.search-wrap { position: relative; width: 100%; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
.search-input {
  width: 100%; padding: 9px 12px 9px 32px;
  border: 1px solid #e2e8f0; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: #0f172a;
  background: #fff; outline: none; transition: border-color .15s;
}
.search-input:focus { border-color: #6366f1; }
.filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
.filter-tab {
  padding: 7px 12px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 500;
  color: #64748b; cursor: pointer; transition: all .15s;
}
.filter-tab.active { background: #6366f1; border-color: #6366f1; color: #fff; }

/* Early warning banner */
.early-warning {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fffbeb; border: 1px solid #fde68a;
  border-radius: 10px; padding: 13px 16px;
  font-size: 13px; color: #92400e; line-height: 1.5;
}
.early-warning svg { flex-shrink: 0; margin-top: 1px; color: #d97706; }
.early-warning strong { font-weight: 600; }

/* Table card */
.table-card {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.table-scroll { overflow-x: auto; }
.payroll-table { width: 100%; border-collapse: collapse; min-width: 640px; }
.payroll-table th {
  padding: 11px 14px; text-align: left;
  font-size: 11px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
  background: #f8fafc; border-bottom: 1px solid #f1f5f9;
}
.payroll-table th.num { text-align: right; }
.payroll-table td {
  padding: 12px 14px; font-size: 13px; color: #1e293b;
  border-bottom: 1px solid #f8fafc;
}
.payroll-table tr:last-child td { border-bottom: none; }
.payroll-table tr:hover td { background: #fafbff; }
.payroll-table td.num { text-align: right; }
.mono { font-family: 'DM Mono', monospace; }
.strong { font-weight: 600; }

.staff-cell { display: flex; align-items: center; gap: 10px; }
.avatar {
  width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
}
.staff-name  { font-size: 13px; font-weight: 600; color: #0f172a; }
.staff-email { font-size: 11px; color: #94a3b8; margin-top: 1px; }

.badge {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 6px;
  font-size: 11.5px; font-weight: 600;
}
.badge.amber  { background: #fffbeb; color: #b45309; }
.badge.indigo { background: #eef2ff; color: #4338ca; }
.badge.green  { background: #f0fdf4; color: #15803d; }

.btn-gen {
  display: inline-flex; align-items: center; gap: 6px;
  background: #eef2ff; color: #4338ca;
  border: 1px solid #c7d2fe; border-radius: 7px;
  padding: 6px 11px; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all .15s;
}
.btn-gen:hover:not(:disabled) { background: #6366f1; color: #fff; border-color: #6366f1; }
.btn-gen:disabled { opacity: .5; cursor: not-allowed; }

.done-mark {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12.5px; font-weight: 600; color: #15803d;
}
.no-rate { color: #cbd5e1; font-size: 12.5px; }
.no-rate-hint { font-size: 11.5px; color: #94a3b8; font-style: italic; }

.action-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.btn-att {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f8fafc; color: #475569;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 5px 9px; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all .15s;
}
.btn-att:hover { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }

.loading-state, .empty-state {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 48px 20px; color: #94a3b8; font-size: 13.5px;
}

/* Toast — full width on mobile */
.toast {
  position: fixed; bottom: 20px; left: 16px; right: 16px;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  font-size: 13.5px; font-weight: 500; color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.15); z-index: 9999;
}
.toast.success { background: #10b981; }
.toast.error   { background: #ef4444; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all .25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(12px); }

.spin { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tablet (≥600px) ── */
@media (min-width: 600px) {
  .dashboard { gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-start; justify-content: space-between; }
  .page-title { font-size: 24px; }
  .kpi-strip { grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .kpi-val { font-size: 22px; }
  .search-row { flex-direction: row; align-items: center; }
  .search-wrap { flex: 1; min-width: 180px; width: auto; }
  .toast {
    left: auto; right: 28px; width: auto;
    white-space: nowrap;
  }
  .toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(12px); }
}

/* ── Desktop (≥900px) ── */
@media (min-width: 900px) {
  .dashboard { padding: 32px 36px 48px; gap: 20px; }
  .page-title { font-size: 26px; }
  .kpi-strip { grid-template-columns: repeat(5, 1fr); }
  .kpi-card { padding: 16px 18px; }
  .kpi-label { font-size: 11px; }
  .payroll-table th { padding: 11px 16px; }
  .payroll-table td { padding: 13px 16px; font-size: 13.5px; }
  .staff-name { font-size: 13.5px; }
  .avatar { width: 34px; height: 34px; }
}
</style>
