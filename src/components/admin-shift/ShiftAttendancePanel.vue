<template>
  <div class="attendance-panel">
    <div class="panel-head">
      <span class="panel-title">ATTENDANCE LOG</span>
      <span class="panel-date">{{ todayFormatted }}</span>
    </div>

    <div class="attendance-list">
      <div
        v-for="log in logs"
        :key="log.id"
        class="attendance-row"
        :class="'status-' + log.status.toLowerCase()"
        @click="$emit('select-log', log)"
      >
        <div class="att-avatar">{{ getInitials(log.staffName) }}</div>
        <div class="att-info">
          <span class="att-name">{{ log.staffName }}</span>
          <span class="att-shift">{{ log.shiftType }} — {{ formatShortDate(log.checkIn || log.shiftStart) }}</span>
        </div>
        <div class="att-times">
          <span class="att-check">{{ log.checkIn ? formatTime(log.checkIn) : '—' }}</span>
          <span class="att-sep">→</span>
          <span class="att-check">{{ log.checkOut ? formatTime(log.checkOut) : '—' }}</span>
        </div>
        <span class="att-badge" :class="'badge-' + log.status.toLowerCase()">{{ log.status }}</span>
      </div>
      <div v-if="logs.length === 0" class="empty-state">
        No logs match this filter.
      </div>
    </div>
  </div>
</template>

<script>
import { getInitials, formatTime, formatShortDate } from '@/data/shiftData.js';

export default {
  name: 'ShiftAttendancePanel',
  props: {
    logs: { type: Array, required: true },
  },
  emits: ['select-log'],

  computed: {
    todayFormatted() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', month: 'long', day: 'numeric' });
    },
  },

  methods: { getInitials, formatTime, formatShortDate },
};
</script>

<style scoped>
.attendance-panel {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
}
.panel-title {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  color: #94a3b8;
  font-weight: 600;
}
.panel-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
.attendance-list {
  max-height: 635px;
  overflow-y: auto;
}
.attendance-list::-webkit-scrollbar       { width: 4px; }
.attendance-list::-webkit-scrollbar-track { background: transparent; }
.attendance-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

.attendance-row {
  display: flex;
  align-items: center;
  padding: 11px 18px;
  gap: 12px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.12s;
}
.attendance-row:hover { background: #f8fafc; }

.att-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}
.att-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.att-name  { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.att-shift { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: #94a3b8; }
.att-times {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  color: #475569;
}
.att-sep { color: #cbd5e1; }

.att-badge {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.badge-completed { background: #dcfce7; color: #16a34a; }
.badge-late      { background: #fef3c7; color: #d97706; }
.badge-missed    { background: #fee2e2; color: #dc2626; }
.badge-pending   { background: #f1f5f9; color: #64748b; }

.empty-state {
  padding: 32px;
  text-align: center;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: #cbd5e1;
  letter-spacing: 0.08em;
}
</style>