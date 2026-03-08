<template>
  <div class="panel">

    <!-- Header -->
    <div class="card-header">
      <div>
        <p class="card-title">Payroll History</p>
        <p class="card-sub">{{ filteredRecords.length }} record{{ filteredRecords.length !== 1 ? 's' : '' }} shown</p>
      </div>
      <!-- Filters: status + month + year -->
      <div class="filter-group">
        <select class="select-pill" v-model="filterStatus">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="generated">Generated</option>
          <option value="received">Received</option>
        </select>
        <select class="select-pill" v-model="filterMonth">
          <option value="">All Months</option>
          <option v-for="m in monthOptions" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
        <select class="select-pill" v-model="filterYear">
          <option value="">All Years</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="payroll-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Hours Worked</th>
            <th>Hourly Rate</th>
            <th>Total Pay</th>
            <th>Status</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(r, i) in filteredRecords"
            :key="r.id"
            class="table-row"
            :style="`animation-delay:${i*45}ms`"
          >
            <!-- Month -->
            <td>
              <div class="month-cell">
                <div class="month-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span class="month-name">{{ r.monthLabel }}</span>
              </div>
            </td>

            <!-- Hours -->
            <td>
              <div class="hours-cell">
                <span class="hours-val">{{ r.hoursWorked }}<span class="hours-unit">h</span></span>
                <div class="hours-bar">
                  <div class="hours-fill" :style="`width:${Math.min((r.hoursWorked/200)*100,100)}%`" />
                </div>
              </div>
            </td>

            <!-- Hourly Rate -->
            <td>
              <span class="mono-val">RM {{ hourlyRate.toFixed(2) }}</span>
            </td>

            <!-- Total Pay -->
            <td>
              <span class="pay-val">{{ formatMoney(r.hoursWorked * hourlyRate) }}</span>
            </td>

            <!-- Status -->
            <td>
              <span class="status-badge" :class="statusClass(r)">
                <span class="status-dot" />
                {{ statusLabel(r) }}
              </span>
            </td>

            <!-- Notes -->
            <td>
              <span class="notes-text" v-if="r.notes" :title="r.notes">
                {{ r.notes.length > 28 ? r.notes.slice(0,28) + '…' : r.notes }}
              </span>
              <span class="notes-text muted" v-else>—</span>
            </td>

            <!-- Actions -->
            <td>
              <div class="action-group">
                <button class="btn-action" @click="$emit('view', r)" title="Payroll details">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  Details
                </button>
                <button class="btn-action accent" @click="$emit('attendance', r)" title="View attendance log">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                    <line x1="8" y1="14" x2="8" y2="14"/>
                    <line x1="12" y1="14" x2="12" y2="14"/>
                    <line x1="16" y1="14" x2="16" y2="14"/>
                  </svg>
                  Attendance
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-if="filteredRecords.length === 0" class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
      <p>No payroll records found.</p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'PayrollHistoryTable',
  emits: ['view', 'attendance'],
  props: {
    records:    { type: Array,  required: true },
    hourlyRate: { type: Number, default: 0 },
  },
  data() {
    return {
      filterStatus: 'all',
      filterMonth:  '',
      filterYear:   '',
    }
  },
  computed: {
    yearOptions() {
      return [...new Set(
        this.records.map(r => new Date(r.month).getFullYear())
      )].sort((a, b) => b - a)
    },
    monthOptions() {
      return [
        { value: '1',  label: 'January'   },
        { value: '2',  label: 'February'  },
        { value: '3',  label: 'March'     },
        { value: '4',  label: 'April'     },
        { value: '5',  label: 'May'       },
        { value: '6',  label: 'June'      },
        { value: '7',  label: 'July'      },
        { value: '8',  label: 'August'    },
        { value: '9',  label: 'September' },
        { value: '10', label: 'October'   },
        { value: '11', label: 'November'  },
        { value: '12', label: 'December'  },
      ]
    },
    filteredRecords() {
      return this.records.filter(r => {
        // Status filter
        if (this.filterStatus === 'pending'   && r.isCreated)               return false
        if (this.filterStatus === 'generated' && (!r.isCreated || r.isReceived)) return false
        if (this.filterStatus === 'received'  && !r.isReceived)             return false
        // Month filter
        const d = new Date(r.month)
        if (this.filterMonth && String(d.getMonth() + 1) !== this.filterMonth) return false
        if (this.filterYear  && d.getFullYear() !== Number(this.filterYear))   return false
        return true
      })
    },
  },
  methods: {
    statusLabel(r) {
      if (r.isReceived) return 'Received'
      if (r.isCreated)  return 'Generated'
      return 'Pending'
    },
    statusClass(r) {
      if (r.isReceived) return 'received'
      if (r.isCreated)  return 'generated'
      return 'pending'
    },
    formatMoney(val) {
      return 'RM ' + Number(val).toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 })
    },
  },
}
</script>

<style scoped>
.panel {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.card-header {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 12px;
  flex-wrap: wrap;
}
.card-title { font-size:14.5px; font-weight:600; color:#0f172a; margin-bottom:2px; }
.card-sub   { font-size:12px; color:#94a3b8; }

.filter-group { display:flex; gap:6px; flex-wrap:wrap; }

.select-pill {
  padding:6px 28px 6px 10px;
  border-radius:7px;
  border:1px solid #e2e8f0; background:#fff;
  font-family:'DM Sans',sans-serif; font-size:12.5px; color:#374151;
  cursor:pointer; outline:none;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat:no-repeat;
  background-position:right 8px center;
  transition:border-color .15s;
}
.select-pill:focus { border-color:#6366f1; }

.table-wrap { overflow-x:auto; }
.payroll-table { width:100%; border-collapse:collapse; }
.payroll-table thead tr {
  border-bottom:1px solid #f1f5f9;
  background:#f8fafc;
}
.payroll-table th {
  padding:10px 16px;
  font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.07em;
  text-align:left; white-space:nowrap;
}
.table-row {
  border-bottom:1px solid #f8fafc;
  transition:background .12s;
  animation:rowIn .3s ease both;
}
@keyframes rowIn {
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
}
.table-row:last-child { border-bottom:none; }
.table-row:hover { background:#fafbff; }
.payroll-table td { padding:12px 16px; vertical-align:middle; }

.month-cell { display:flex; align-items:center; gap:10px; }
.month-icon {
  width:30px; height:30px; border-radius:8px;
  background:#f1f5f9; color:#64748b;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.month-name { font-size:13.5px; font-weight:500; color:#0f172a; white-space:nowrap; }

.hours-cell { display:flex; flex-direction:column; gap:5px; min-width:90px; }
.hours-val  { font-size:14px; font-weight:700; color:#0f172a; letter-spacing:-.02em; }
.hours-unit { font-size:11px; font-weight:500; color:#94a3b8; }
.hours-bar {
  width:80px; height:4px;
  background:#f1f5f9; border-radius:99px; overflow:hidden;
}
.hours-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6);
  transition:width .5s ease;
}

.mono-val { font-size:13px; color:#475569; font-family:'DM sans',sans-serif; }
.pay-val  { font-size:13.5px; color:#475569; font-family:'DM sans',sans-serif; }

.status-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 11px; border-radius:6px;
  font-size:12px; font-weight:600; white-space:nowrap;
}
.status-badge.pending   { background:#fffbeb; color:#b45309; }
.status-badge.generated { background:#eff6ff; color:#1d4ed8; }
.status-badge.received  { background:#f0fdf4; color:#15803d; }
.status-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

.notes-text      { font-size:12.5px; color:#64748b; }
.notes-text.muted { color:#cbd5e1; }

.action-group { display:flex; gap:5px; }
.btn-action {
  display:inline-flex; align-items:center; gap:5px;
  padding:5px 11px; border-radius:7px;
  border:1px solid #e2e8f0; background:#f8fafc;
  font-family:'DM Sans',sans-serif; font-size:12px;
  font-weight:500; color:#475569; cursor:pointer;
  transition:all .15s; white-space:nowrap;
}
.btn-action:hover { background:#f1f5f9; border-color:#d1d5db; color:#0f172a; }
.btn-action.accent { border-color:#e0e7ff; background:#eef2ff; color:#4f46e5; }
.btn-action.accent:hover { background:#e0e7ff; border-color:#c7d2fe; color:#3730a3; }

.empty-state {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:44px; gap:12px; color:#94a3b8; font-size:13.5px;
}
</style>