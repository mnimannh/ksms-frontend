<template>
  <div class="admin-layout">
    <AdminSidebar class="sidebar" />

    <main class="page-container">
      <div class="page-content">

        <!-- ═══ TOP HEADER ═══ -->
        <div class="top-header">
          <div class="header-text">
            <span class="eyebrow">SHIFT CONTROL</span>
            <h1 class="main-title">Shift Assignment</h1>
          </div>
          <div class="header-actions">
            <div class="filter-tabs">
              <button
                v-for="f in filters"
                :key="f.key"
                class="filter-tab"
                :class="{ active: activeFilter === f.key }"
                @click="activeFilter = f.key"
              >{{ f.label }}</button>
            </div>
            <button class="btn-assign" @click="openAssignModal()">
              <span class="plus-icon">+</span> Assign Shift
            </button>
          </div>
        </div>

        <!-- ═══ KPI STRIP ═══ -->
        <ShiftKpiStrip :shifts="shifts" :attendance="attendance" />

        <!-- ═══ MAIN GRID ═══ -->
        <div class="main-grid">
          <ShiftCalendarPanel
            :calendar-events="calendarEvents"
            @event-click="onCalendarEventClick"
          />
          <ShiftAttendancePanel
            :logs="filteredAttendanceLogs"
            @select-log="selectedLog = $event"
          />
        </div>

        <!-- ═══ BOTTOM STAFF TABLE ═══ -->
        <ShiftTable
          :rows="filteredTableRows"
          v-model:searchQuery="searchQuery"
          @edit-shift="openAssignModal($event)"
          @view-log="onViewLog"
        />

      </div>
    </main>

    <!-- ═══ ASSIGN / EDIT MODAL ═══ -->
    <ShiftAssignModal
      :visible="showAssignModal"
      :is-editing="!!editingShift"
      :staff-list="staffList"
      :form="form"
      @close="showAssignModal = false"
      @save="saveShift"
    />

    <!-- ═══ ATTENDANCE DETAIL DRAWER ═══ -->
    <ShiftDetailDrawer
      :log="selectedLog"
      @close="selectedLog = null"
    />
  </div>
</template>

<script>
import AdminSidebar        from '@/components/sidebar/AdminSidebar.vue';
import ShiftKpiStrip       from '@/components/admin-shift/ShiftKpiStrip.vue';
import ShiftCalendarPanel  from '@/components/admin-shift/ShiftCalendarPanel.vue';
import ShiftAttendancePanel from '@/components/admin-shift/ShiftAttendancePanel.vue';
import ShiftTable          from '@/components/admin-shift/ShiftTable.vue';
import ShiftAssignModal    from '@/components/admin-shift/ShiftAssignModal.vue';
import ShiftDetailDrawer   from '@/components/admin-shift/ShiftDetailDrawer.vue';

import { STAFF, SHIFTS, ATTENDANCE } from '@/data/shiftData.js';

export default {
  name: 'ShiftAssignment',
  components: {
    AdminSidebar,
    ShiftKpiStrip,
    ShiftCalendarPanel,
    ShiftAttendancePanel,
    ShiftTable,
    ShiftAssignModal,
    ShiftDetailDrawer,
  },

  data() {
    return {
      staffList:       STAFF,
      shifts:          [...SHIFTS],
      attendance:      [...ATTENDANCE],
      activeFilter:    'all',
      searchQuery:     '',
      showAssignModal: false,
      editingShift:    null,
      selectedLog:     null,
      filters: [
        { key: 'all',       label: 'All' },
        { key: 'pending',   label: 'Pending' },
        { key: 'completed', label: 'Completed' },
        { key: 'late',      label: 'Late' },
        { key: 'missed',    label: 'Missed' },
      ],
      form: {
        userID:    STAFF[0].id,
        shiftType: 'Morning',
        startTime: '',
        endTime:   '',
        notes:     '',
      },
    };
  },

  computed: {
    // ── Enriched data ──────────────────────────────────────────────────────────

    enrichedRows() {
      return this.shifts.map(s => {
        const staff = this.staffList.find(u => u.id === s.userID);
        const log   = this.attendance.find(a => a.shiftID === s.id);
        return {
          ...s,
          staffName:        staff ? staff.name : `User #${s.userID}`,
          checkIn:          log ? log.checkIn  : null,
          checkOut:         log ? log.checkOut : null,
          attendanceStatus: log ? log.status   : 'Pending',
          logNotes:         log ? log.notes    : null,
        };
      });
    },

    enrichedLogs() {
      return this.attendance.map(a => {
        const staff = this.staffList.find(u => u.id === a.userID);
        const shift = this.shifts.find(s => s.id === a.shiftID);
        return {
          ...a,
          staffName: staff ? staff.name      : `User #${a.userID}`,
          shiftType: shift ? shift.shiftType : '—',
          shiftStart: shift ? shift.startTime : null,
          shiftEnd:   shift ? shift.endTime   : null,
        };
      });
    },

    // ── Filtered views ─────────────────────────────────────────────────────────

    filteredAttendanceLogs() {
      if (this.activeFilter === 'all') return this.enrichedLogs;
      return this.enrichedLogs.filter(l => l.status.toLowerCase() === this.activeFilter);
    },

    filteredTableRows() {
      const q = this.searchQuery.toLowerCase();
      return this.enrichedRows.filter(r =>
        r.staffName.toLowerCase().includes(q) ||
        r.shiftType.toLowerCase().includes(q)  ||
        r.assignedBy.toLowerCase().includes(q)
      );
    },

    // ── Calendar events ────────────────────────────────────────────────────────

    calendarEvents() {
      const statusColors = {
        Completed: '#16a34a',
        Late:      '#d97706',
        Missed:    '#dc2626',
        Pending:   '#64748b',
      };
      return this.enrichedRows.map(row => ({
        id:           row.id,
        title:        `${row.shiftType === 'Morning' ? '🌤' : '🌙'} ${row.staffName}`,
        start:        row.startTime,
        end:          row.endTime,
        classNames:   [`cal-event-${row.shiftType.toLowerCase()}`],
        borderColor:  statusColors[row.attendanceStatus] || '#64748b',
        extendedProps: row,
      }));
    },
  },

  methods: {
    // ── Modal ──────────────────────────────────────────────────────────────────

    openAssignModal(shift = null) {
      this.editingShift = shift;
      this.form = shift
        ? {
            userID:    shift.userID,
            shiftType: shift.shiftType,
            startTime: shift.startTime.slice(0, 16),
            endTime:   shift.endTime.slice(0, 16),
            notes:     shift.notes || '',
          }
        : { userID: this.staffList[0].id, shiftType: 'Morning', startTime: '', endTime: '', notes: '' };
      this.showAssignModal = true;
    },

    saveShift(formData) {
      if (this.editingShift) {
        const idx = this.shifts.findIndex(s => s.id === this.editingShift.id);
        if (idx !== -1) {
          this.shifts[idx] = {
            ...this.shifts[idx],
            userID:    formData.userID,
            shiftType: formData.shiftType,
            startTime: formData.startTime + ':00',
            endTime:   formData.endTime   + ':00',
            notes:     formData.notes,
          };
        }
      } else {
        const newId = Math.max(...this.shifts.map(s => s.id)) + 1;
        this.shifts.push({
          id:         newId,
          userID:     formData.userID,
          assignedBy: 'Admin (You)',
          startTime:  formData.startTime + ':00',
          endTime:    formData.endTime   + ':00',
          shiftType:  formData.shiftType,
          notes:      formData.notes,
          created_at: new Date().toISOString(),
        });
        this.attendance.push({
          id:       Math.max(...this.attendance.map(a => a.id)) + 1,
          shiftID:  newId,
          userID:   formData.userID,
          checkIn:  null,
          checkOut: null,
          status:   'Pending',
          notes:    null,
        });
      }
      this.showAssignModal = false;
    },

    // ── Log selection ──────────────────────────────────────────────────────────

    onCalendarEventClick(props) {
      this.selectedLog = this.enrichedLogs.find(l => l.shiftID === props.id) || null;
    },

    onViewLog(shiftID) {
      this.selectedLog = this.enrichedLogs.find(l => l.shiftID === shiftID) || null;
    },
  },
};
</script>

<style>
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

/* ── Layout ── */
.admin-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'Sora', sans-serif;
  background: #f8fafc;
}
.sidebar { flex-shrink: 0; }
.page-container {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: #f1f5f9;
}
.page-content {
  padding: 28px 32px 48px;
  max-width: 100%;
  margin: 0 auto;
}

/* ── Top Header ── */
.top-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 22px;
  flex-wrap: wrap;
  gap: 16px;
}
.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}
.main-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.85rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.035em;
  line-height: 1;
}
.header-actions { display: flex; align-items: center; gap: 14px; }

.filter-tabs {
  display: flex;
  gap: 4px;
  background: #e2e8f0;
  padding: 3px;
  border-radius: 8px;
}
.filter-tab {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border: none;
  background: transparent;
  color: #64748b;
  padding: 5px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}
.filter-tab.active { background: #fff; color: #0f172a; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }

.btn-assign {
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s, transform 0.1s;
  letter-spacing: -0.01em;
}
.btn-assign:hover { background: #1e293b; transform: translateY(-1px); }
.plus-icon { font-size: 1.1rem; line-height: 1; }

/* ── Main Grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  margin-bottom: 22px;
  align-items: start;
}

/* ── Responsive ── */
@media (max-width: 1100px) { .main-grid { grid-template-columns: 1fr; } }
@media (max-width: 700px) {
  .page-content { padding: 20px 16px; }
  .top-header { flex-direction: column; align-items: flex-start; }
}
</style>