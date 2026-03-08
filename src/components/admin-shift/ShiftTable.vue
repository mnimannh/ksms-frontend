<template>
  <div class="staff-table-section">
    <div class="panel-head">
      <span class="panel-title">ALL ASSIGNED SHIFTS</span>
      <input
        class="search-input"
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        placeholder="Search staff or shift…"
      />
    </div>

    <div class="table-wrap">
      <table class="shift-table">
        <thead>
          <tr>
            <th>Staff</th>
            <th>Shift Type</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Assigned By</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" class="table-row">
            <td>
              <div class="staff-cell">
                <span class="mini-avatar">{{ getInitials(row.staffName) }}</span>
                {{ row.staffName }}
              </div>
            </td>
            <td>
              <span class="type-pill" :class="row.shiftType.toLowerCase()">
                {{ row.shiftType === 'Morning' ? '🌤' : '🌙' }} {{ row.shiftType }}
              </span>
            </td>
            <td class="mono">{{ formatShortDate(row.startTime) }}</td>
            <td class="mono">{{ formatTime(row.startTime) }}</td>
            <td class="mono">{{ formatTime(row.endTime) }}</td>
            <td class="muted">{{ row.assignedBy }}</td>
            <td class="mono" v-html="row.checkIn ? formatTime(row.checkIn) : '<span class=\'dash\'>—</span>'"></td>
            <td class="mono" v-html="row.checkOut ? formatTime(row.checkOut) : '<span class=\'dash\'>—</span>'"></td>
            <td>
              <span class="status-pill" :class="'pill-' + (row.attendanceStatus || 'pending').toLowerCase()">
                {{ row.attendanceStatus || 'Pending' }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="act-btn edit" @click="$emit('edit-shift', row)" title="Edit">✎</button>
                <button class="act-btn view" @click="$emit('view-log', row.id)" title="View Log">◉</button>
              </div>
            </td>
          </tr>
          <tr v-if="rows.length === 0">
            <td colspan="10" class="empty-td">No shifts found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { getInitials, formatTime, formatShortDate } from '@/data/shiftData.js';

export default {
  name: 'ShiftTable',
  props: {
    rows: { type: Array, required: true },
    searchQuery: { type: String, default: '' },
  },
  emits: ['update:searchQuery', 'edit-shift', 'view-log'],
  methods: { getInitials, formatTime, formatShortDate },
};
</script>

<style scoped>
.staff-table-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: visible;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
}
.panel-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  color: #94a3b8;
  font-weight: 600;
}
.search-input {
  font-family: 'Sora', sans-serif;
  font-size: 0.78rem;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  padding: 7px 12px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  width: 200px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus { border-color: #0f172a; box-shadow: 0 0 0 3px rgba(15,23,42,0.08); }

.table-wrap { overflow-x: auto; }
.shift-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.shift-table thead tr { border-bottom: 2px solid #f1f5f9; }
.shift-table th {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  padding: 10px 14px;
  text-align: left;
  white-space: nowrap;
}
.shift-table td {
  padding: 11px 14px;
  color: #334155;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.78rem;
  vertical-align: middle;
}
.table-row:hover td { background: #f8fafc; }
.mono  { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; }
.muted { color: #94a3b8; }

.staff-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}
.mini-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1e293b;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 0.55rem;
  font-weight: 700;
  flex-shrink: 0;
}

.type-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 4px;
  white-space: nowrap;
}
.type-pill.morning { background: #fef3c7; color: #92400e; }
.type-pill.evening { background: #dbeafe; color: #1e40af; }

.status-pill {
  font-family: 'JetBrains Mono', monospace;
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

.action-btns { display: flex; gap: 6px; }
.act-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  color: #64748b;
}
.act-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

.empty-td {
  text-align: center;
  color: #cbd5e1;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  padding: 32px;
}
</style>