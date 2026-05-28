<template>
  <div class="attendance-panel">
    <div class="panel-head">
      <span class="panel-title">ATTENDANCE LOG</span>
      
      <!-- Date Navigator with Left and Right Arrows -->
      <div class="date-navigator">
        <button class="nav-btn" @click="changeDate(-1)" title="Previous Day">←</button>
        <span class="panel-date">{{ displayDateFormatted }}</span>
        
        <!-- Disabled attribute binds to the isToday computed check -->
        <button 
          class="nav-btn" 
          @click="changeDate(1)" 
          :disabled="isToday" 
          title="Next Day"
        >→</button>
      </div>
    </div>

    <div class="attendance-list">
      <div
        v-for="(log, index) in filteredLogs"
        :key="log.id"
        class="attendance-row"
        :class="'status-' + log.status.toLowerCase()"
        @click="$emit('select-log', log)"
      >
        <span class="att-num">{{ index + 1 }}</span>
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
      
      <div v-if="filteredLogs.length === 0" class="empty-state">
        No logs for this date.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftAttendancePanel',
  props: {
    logs: { type: Array, required: true },
  },
  emits: ['select-log'],

  data() {
    return {
      currentDate: new Date(),
    };
  },

  computed: {
    displayDateFormatted() {
      return this.currentDate.toLocaleDateString('en-MY', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    },

    // Checks if the active navigated date is equal to or greater than today's physical date
    isToday() {
      const today = new Date();
      return this.currentDate.toDateString() === today.toDateString();
    },

    filteredLogs() {
      const selectedDateString = this.currentDate.toDateString();
      
      return this.logs.filter(log => {
        const targetDateSource = log.checkIn || log.shiftStart || log.date;
        if (!targetDateSource) return false;
        
        return new Date(targetDateSource).toDateString() === selectedDateString;
      });
    }
  },

  methods: {
    changeDate(days) {
      // Direct guard fallback just in case the button bypasses UI blocks
      if (days > 0 && this.isToday) return;

      const newDate = new Date(this.currentDate);
      newDate.setDate(newDate.getDate() + days);
      this.currentDate = newDate;
    },
    formatTime(val) {
      if (!val) return '—';
      return new Date(val).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    },
    formatShortDate(val) {
      if (!val) return '—';
      return new Date(val).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
    },
  },
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

.date-navigator {
  display: flex;
  align-items: center;
  gap: 8px;
}
.nav-btn {
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #64748b;
  cursor: pointer;
  font-size: 0.75rem;
  padding: 2px 8px;
  transition: all 0.15s ease;
}
.nav-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #0f172a;
}

/* Style treatment for locked / disabled buttons */
.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.panel-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  min-width: 140px; 
  text-align: center;
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

.att-num {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: #cbd5e1;
  width: 20px;
  text-align: center;
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