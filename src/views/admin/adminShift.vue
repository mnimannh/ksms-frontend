<template>
  <div class="admin-layout">
    <AdminSidebar class="sidebar" />

    <main class="page-container">
      <div class="page-content">

        <!-- ═══ TOP HEADER ═══ -->
        <div class="top-header">
          <div class="header-text">
            <span class="eyebrow">{{ todayLabel }}</span>
            <h1 class="main-title">Shift <span class="accent">Assignment</span></h1>
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Assign Shift
            </button>
            <span class="live-dot" />
          </div>
        </div>

        <!-- ═══ KPI STRIP ═══ -->
        <ShiftKpiStrip :shifts="shifts" :attendance="attendance" />

        <!-- ═══ MAIN GRID ═══ -->
        <div class="main-grid">
          <ShiftCalendarPanel
            :calendar-events="calendarEvents"
            :staff-list="staffList"
            @event-click="onCalendarEventClick"
            @date-click="onCalendarDateClick"
            @filter-user="calendarUserFilter = $event"
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
          @delete-shift="deleteShift"
        />

      </div>
    </main>

    <!-- ═══ ASSIGN / EDIT MODAL ═══ -->
    <ShiftAssignModal
      :visible="showAssignModal"
      :is-editing="!!editingShift"
      :staff-list="staffList"
      :form="form"
      :conflict-error="shiftConflictError"
      @close="showAssignModal = false; shiftConflictError = ''"
      @save="saveShift"
    />

    <!-- ═══ ATTENDANCE DETAIL DRAWER ═══ -->
    <ShiftDetailDrawer
      :log="selectedLog"
      @close="selectedLog = null"
      @delete="deleteShift"
    />
  </div>
</template>

<script>
import AdminSidebar         from '@/components/sidebar/AdminSidebar.vue';
import ShiftKpiStrip        from '@/components/admin-shift/ShiftKpiStrip.vue';
import ShiftCalendarPanel   from '@/components/admin-shift/ShiftCalendarPanel.vue';
import ShiftAttendancePanel from '@/components/admin-shift/ShiftAttendancePanel.vue';
import ShiftTable           from '@/components/admin-shift/ShiftTable.vue';
import ShiftAssignModal     from '@/components/admin-shift/ShiftAssignModal.vue';
import ShiftDetailDrawer    from '@/components/admin-shift/ShiftDetailDrawer.vue';
import API_BASE_URL         from '@/services/api.js';

// ── HELPER ────────────────────────────────────────────────────────────────
function authFetch(url, options = {}) {
  const token = localStorage.getItem('userToken'); // token stored on login
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

export default {
  name: 'ShiftAssignment',
  components: {
    AdminSidebar, ShiftKpiStrip, ShiftCalendarPanel,
    ShiftAttendancePanel, ShiftTable, ShiftAssignModal, ShiftDetailDrawer,
  },

  data() {
    return {
      staffList:       [],
      shifts:          [],
      attendance:      [],
      loading:         false,
      error:           null,
      calendarUserFilter: null,

      activeFilter:    'all',
      searchQuery:     '',
      showAssignModal:    false,
      editingShift:       null,
      selectedLog:        null,
      shiftConflictError: '',

      filters: [
        { key: 'all',       label: 'All'       },
        { key: 'pending',   label: 'Pending'   },
        { key: 'completed', label: 'Completed' },
        { key: 'late',      label: 'Late'      },
        { key: 'missed',    label: 'Missed'    },
      ],

      form: {
        userID:    null,
        shiftType: 'Morning',
        startTime: '',
        endTime:   '',
        notes:     '',
      },
    };
  },

  computed: {
    todayLabel() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    enrichedRows() {
      return this.shifts.map(s => {
        const staff = this.staffList.find(u => u.id === s.userID);
        const log   = this.attendance.find(a => a.shiftID === s.id);
        return {
          ...s,
          staffName:        staff ? staff.fullName : `User #${s.userID}`,
          checkIn:          log?.checkIn  ?? null,
          checkOut:         log?.checkOut ?? null,
          attendanceStatus: log?.status   ?? 'Pending',
          logNotes:         log?.notes    ?? null,
        };
      });
    },

    enrichedLogs() {
      return this.attendance.map(a => {
        const staff = this.staffList.find(u => u.id === a.userID);
        const shift = this.shifts.find(s => s.id === a.shiftID);
        return {
          ...a,
          staffName:  staff ? staff.fullName  : `User #${a.userID}`,
          shiftType:  shift ? shift.shiftType : '—',
          shiftStart: shift?.startTime ?? null,
          shiftEnd:   shift?.endTime   ?? null,
        };
      });
    },

    filteredAttendanceLogs() {
      if (this.activeFilter === 'all') return this.enrichedLogs;
      return this.enrichedLogs.filter(
        l => l.status.toLowerCase() === this.activeFilter
      );
    },

    filteredTableRows() {
      const q = this.searchQuery.toLowerCase();
      return this.enrichedRows.filter(r =>
        r.staffName.toLowerCase().includes(q)        ||
        r.shiftType.toLowerCase().includes(q)        ||
        (r.assignedByName || '').toLowerCase().includes(q)
      );
    },

    calendarEvents() {
      const statusColors = {
        Completed: '#16a34a',
        Late:      '#d97706',
        Missed:    '#dc2626',
        Pending:   '#64748b',
      };
      const rows = this.calendarUserFilter
        ? this.enrichedRows.filter(r => r.userID === this.calendarUserFilter)
        : this.enrichedRows;
      return rows.map(row => ({
        id:            row.id,
        title:         `${row.staffName}`,
        start:         row.startTime,
        end:           row.endTime,
        classNames:    [`cal-event-${row.shiftType.toLowerCase()}`],
        borderColor:   statusColors[row.attendanceStatus] ?? '#64748b',
        extendedProps: row,
      }));
    },
  },

  async created() {
    await this.fetchAll();
  },

  methods: {
    // ── Data fetching ────────────────────────────────────────────────────────
    async fetchAll() {
      this.loading = true;
      this.error   = null;
      try {
        const [staffRes, shiftsRes, attendanceRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/users`),
          authFetch(`${API_BASE_URL}/api/shifts`),
          authFetch(`${API_BASE_URL}/api/attendance`),
        ]);

        if (!staffRes.ok || !shiftsRes.ok || !attendanceRes.ok) {
          throw new Error('One or more API requests failed');
        }

        this.staffList  = (await staffRes.json()).filter(u => u.role === 'staff' && u.status === 'active');
        this.shifts     = await shiftsRes.json();
        this.attendance = await attendanceRes.json();

        if (this.staffList.length && !this.form.userID) {
          this.form.userID = this.staffList[0].id;
        }
      } catch (err) {
        this.error = err.message;
        console.error('fetchAll error:', err);
      } finally {
        this.loading = false;
      }
    },

    // ── Modal ────────────────────────────────────────────────────────────────
    openAssignModal(shift = null) {
      this.shiftConflictError = '';
      this.editingShift = shift;
      this.form = shift
        ? {
            userID:    shift.userID,
            shiftType: shift.shiftType,
            startTime: shift.startTime.slice(0, 16),
            endTime:   shift.endTime.slice(0, 16),
            notes:     shift.notes || '',
          }
        : {
            userID:    this.staffList[0]?.id ?? null,
            shiftType: 'Morning',
            startTime: '',
            endTime:   '',
            notes:     '',
          };
      this.showAssignModal = true;
    },

    async saveShift(formData) {
      this.shiftConflictError = '';
      const newDate = formData.startTime.slice(0, 10);
      const conflict = this.shifts.find(s =>
        s.userID === formData.userID &&
        s.startTime.slice(0, 10) === newDate &&
        (!this.editingShift || s.id !== this.editingShift.id)
      );
      if (conflict) {
        const staff = this.staffList.find(u => u.id === formData.userID);
        const name  = staff ? staff.fullName : 'This staff member';
        this.shiftConflictError = `${name} already has a shift on this date.`;
        return;
      }

      const payload = {
        userID:     formData.userID,
        assignedBy: 1, // TODO: replace with your logged-in admin ID
        shiftType:  formData.shiftType,
        startTime:  formData.startTime + ':00',
        endTime:    formData.endTime   + ':00',
        notes:      formData.notes,
      };

      try {
        if (this.editingShift) {
          const res = await authFetch(`${API_BASE_URL}/api/shifts/${this.editingShift.id}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to update shift');

          const idx = this.shifts.findIndex(s => s.id === this.editingShift.id);
          if (idx !== -1) {
            this.shifts[idx] = { ...this.shifts[idx], ...payload };
          }

        } else {
          const res = await authFetch(`${API_BASE_URL}/api/shifts`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error('Failed to create shift');

          const { id: newShiftId } = await res.json();

          // Seed attendance
          const attRes = await authFetch(`${API_BASE_URL}/api/attendance`, {
            method: 'POST',
            body: JSON.stringify({
              shiftID:  newShiftId,
              userID:   formData.userID,
              checkIn:  null,
              checkOut: null,
              status:   'Pending',
              notes:    null,
            }),
          });
          if (!attRes.ok) throw new Error('Shift created but attendance seed failed');

          await this.fetchAll();
        }
      } catch (err) {
        console.error('saveShift error:', err);
        this.error = err.message;
      } finally {
        this.showAssignModal = false;
      }
    },

    // ── Delete ───────────────────────────────────────────────────────────────
    async deleteShift(shiftID) {
      try {
        const res = await authFetch(`${API_BASE_URL}/api/shifts/${shiftID}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete shift');

        this.shifts     = this.shifts.filter(s => s.id !== shiftID);
        this.attendance = this.attendance.filter(a => a.shiftID !== shiftID);
        this.selectedLog = null;
      } catch (err) {
        console.error('deleteShift error:', err);
        this.error = err.message;
      }
    },

    // ── Log selection ────────────────────────────────────────────────────────
    onCalendarEventClick(props) {
      this.selectedLog = this.enrichedLogs.find(l => l.shiftID === props.id) ?? null;
    },

    onViewLog(shiftID) {
      this.selectedLog = this.enrichedLogs.find(l => l.shiftID === shiftID) ?? null;
    },

    // ── Calendar date click ──────────────────────────────────────────────────
    onCalendarDateClick(dateStr) {
      const clicked = new Date(dateStr);
      const today   = new Date();
      today.setHours(0, 0, 0, 0);
      if (clicked < today) return;

      this.editingShift = null;
      this.form = {
        userID:    this.staffList[0]?.id ?? null,
        shiftType: 'Morning',
        startTime: `${dateStr}T09:00`,
        endTime:   `${dateStr}T17:00`,
        notes:     '',
      };
      this.showAssignModal = true;
    },
  },
};
</script>

<style>
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500;600&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

/* ── Layout ── */
.admin-layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
  background: #f6f7fb;
}
.sidebar { flex-shrink: 0; }
.page-container {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: #f6f7fb;
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
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: #94a3b8;
  display: block;
  margin-bottom: 4px;
}
.main-title {
  font-family: 'DM Sans', sans-serif;
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
  background: #f1f5f9;
  padding: 3px;
  border-radius: 8px;
}
.filter-tab {
  font-family: 'DM Mono', monospace;
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
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  background: #16a34a;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 9px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  letter-spacing: -0.01em;
}
.btn-assign:hover { background: #15803d; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(22,163,74,.3); }
.accent { color: #6366f1; }
.live-dot {
  width: 8px; height: 8px; background: #22c55e; border-radius: 50%; flex-shrink: 0;
  animation: live-pulse 2s ease infinite;
}
@keyframes live-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(34,197,94,.4); }
  50%      { box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}

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