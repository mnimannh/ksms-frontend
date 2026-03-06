<template>
  <transition name="modal-fade">
    <div v-if="show" class="overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <!-- Header -->
        <div class="modal-header">
          <div v-if="staff">
            <h2 class="modal-title">Attendance Log</h2>
            <p class="modal-sub">{{ staff.name }} &nbsp;·&nbsp; {{ staff.department }} &nbsp;·&nbsp; {{ periodLabel }}</p>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="staff">

          <!-- Stats row -->
          <div class="stats-row">
            <div class="stat-item" v-for="s in statItems" :key="s.label">
              <span class="stat-val" :class="s.color">{{ s.value }}</span>
              <span class="stat-lbl">{{ s.label }}</span>
            </div>
          </div>

          <!-- Log Table -->
          <div class="table-wrap">
            <table class="log-table">
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
                <tr v-for="log in staff.allLogs" :key="log.id" class="log-row">
                  <td class="td-date">{{ log.date }}</td>
                  <td class="mono">#{{ log.shiftID }}</td>
                  <td class="mono">{{ log.checkIn }}</td>
                  <td class="mono">{{ log.checkOut }}</td>
                  <td><strong>{{ log.hours }}h</strong></td>
                  <td>
                    <span class="log-status" :class="log.status.toLowerCase()">{{ log.status }}</span>
                  </td>
                  <td class="td-notes">{{ log.notes || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>

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
    show:        { type: Boolean, required: true },
    staff:       { type: Object,  default: null },
    periodLabel: { type: String,  default: '' },
  },
  computed: {
    statItems() {
      if (!this.staff) return []
      return [
        { label: 'Total Logs',  value: this.staff.allLogs.length, color: '' },
        { label: 'Completed',   value: this.staff.attendance.completed, color: 'green' },
        { label: 'Late',        value: this.staff.attendance.late,      color: 'amber' },
        { label: 'Missed',      value: this.staff.attendance.missed,    color: 'red' },
        { label: 'Hours Total', value: this.staff.hoursWorked + 'h',    color: 'blue' },
      ]
    },
  },
}
</script>

<style scoped>
.overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.modal-box {
  background: #fff; border-radius: 16px;
  width: 100%; max-width: 740px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.15);
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f1f5f9;
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.modal-title { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 3px; }
.modal-sub   { font-size: 12.5px; color: #64748b; }
.close-btn {
  width: 30px; height: 30px; border: none;
  background: #f8fafc; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b; transition: background .15s; flex-shrink: 0;
}
.close-btn:hover { background: #f1f5f9; }

.modal-body { padding: 20px 24px; }

.stats-row {
  display: flex; gap: 10px;
  background: #f8fafc; border-radius: 10px;
  padding: 14px 16px; margin-bottom: 18px;
}
.stat-item { flex: 1; text-align: center; }
.stat-val { display: block; font-size: 20px; font-weight: 700; margin-bottom: 3px; }
.stat-val.green { color: #16a34a; }
.stat-val.amber { color: #d97706; }
.stat-val.red   { color: #dc2626; }
.stat-val.blue  { color: #2563eb; }
.stat-lbl { font-size: 11px; color: #94a3b8; }

.table-wrap { overflow-x: auto; }
.log-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.log-table thead tr { background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
.log-table th {
  padding: 10px 14px;
  font-size: 10.5px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em; text-align: left;
  white-space: nowrap;
}
.log-row { border-bottom: 1px solid #f8fafc; transition: background .1s; }
.log-row:last-child { border-bottom: none; }
.log-row:hover { background: #fafbff; }
.log-table td { padding: 12px 14px; color: #1e293b; }
.td-date { font-weight: 500; color: #475569; }
.mono { font-family: 'DM Mono', monospace; font-size: 12.5px; }
.td-notes { color: #94a3b8; font-size: 12.5px; }

.log-status {
  padding: 2px 9px; border-radius: 5px;
  font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: .03em;
}
.log-status.completed { background: #f0fdf4; color: #16a34a; }
.log-status.late      { background: #fffbeb; color: #b45309; }
.log-status.missed    { background: #fef2f2; color: #dc2626; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: all .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to   .modal-box { transform: translateY(12px) scale(.98); }
</style>