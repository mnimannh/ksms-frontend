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
                <button class="act-btn edit"   @click="$emit('edit-shift', row)"   title="Edit">✎</button>
                <button class="act-btn view"   @click="$emit('view-log', row.id)"  title="View Log">◉</button>
                <button class="act-btn delete" @click="openConfirm(row.id)"        title="Delete">🗑</button>
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

  <!-- ── Delete Confirmation Modal ── -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmDialog.show" class="modal-backdrop" @click.self="cancelConfirm">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">

          <div class="modal-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <h2 id="modal-title" class="modal-title">Delete Shift</h2>
          <p class="modal-body">This shift will be permanently removed and cannot be recovered. Are you sure you want to continue?</p>

          <div class="modal-actions">
            <button class="btn-cancel" @click="cancelConfirm">Cancel</button>
            <button class="btn-delete" @click="confirmDelete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Delete shift
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script>
import { getInitials, formatTime, formatShortDate } from '@/data/shiftData.js';

export default {
  name: 'ShiftTable',
  props: {
    rows:        { type: Array,  required: true },
    searchQuery: { type: String, default: ''    },
  },
  emits: ['update:searchQuery', 'edit-shift', 'view-log', 'delete-shift'],
  data() {
    return {
      confirmDialog: { show: false, shiftId: null },
    };
  },
  methods: {
    getInitials,
    formatTime,
    formatShortDate,
    openConfirm(id) {
      this.confirmDialog = { show: true, shiftId: id };
    },
    confirmDelete() {
      this.$emit('delete-shift', this.confirmDialog.shiftId);
      this.confirmDialog = { show: false, shiftId: null };
    },
    cancelConfirm() {
      this.confirmDialog = { show: false, shiftId: null };
    },
  },
};
</script>

<style scoped>
.staff-table-section {
  background: #fff;
  border: 1px solid #f1f5f9;
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
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  color: #94a3b8;
  font-weight: 600;
}
.search-input {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  border: 1px solid #f1f5f9;
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
  font-family: 'DM Mono', monospace;
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
.mono  { font-family: 'DM Mono', monospace; font-size: 0.72rem; }
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
  font-family: 'DM Sans', sans-serif;
  font-size: 0.55rem;
  font-weight: 700;
  flex-shrink: 0;
}

.type-pill {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 4px;
  white-space: nowrap;
}
.type-pill.morning { background: #fef3c7; color: #92400e; }
.type-pill.evening { background: #dbeafe; color: #1e40af; }

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

.action-btns { display: flex; gap: 6px; }
.act-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #f1f5f9;
  background: #fff;
  cursor: pointer;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  color: #64748b;
}
.act-btn:hover        { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }
.act-btn.delete:hover { background: #fee2e2; color: #dc2626; border-color: #fca5a5; }

.empty-td {
  text-align: center;
  color: #cbd5e1;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  padding: 32px;
}

/* ── Delete Confirmation Modal ─────────────────────── */

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18), 0 4px 16px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
}

.modal-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e11d48;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.modal-body {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.65;
  margin-bottom: 24px;
  max-width: 280px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-cancel {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-delete {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: #e11d48;
  border: 1.5px solid #e11d48;
  border-radius: 9px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.14s, transform 0.1s, box-shadow 0.14s;
}

.btn-delete:hover {
  background: #be123c;
  border-color: #be123c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
}

.btn-delete:active {
  transform: translateY(0);
  box-shadow: none;
}

/* ── Modal transition ── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>