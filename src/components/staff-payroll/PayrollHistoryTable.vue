<template>
  <div class="panel">

    <!-- Header -->
    <div class="card-header">
      <div>
        <p class="card-title">Payroll History</p>
        <p class="card-sub">All monthly payroll records</p>
      </div>
      <!-- Filter -->
      <div class="filter-group">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <table class="payroll-table">
      <thead>
        <tr>
          <th>Month</th>
          <th>Hours Worked</th>
          <th>Hours Bar</th>
          <th>Generated</th>
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
              <div>
                <span class="month-name">{{ r.monthLabel }}</span>
                <span class="month-id">ID #{{ r.id }}</span>
              </div>
            </div>
          </td>

          <!-- Hours -->
          <td>
            <span class="hours-val">{{ r.hoursWorked }}<span class="hours-unit">h</span></span>
          </td>

          <!-- Bar -->
          <td class="bar-cell">
            <div class="hours-bar">
              <div
                class="hours-fill"
                :style="`width:${Math.min((r.hoursWorked/200)*100,100)}%`"
              />
            </div>
            <span class="bar-label">/ 200h</span>
          </td>

          <!-- Generated date -->
          <td>
            <span class="gen-date" v-if="r.created_at">
              {{ formatDate(r.created_at) }}
            </span>
            <span class="gen-date muted" v-else>—</span>
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

          <!-- View -->
          <td>
            <button class="btn-view" @click="$emit('view', r)">
              View
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Empty -->
    <div v-if="filteredRecords.length === 0" class="empty-state">
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
      <p>No payroll records found.</p>
    </div>

  </div>
</template>

<script>
export default {
  name: 'PayrollHistoryTable',
  emits: ['view'],
  props: {
    records: { type: Array, required: true },
  },
  data() {
    return { activeFilter: 'all' }
  },
  computed: {
    filters() {
      return [
        { value: 'all',       label: 'All' },
        { value: 'pending',   label: 'Pending' },
        { value: 'generated', label: 'Generated' },
        { value: 'received',  label: 'Received' },
      ]
    },
    filteredRecords() {
      if (this.activeFilter === 'all') return this.records
      return this.records.filter(r => {
        if (this.activeFilter === 'pending')   return !r.isCreated
        if (this.activeFilter === 'generated') return r.isCreated && !r.isReceived
        if (this.activeFilter === 'received')  return r.isReceived
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
    formatDate(dt) {
      if (!dt) return '—'
      return new Date(dt).toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' })
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

.filter-group { display:flex; gap:5px; }
.filter-btn {
  padding:6px 13px; border-radius:7px;
  border:1px solid #e2e8f0; background:#fff;
  font-family:'DM Sans',sans-serif; font-size:12.5px; color:#64748b;
  cursor:pointer; transition:all .15s;
}
.filter-btn:hover { border-color:#6366f1; color:#6366f1; }
.filter-btn.active { background:#6366f1; border-color:#6366f1; color:#fff; font-weight:500; }

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
.payroll-table td { padding:13px 16px; vertical-align:middle; }

.month-cell { display:flex; align-items:center; gap:10px; }
.month-icon {
  width:32px; height:32px; border-radius:8px;
  background:#f1f5f9; color:#64748b;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.month-name { display:block; font-size:13.5px; font-weight:500; color:#0f172a; }
.month-id   { display:block; font-size:11.5px; color:#94a3b8; margin-top:1px; }

.hours-val  { font-size:15px; font-weight:700; color:#0f172a; letter-spacing:-.02em; }
.hours-unit { font-size:12px; font-weight:500; color:#94a3b8; }

.bar-cell { min-width:120px; }
.bar-cell > * { display:inline-block; vertical-align:middle; }
.hours-bar {
  width:90px; height:5px;
  background:#f1f5f9; border-radius:99px;
  overflow:hidden; display:inline-block; margin-right:6px;
}
.hours-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6);
  transition:width .5s ease;
}
.bar-label { font-size:11px; color:#94a3b8; }

.gen-date      { font-size:12.5px; color:#475569; }
.gen-date.muted { color:#cbd5e1; }

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

.btn-view {
  display:inline-flex; align-items:center; gap:5px;
  padding:6px 13px; border-radius:7px;
  border:1px solid #e2e8f0; background:#f8fafc;
  font-family:'DM Sans',sans-serif; font-size:12.5px;
  font-weight:500; color:#475569; cursor:pointer;
  transition:all .15s;
}
.btn-view:hover { background:#f1f5f9; border-color:#d1d5db; color:#0f172a; }

.empty-state {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:44px; gap:12px; color:#94a3b8; font-size:13.5px;
}
</style>