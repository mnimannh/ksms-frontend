<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="dashboard">

      <!-- Top bar -->
      <div class="topbar">
        <div>
          <span class="eyebrow">{{ todayFull }}</span>
          <h1 class="page-title">My <span class="accent">Payroll</span></h1>
          <p class="page-sub">View your monthly hours and payroll status</p>
        </div>
      </div>

      <!-- Rate card -->
      <div class="rate-card">
        <div class="rate-card-left">
          <div class="rate-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          </div>
          <div>
            <p class="rate-label">My Hourly Rate</p>
            <p class="rate-val" v-if="currentRate">
              {{ formatMoney(currentRate.rate) }}<span class="rate-unit">/hr</span>
            </p>
            <p class="rate-val no-rate" v-else>Not set yet</p>
          </div>
        </div>
        <div class="rate-card-right">
          <div class="rate-since" v-if="currentRate">
            <span class="rate-since-label">Effective from</span>
            <span class="rate-since-val">{{ formatDate(currentRate.effective_from) }}</span>
          </div>
          <button class="btn-rate-history" @click="showRateHistory = !showRateHistory" v-if="rateHistory.length > 1">
            {{ showRateHistory ? 'Hide history' : `History (${rateHistory.length})` }}
          </button>
        </div>
      </div>

      <!-- Rate history dropdown -->
      <div class="rate-history-panel" v-if="showRateHistory && rateHistory.length">
        <p class="rh-title">Rate History</p>
        <div class="rh-list">
          <div v-for="r in rateHistory" :key="r.id" class="rh-row">
            <span class="rh-rate">{{ formatMoney(r.rate) }}/hr</span>
            <span class="rh-date">Effective {{ formatDate(r.effective_from) }}</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <svg class="spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2.5">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Loading payroll…
      </div>

      <template v-else>

        <!-- KPI strip -->
        <div class="kpi-strip">
          <div class="kpi-card">
            <span class="kpi-label">Total Months</span>
            <span class="kpi-val">{{ records.length }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total Earned</span>
            <span class="kpi-val indigo">{{ formatMoney(totalEarned) }}</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Total Hours</span>
            <span class="kpi-val">{{ totalHours.toFixed(1) }}h</span>
          </div>
          <div class="kpi-card">
            <span class="kpi-label">Pending</span>
            <span class="kpi-val amber">{{ pendingCount }}</span>
          </div>
        </div>

        <!-- Current month panel -->
        <div class="panel" v-if="latestRecord">
          <div class="panel-header">
            <div>
              <p class="panel-title">Current Period</p>
              <p class="panel-sub">{{ monthLabel(latestRecord.month) }}</p>
            </div>
            <span class="badge" :class="statusClass(latestRecord)">{{ statusLabel(latestRecord) }}</span>
          </div>

          <div class="current-body">
            <!-- Hours + pay -->
            <div class="hours-block">
              <div class="big-val">
                {{ Number(latestRecord.hoursWorked).toFixed(1) }}<span class="big-unit">h</span>
              </div>
              <p class="hours-label">hours logged this month</p>
              <div class="bar-wrap">
                <div class="bar-fill" :style="`width:${Math.min((latestRecord.hoursWorked/200)*100,100)}%`" />
              </div>
              <div class="bar-legend"><span>0h</span><span>200h target</span></div>
              <div class="pay-row" v-if="latestRecord.isCreated">
                <span class="pay-label">Total Pay</span>
                <span class="pay-val">{{ formatMoney(latestRecord.totalPay) }}</span>
              </div>
              <div class="pay-row estimate" v-else-if="latestRecord.hourlyRate">
                <span class="pay-label">Estimated Pay</span>
                <span class="pay-val">{{ formatMoney(latestRecord.hoursWorked * latestRecord.hourlyRate) }}</span>
              </div>
            </div>

            <!-- Progress + action -->
            <div class="progress-block">
              <p class="prog-eyebrow">Payroll Status</p>
              <div class="prog-track">
                <div class="prog-step active">
                  <div class="prog-dot filled" />
                  <span>Logged</span>
                </div>
                <div class="prog-line" :class="{ filled: latestRecord.isCreated }" />
                <div class="prog-step" :class="{ active: latestRecord.isCreated }">
                  <div class="prog-dot" :class="{ filled: latestRecord.isCreated }" />
                  <span>Generated</span>
                </div>
                <div class="prog-line" :class="{ filled: latestRecord.isReceived }" />
                <div class="prog-step" :class="{ active: latestRecord.isReceived }">
                  <div class="prog-dot" :class="{ filled: latestRecord.isReceived }" />
                  <span>Received</span>
                </div>
              </div>

              <div class="prog-note" v-if="!latestRecord.isCreated">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Payroll is pending admin approval.
              </div>
              <div class="prog-note success" v-else-if="latestRecord.isReceived">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Payroll received. Thank you!
              </div>
              <div class="prog-note info" v-else>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                Payroll has been generated. Check with your manager.
              </div>

              <!-- Mark received button -->
              <button
                v-if="latestRecord.isCreated && !latestRecord.isReceived"
                class="btn-received"
                :disabled="markingId === latestRecord.id"
                @click="markReceived(latestRecord)"
              >
                <svg v-if="markingId === latestRecord.id" class="spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {{ markingId === latestRecord.id ? 'Confirming…' : 'Mark as Received' }}
              </button>
            </div>
          </div>
        </div>

        <!-- History table -->
        <div class="panel" v-if="records.length > 0">
          <div class="history-header">
            <p class="panel-title">Payroll History</p>
            <div class="filter-row">
              <select v-model="filterMonth" class="sel-sm">
                <option value="">All Months</option>
                <option value="1">January</option>
                <option value="2">February</option>
                <option value="3">March</option>
                <option value="4">April</option>
                <option value="5">May</option>
                <option value="6">June</option>
                <option value="7">July</option>
                <option value="8">August</option>
                <option value="9">September</option>
                <option value="10">October</option>
                <option value="11">November</option>
                <option value="12">December</option>
              </select>
              <select v-model="filterYear" class="sel-sm">
                <option value="">All Years</option>
                <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
              </select>
              <button v-if="filterMonth || filterYear" class="btn-clear-filter" @click="filterMonth = ''; filterYear = ''">
                Clear
              </button>
            </div>
          </div>
          <div class="table-scroll">
          <table class="history-table">
            <thead>
              <tr>
                <th>Period</th>
                <th class="num">Hours</th>
                <th class="num">Rate</th>
                <th class="num">Total Pay</th>
                <th>Generated By</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in filteredRecords" :key="r.id">
                <td class="month-cell">{{ monthLabel(r.month) }}</td>
                <td class="num mono">{{ Number(r.hoursWorked).toFixed(2) }}h</td>
                <td class="num mono">
                  <span v-if="r.hourlyRate">{{ formatMoney(r.hourlyRate) }}/hr</span>
                  <span v-else class="muted">—</span>
                </td>
                <td class="num mono strong">
                  <span v-if="r.isCreated">{{ formatMoney(r.totalPay) }}</span>
                  <span v-else class="muted">Pending</span>
                </td>
                <td>
                  <span v-if="r.generatedByName" class="gen-name">{{ r.generatedByName }}</span>
                  <span v-else class="muted">—</span>
                </td>
                <td>
                  <span class="badge" :class="statusClass(r)">{{ statusLabel(r) }}</span>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-att" @click="openAttendance(r)" title="View attendance">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                        <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
                      </svg>
                      Attendance
                    </button>
                    <button
                      v-if="r.isCreated && !r.isReceived"
                      class="btn-recv-sm"
                      :disabled="markingId === r.id"
                      @click="markReceived(r)"
                    >
                      {{ markingId === r.id ? '…' : 'Received' }}
                    </button>
                    <span v-else-if="r.isReceived" class="done-mark">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Done
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

      <!-- Attendance modal -->
      <AttendanceLogModal
        :show="attModal.show"
        :logs="attModal.logs"
        :staffName="attModal.staffName"
        :staffDept="''"
        :monthLabel="attModal.monthLabel"
        :hourlyRate="attModal.hourlyRate"
        @close="attModal.show = false"
      />

        <div class="empty-state" v-if="!loading && records.length === 0">
          No payroll records yet.
        </div>

      </template>

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
import StaffSidebar from '@/components/sidebar/staffSidebar.vue';
import AttendanceLogModal from '@/components/staff-payroll/AttendanceLogModal.vue';
import API_BASE_URL from '@/services/api';

export default {
  name: 'StaffPayroll',
  components: { StaffSidebar, AttendanceLogModal },

  data() {
    const now = new Date();
    return {
      todayFull: now.toLocaleDateString('en-MY', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      }),
      records: [],
      loading: false,
      markingId: null,
      filterMonth: '',
      filterYear: '',
      toast: { show: false, message: '', type: 'success' },
      attModal: { show: false, logs: [], staffName: '', monthLabel: '', hourlyRate: 0 },
      rateHistory: [],
      showRateHistory: false,
    };
  },

  computed: {
    currentRate() { return this.rateHistory[0] ?? null; },
    latestRecord() { return this.records[0] ?? null; },
    totalEarned()  { return this.records.filter(r => r.isCreated).reduce((s, r) => s + Number(r.totalPay || 0), 0); },
    totalHours()   { return this.records.reduce((s, r) => s + Number(r.hoursWorked || 0), 0); },
    pendingCount() { return this.records.filter(r => !r.isCreated).length; },

    yearOptions() {
      const years = [...new Set(this.records.map(r => new Date(r.month).getFullYear()))].sort((a, b) => b - a);
      return years;
    },

    filteredRecords() {
      return this.records.filter(r => {
        const d = new Date(r.month);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        if (this.filterYear  && y !== Number(this.filterYear))              return false;
        if (this.filterMonth && m !== Number(this.filterMonth))             return false;
        return true;
      });
    },
  },

  mounted() {
    this.fetchRecords();
    this.fetchMyRates();
  },

  methods: {
    async fetchMyRates() {
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(`${API_BASE_URL}/api/hourly-rates/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.rateHistory = res.data;
      } catch (err) {
        console.error('Failed to load rate history', err);
      }
    },

    async fetchRecords() {
      this.loading = true;
      try {
        const token = localStorage.getItem('userToken');
        const res = await axios.get(`${API_BASE_URL}/api/payroll/my-records`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.records = res.data;
      } catch (err) {
        this.showToast('Failed to load payroll records.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async markReceived(record) {
      this.markingId = record.id;
      try {
        const token = localStorage.getItem('userToken');
        await axios.patch(`${API_BASE_URL}/api/payroll/${record.id}/received`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.showToast('Payroll marked as received!', 'success');
        await this.fetchRecords();
      } catch (err) {
        this.showToast('Failed to confirm receipt.', 'error');
      } finally {
        this.markingId = null;
      }
    },

    formatDate(d) {
      if (!d) return '—';
      return new Date(d).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    monthLabel(monthStr) {
      if (!monthStr) return '—';
      const d = new Date(monthStr);
      return d.toLocaleDateString('en-MY', { month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' });
    },
    statusLabel(r) {
      if (r.isReceived) return 'Received';
      if (r.isCreated)  return 'Generated';
      return 'Pending';
    },
    statusClass(r) {
      if (r.isReceived) return 'green';
      if (r.isCreated)  return 'indigo';
      return 'amber';
    },
    formatMoney(val) {
      return 'RM ' + Number(val).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },
    async openAttendance(record) {
      const token = localStorage.getItem('userToken');
      const staffName = localStorage.getItem('userName') || '';
      const d = new Date(record.month);
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      this.attModal = { show: true, logs: [], staffName, monthLabel: this.monthLabel(record.month), hourlyRate: Number(record.hourlyRate) || 0 };
      try {
        const res = await axios.get(`${API_BASE_URL}/api/attendance/my/month/${month}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

/* ── Base (mobile) ─────────────────────────────────────────── */
.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb; font-family: 'DM Sans', sans-serif;
}
.dashboard {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px; overflow-x: hidden;
}

/* Top bar */
.topbar { display: flex; flex-direction: column; gap: 8px; }
.eyebrow { display: block; font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.page-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.025em; margin-bottom: 4px; }
.accent { color: #6366f1; }
.page-sub { font-size: 13px; color: #64748b; }

/* KPI strip — 2 cols on mobile */
.kpi-strip { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.kpi-card {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  display: flex; flex-direction: column; gap: 4px;
}
.kpi-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; }
.kpi-val { font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'DM Mono', monospace; }
.kpi-val.indigo { color: #6366f1; }
.kpi-val.amber  { color: #b45309; }

/* Panel */
.panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; padding: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.panel-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 16px; gap: 10px;
}
.panel-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.panel-sub   { font-size: 12px; color: #94a3b8; }

.badge {
  display: inline-flex; align-items: center;
  padding: 4px 10px; border-radius: 6px;
  font-size: 11.5px; font-weight: 600; flex-shrink: 0;
}
.badge.amber  { background: #fffbeb; color: #b45309; }
.badge.indigo { background: #eef2ff; color: #4338ca; }
.badge.green  { background: #f0fdf4; color: #15803d; }

/* Current body — stacked on mobile */
.current-body { display: flex; flex-direction: column; gap: 16px; }

.hours-block { background: #f8fafc; border-radius: 12px; padding: 16px; }
.big-val { font-size: 40px; font-weight: 700; color: #0f172a; letter-spacing: -.04em; font-family: 'DM Mono', monospace; }
.big-unit { font-size: 20px; font-weight: 500; color: #94a3b8; }
.hours-label { font-size: 13px; color: #64748b; margin-top: 4px; margin-bottom: 14px; }
.bar-wrap { height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
.bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, #6366f1, #8b5cf6); transition: width .6s ease; }
.bar-legend { display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; font-family: 'DM Mono', monospace; margin-bottom: 14px; }
.pay-row {
  display: flex; justify-content: space-between; align-items: center;
  background: #fff; border-radius: 8px; padding: 10px 14px;
  border: 1px solid #e2e8f0;
}
.pay-row.estimate { border-color: #c7d2fe; background: #eef2ff; }
.pay-label { font-size: 12px; color: #64748b; }
.pay-val   { font-size: 14px; font-weight: 700; color: #6366f1; font-family: 'DM Mono', monospace; }

/* Progress */
.progress-block { padding: 4px 0; display: flex; flex-direction: column; }
.prog-eyebrow { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 14px; }
.prog-track { display: flex; align-items: center; margin-bottom: 14px; }
.prog-step { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
.prog-step span { font-size: 11px; color: #94a3b8; white-space: nowrap; }
.prog-step.active span { color: #475569; font-weight: 500; }
.prog-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid #e2e8f0; background: #fff; transition: all .3s; }
.prog-dot.filled { background: #0f172a; border-color: #0f172a; }
.prog-line { flex: 1; height: 2px; background: #e2e8f0; margin-bottom: 18px; transition: background .3s; }
.prog-line.filled { background: #0f172a; }
.prog-note {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 12.5px; color: #64748b; line-height: 1.55;
  background: #f8fafc; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;
}
.prog-note.success { background: #f0fdf4; color: #15803d; }
.prog-note.info    { background: #eff6ff; color: #1d4ed8; }

.btn-received {
  display: inline-flex; align-items: center; gap: 7px;
  background: #22c55e; color: #fff; border: none;
  border-radius: 9px; padding: 10px 18px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background .15s, transform .1s;
  align-self: flex-start; width: 100%;
  justify-content: center;
}
.btn-received:hover:not(:disabled) { background: #16a34a; }
.btn-received:disabled { opacity: .5; cursor: not-allowed; }

/* History table */
.history-header {
  display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px;
}
.filter-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sel-sm {
  flex: 1; min-width: 0; padding: 7px 10px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #374151;
  cursor: pointer; outline: none; transition: border-color .15s;
}
.sel-sm:focus { border-color: #6366f1; }
.btn-clear-filter {
  padding: 7px 12px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #fff;
  font-family: 'DM Sans', sans-serif; font-size: 12px; color: #64748b;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-clear-filter:hover { border-color: #6366f1; color: #6366f1; }

.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.history-table { width: 100%; border-collapse: collapse; min-width: 560px; }
.history-table th {
  padding: 10px 12px; text-align: left;
  font-size: 10.5px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
  background: #f8fafc; border-bottom: 1px solid #f1f5f9; white-space: nowrap;
}
.history-table th.num { text-align: right; }
.history-table td { padding: 11px 12px; font-size: 13px; color: #1e293b; border-bottom: 1px solid #f8fafc; }
.history-table tr:last-child td { border-bottom: none; }
.history-table tr:hover td { background: #fafbff; }
.history-table td.num { text-align: right; }
.mono { font-family: 'DM Mono', monospace; }
.strong { font-weight: 600; }
.month-cell { font-weight: 600; color: #0f172a; white-space: nowrap; }
.muted { color: #cbd5e1; }
.muted-sm { font-size: 12px; color: #cbd5e1; }

.gen-name { font-size: 12.5px; font-weight: 500; color: #374151; white-space: nowrap; }

.action-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.btn-recv-sm {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f0fdf4; color: #15803d;
  border: 1px solid #bbf7d0; border-radius: 6px;
  padding: 5px 10px; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s;
}
.btn-recv-sm:hover:not(:disabled) { background: #22c55e; color: #fff; border-color: #22c55e; }
.btn-recv-sm:disabled { opacity: .5; cursor: not-allowed; }
.done-mark { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 600; color: #15803d; }
.btn-att {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f8fafc; color: #475569;
  border: 1px solid #e2e8f0; border-radius: 6px;
  padding: 5px 10px; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer; transition: all .15s;
}
.btn-att:hover { background: #eef2ff; color: #4338ca; border-color: #c7d2fe; }

/* Rate card */
.rate-card {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  background: #fff; border: 1px solid #c7d2fe;
  border-radius: 14px; padding: 14px 16px;
  box-shadow: 0 1px 3px rgba(99,102,241,.06);
}
.rate-card-left  { display: flex; align-items: center; gap: 12px; }
.rate-card-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
.rate-icon {
  width: 38px; height: 38px; border-radius: 10px;
  background: #eef2ff; color: #6366f1; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.rate-label { font-size: 11px; font-weight: 600; color: #6366f1; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 3px; }
.rate-val   { font-size: 22px; font-weight: 700; color: #0f172a; font-family: 'DM Mono', monospace; letter-spacing: -.03em; }
.rate-val.no-rate { font-size: 14px; color: #94a3b8; font-family: 'DM Sans', sans-serif; font-weight: 500; }
.rate-unit  { font-size: 13px; font-weight: 400; color: #64748b; }
.rate-since { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.rate-since-label { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
.rate-since-val   { font-size: 12.5px; font-weight: 500; color: #475569; }
.btn-rate-history {
  background: none; border: 1px solid #e2e8f0; border-radius: 7px;
  padding: 4px 10px; font-family: 'DM Sans', sans-serif;
  font-size: 11.5px; color: #6366f1; cursor: pointer; transition: all .15s;
}
.btn-rate-history:hover { background: #eef2ff; border-color: #c7d2fe; }

/* Rate history panel */
.rate-history-panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 12px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
}
.rh-title { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .07em; }
.rh-list  { display: flex; flex-direction: column; gap: 6px; }
.rh-row   {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; background: #f8fafc;
  border: 1px solid #f1f5f9; border-radius: 8px;
}
.rh-rate { font-size: 13px; font-weight: 600; color: #0f172a; font-family: 'DM Mono', monospace; }
.rh-date { font-size: 12px; color: #64748b; }

/* Loading / empty */
.loading-state, .empty-state {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  padding: 48px 20px; color: #94a3b8; font-size: 13.5px;
}

/* Toast */
.toast {
  position: fixed; bottom: 20px; left: 16px; right: 16px;
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-radius: 10px;
  font-size: 13px; font-weight: 500; color: #fff;
  box-shadow: 0 8px 24px rgba(0,0,0,.15); z-index: 9999;
}
.toast.success { background: #10b981; }
.toast.error   { background: #ef4444; }
.toast-fade-enter-active, .toast-fade-leave-active { transition: all .25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(12px); }

.spin { animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Tablet (≥ 600px) ───────────────────────────────────────── */
@media (min-width: 600px) {
  .dashboard { padding: 24px 24px 44px; gap: 18px; }
  .page-title { font-size: 24px; }
  .kpi-strip { grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .kpi-val { font-size: 22px; }
  .panel { padding: 18px 20px; }
  .history-header { flex-direction: row; align-items: center; justify-content: space-between; }
  .sel-sm { flex: none; }
  .btn-received { width: auto; justify-content: flex-start; }
  .toast { left: 50%; right: auto; transform: translateX(-50%); white-space: nowrap; font-size: 13.5px; padding: 12px 20px; }
  .toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(12px); }
}

/* ── Desktop (≥ 900px) ─────────────────────────────────────── */
@media (min-width: 900px) {
  .dashboard { padding: 32px 36px 48px; gap: 20px; }
  .topbar { flex-direction: row; align-items: flex-start; justify-content: space-between; }
  .page-title { font-size: 26px; }
  .big-val { font-size: 48px; }
  .big-unit { font-size: 22px; }
  .current-body { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
  .panel { padding: 20px 22px; }
  .hours-block { padding: 20px 22px; }
}
</style>
