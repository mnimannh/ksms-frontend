<template>
  <transition name="modal-fade">
    <div v-if="show" class="overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <!-- Header -->
        <div class="modal-header">
          <div>
            <p class="modal-eyebrow">Attendance Log</p>
            <p class="modal-meta">
              <span class="meta-name">{{ staffName }}</span>
              <span class="meta-dot">·</span>
              <span>{{ staffDept }}</span>
              <span class="meta-dot">·</span>
              <span>{{ monthLabel }}</span>
            </p>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- Summary Stats -->
        <div class="stats-row">
          <div class="stat-card">
            <span class="stat-val">{{ stats.total }}</span>
            <span class="stat-label">Total Logs</span>
          </div>
          <div class="stat-card green">
            <span class="stat-val">{{ stats.completed }}</span>
            <span class="stat-label">Completed</span>
          </div>
          <div class="stat-card amber">
            <span class="stat-val">{{ stats.late }}</span>
            <span class="stat-label">Late</span>
          </div>
          <div class="stat-card red">
            <span class="stat-val">{{ stats.missed }}</span>
            <span class="stat-label">Missed</span>
          </div>
          <div class="stat-card indigo">
            <span class="stat-val">{{ stats.totalHours }}<span class="stat-unit">h</span></span>
            <span class="stat-label">Hours Total</span>
          </div>
        </div>

        <!-- Table -->
        <div class="table-wrap">
          <table class="att-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift ID</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(log, i) in logs"
                :key="log.id"
                class="att-row"
                :style="`animation-delay:${i*35}ms`"
              >
                <td class="td-date">{{ formatDay(log.startTime) }}</td>
                <td class="td-shift">#{{ log.shiftID }}</td>
                <td class="td-time">{{ log.checkIn ? formatTime(log.checkIn) : '—' }}</td>
                <td class="td-time">{{ log.checkOut ? formatTime(log.checkOut) : '—' }}</td>
                <td class="td-hours">{{ calcHours(log) }}<span class="h-unit">h</span></td>
                <td>
                  <span class="status-badge" :class="log.status.toLowerCase()">
                    {{ log.status }}
                  </span>
                </td>
                <td class="td-notes">{{ log.notes || '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty state -->
        <div v-if="!logs || logs.length === 0" class="empty-state">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p>No attendance records for this month.</p>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-close" @click="$emit('close')">Close</button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'AttendanceLogModal',
  emits: ['close'],
  props: {
    show:      { type: Boolean, required: true },
    logs:      { type: Array,   default: () => [] },   // shift_attendance_log rows joined with shift_assignment
    staffName: { type: String,  default: '' },
    staffDept: { type: String,  default: '' },
    monthLabel:{ type: String,  default: '' },
  },
  computed: {
    stats() {
      const logs = this.logs || []
      const totalHours = logs.reduce((s, l) => s + this.calcHoursNum(l), 0)
      return {
        total:      logs.length,
        completed:  logs.filter(l => l.status === 'Completed').length,
        late:       logs.filter(l => l.status === 'Late').length,
        missed:     logs.filter(l => l.status === 'Missed').length,
        totalHours: totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1),
      }
    },
  },
  methods: {
    formatDay(dt) {
      if (!dt) return '—'
      return new Date(dt).toLocaleDateString('en-MY', { month:'short', day:'2-digit' })
    },
    formatTime(dt) {
      if (!dt) return '—'
      return new Date(dt).toLocaleTimeString('en-MY', { hour:'2-digit', minute:'2-digit', hour12: false })
    },
    calcHoursNum(log) {
      if (!log.checkIn || !log.checkOut) return 0
      const diff = (new Date(log.checkOut) - new Date(log.checkIn)) / 3600000
      return Math.max(0, Math.round(diff * 10) / 10)
    },
    calcHours(log) {
      const h = this.calcHoursNum(log)
      return h % 1 === 0 ? h : h.toFixed(1)
    },
  },
}
</script>

<style scoped>
.overlay {
  position:fixed; inset:0;
  background:rgba(15,23,42,.45);
  backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center;
  z-index:1000; padding:20px;
}
.modal-box {
  background:#fff; border-radius:16px;
  width:100%; max-width:720px;
  max-height:90vh; overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,.15);
  display:flex; flex-direction:column;
}

/* Header */
.modal-header {
  display:flex; align-items:flex-start; justify-content:space-between;
  padding:22px 24px 16px;
  border-bottom:1px solid #f1f5f9;
  position:sticky; top:0; background:#fff; z-index:2;
}
.modal-eyebrow {
  font-size:16px; font-weight:600; color:#0f172a; margin-bottom:4px;
}
.modal-meta { font-size:13px; color:#64748b; display:flex; align-items:center; gap:6px; flex-wrap:wrap; }
.meta-name  { color:#0f172a; font-weight:500; }
.meta-dot   { color:#cbd5e1; }
.close-btn {
  width:30px; height:30px; border:none;
  background:#f8fafc; border-radius:7px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:#64748b; transition:background .15s; flex-shrink:0;
}
.close-btn:hover { background:#f1f5f9; }

/* Stats row */
.stats-row {
  display:flex; gap:0;
  border-bottom:1px solid #f1f5f9;
}
.stat-card {
  flex:1; display:flex; flex-direction:column; align-items:center;
  padding:16px 12px; gap:4px;
  border-right:1px solid #f1f5f9;
}
.stat-card:last-child { border-right:none; }
.stat-val  { font-size:22px; font-weight:700; color:#0f172a; letter-spacing:-.03em; }
.stat-unit { font-size:14px; font-weight:500; color:#94a3b8; }
.stat-label { font-size:11px; color:#94a3b8; }
.stat-card.green  .stat-val { color:#16a34a; }
.stat-card.amber  .stat-val { color:#d97706; }
.stat-card.red    .stat-val { color:#dc2626; }
.stat-card.indigo .stat-val { color:#6366f1; }

/* Table */
.table-wrap { overflow-x:auto; flex:1; }
.att-table { width:100%; border-collapse:collapse; }
.att-table thead tr { border-bottom:1px solid #f1f5f9; background:#f8fafc; }
.att-table th {
  padding:9px 16px;
  font-size:10.5px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.07em;
  text-align:left; white-space:nowrap;
}
.att-row {
  border-bottom:1px solid #f8fafc;
  animation:rowIn .28s ease both;
  transition:background .1s;
}
@keyframes rowIn {
  from { opacity:0; transform:translateY(4px); }
  to   { opacity:1; transform:translateY(0); }
}
.att-row:last-child { border-bottom:none; }
.att-row:hover { background:#fafbff; }
.att-table td { padding:12px 16px; vertical-align:middle; }

.td-date  { font-size:13.5px; font-weight:500; color:#0f172a; white-space:nowrap; }
.td-shift { font-size:12.5px; color:#64748b; font-family:'DM Mono',monospace; }
.td-time  { font-size:13px; color:#475569; font-family:'DM Mono',monospace; }
.td-hours { font-size:14px; font-weight:700; color:#0f172a; }
.h-unit   { font-size:11px; font-weight:500; color:#94a3b8; }
.td-notes { font-size:12.5px; color:#64748b; }

.status-badge {
  display:inline-flex; align-items:center;
  padding:3px 10px; border-radius:5px;
  font-size:11.5px; font-weight:600; white-space:nowrap;
  text-transform:uppercase; letter-spacing:.04em;
}
.status-badge.completed { background:#f0fdf4; color:#15803d; }
.status-badge.late      { background:#fffbeb; color:#d97706; }
.status-badge.missed    { background:#fef2f2; color:#dc2626; }
.status-badge.pending   { background:#f8fafc; color:#64748b; }

.empty-state {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:44px; gap:12px; color:#94a3b8; font-size:13.5px;
}

/* Footer */
.modal-footer {
  padding:14px 24px 20px;
  border-top:1px solid #f1f5f9;
  display:flex; justify-content:flex-end;
  position:sticky; bottom:0; background:#fff;
}
.btn-close {
  padding:9px 24px; border:1px solid #e2e8f0; border-radius:8px;
  background:#f8fafc; font-family:'DM Sans',sans-serif;
  font-size:14px; color:#475569; cursor:pointer; transition:background .15s;
}
.btn-close:hover { background:#f1f5f9; }

.modal-fade-enter-active, .modal-fade-leave-active { transition:all .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0; }
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to   .modal-box { transform:translateY(12px) scale(.98); }
</style>