<template>
  <transition name="drawer-slide">
    <div v-if="log" class="detail-drawer">
      <div class="drawer-header">
        <span>Attendance Detail</span>
        <button class="modal-x" @click="$emit('close')">✕</button>
      </div>

      <div class="drawer-body">
        <div class="drawer-avatar-row">
          <div>
            <p class="drawer-name">{{ log.staffName }}</p>
            <p class="drawer-role">{{ log.shiftType }} Shift</p>
          </div>
        </div>

        <div class="drawer-grid">
          <div class="dg-item">
            <span class="dg-label">DATE</span>
            <span class="dg-val">{{ formatShortDate(log.shiftStart) }}</span>
          </div>
          <div class="dg-item">
            <span class="dg-label">STATUS</span>
            <span class="dg-val">
              <span class="status-pill" :class="'pill-' + log.status.toLowerCase()">{{ log.status }}</span>
            </span>
          </div>
          <div class="dg-item">
            <span class="dg-label">SCHEDULED IN</span>
            <span class="dg-val mono">{{ formatTime(log.shiftStart) }}</span>
          </div>
          <div class="dg-item">
            <span class="dg-label">SCHEDULED OUT</span>
            <span class="dg-val mono">{{ formatTime(log.shiftEnd) }}</span>
          </div>
          <div class="dg-item">
            <span class="dg-label">CHECK IN</span>
            <span class="dg-val mono" :class="{ 'late-text': isLate(log) }">
              {{ log.checkIn ? formatTime(log.checkIn) : '—' }}
              <span v-if="isLate(log)" class="late-tag">LATE</span>
            </span>
          </div>
          <div class="dg-item">
            <span class="dg-label">CHECK OUT</span>
            <span class="dg-val mono">{{ log.checkOut ? formatTime(log.checkOut) : '—' }}</span>
          </div>
          <div class="dg-item full">
            <span class="dg-label">NOTES</span>
            <span class="dg-val">{{ log.notes || '—' }}</span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { getInitials, formatTime, formatShortDate, isLate } from '@/data/shiftData.js';

export default {
  name: 'ShiftDetailDrawer',
  props: {
    log: { type: Object, default: null },
  },
  emits: ['close'],
  methods: { getInitials, formatTime, formatShortDate, isLate },
};
</script>

<style scoped>
.detail-drawer {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 340px;
  background: #fff;
  box-shadow: -8px 0 40px rgba(15,23,42,0.14);
  z-index: 900;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e2e8f0;
}
.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
  font-family: 'DM Sans', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.modal-x {
  background: #f1f5f9;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.7rem;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s;
}
.modal-x:hover { background: #e2e8f0; color: #0f172a; }

.drawer-body { padding: 20px; flex: 1; overflow-y: auto; }

.drawer-avatar-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f1f5f9;
}
.big-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #6366f1;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
}
.drawer-name {
  font-weight: 700;
  color: #0f172a;
  font-size: 0.95rem;
  margin: 0 0 2px;
  letter-spacing: -0.02em;
}
.drawer-role {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: #94a3b8;
  margin: 0;
  letter-spacing: 0.06em;
}

.drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dg-item { display: flex; flex-direction: column; gap: 4px; }
.dg-item.full { grid-column: 1 / -1; }
.dg-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: #cbd5e1;
  font-weight: 600;
  text-transform: uppercase;
}
.dg-val {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.83rem;
  color: #0f172a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dg-val.mono { font-family: 'DM Mono', monospace; font-size: 0.78rem; }
.late-text { color: #d97706; }
.late-tag {
  font-family: 'DM Mono', monospace;
  font-size: 0.55rem;
  background: #fef3c7;
  color: #d97706;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.status-pill {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.pill-completed { background: #dcfce7; color: #16a34a; }
.pill-late      { background: #fef3c7; color: #d97706; }
.pill-missed    { background: #fee2e2; color: #dc2626; }
.pill-pending   { background: #f1f5f9; color: #64748b; }

/* Transition */
.drawer-slide-enter-active,
.drawer-slide-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-slide-enter-from,
.drawer-slide-leave-to     { transform: translateX(100%); }
</style>