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
        <div class="kpi-strip">
          <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
            <span class="kpi-val">{{ kpi.value }}</span>
            <span class="kpi-label">{{ kpi.label }}</span>
            <span class="kpi-sub" :class="kpi.subClass">{{ kpi.sub }}</span>
          </div>
        </div>

        <!-- ═══ MAIN GRID ═══ -->
        <div class="main-grid">

          <!-- Calendar Panel -->
          <div class="calendar-panel">
            <div class="panel-head">
              <span class="panel-title">SCHEDULE OVERVIEW</span>
              <div class="view-toggle">
                <button :class="{ active: calView === 'dayGridMonth' }" @click="switchView('dayGridMonth')">Month</button>
                <button :class="{ active: calView === 'timeGridWeek' }" @click="switchView('timeGridWeek')">Week</button>
                <button :class="{ active: calView === 'listWeek' }" @click="switchView('listWeek')">List</button>
              </div>
            </div>
            <div id="admin-calendar"></div>
          </div>

          <!-- Attendance Panel -->
          <div class="attendance-panel">
            <div class="panel-head">
              <span class="panel-title">ATTENDANCE LOG</span>
              <span class="panel-date">{{ todayFormatted }}</span>
            </div>

            <div class="attendance-list">
              <div
                v-for="log in filteredAttendanceLogs"
                :key="log.id"
                class="attendance-row"
                :class="'status-' + log.status.toLowerCase()"
                @click="selectedLog = log"
              >
                <div class="att-avatar">{{ getInitials(log.staffName) }}</div>
                <div class="att-info">
                  <span class="att-name">{{ log.staffName }}</span>
                  <span class="att-shift">{{ log.shiftType }} — {{ formatShortDate(log.checkIn || log.shiftStart) }}</span>
                </div>
                <div class="att-times">
                  <span class="att-check in">{{ log.checkIn ? formatTime(log.checkIn) : '—' }}</span>
                  <span class="att-sep">→</span>
                  <span class="att-check out">{{ log.checkOut ? formatTime(log.checkOut) : '—' }}</span>
                </div>
                <span class="att-badge" :class="'badge-' + log.status.toLowerCase()">{{ log.status }}</span>
              </div>
              <div v-if="filteredAttendanceLogs.length === 0" class="empty-state">
                No logs match this filter.
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ BOTTOM STAFF TABLE ═══ -->
        <div class="staff-table-section">
          <div class="panel-head">
            <span class="panel-title">ALL ASSIGNED SHIFTS</span>
            <input class="search-input" v-model="searchQuery" placeholder="Search staff or shift…" />
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
                <tr v-for="row in filteredTableRows" :key="row.id" class="table-row">
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
                      <button class="act-btn edit" @click="openAssignModal(row)" title="Edit">✎</button>
                      <button class="act-btn view" @click="selectedLog = getLogByShift(row.id)" title="View Log">◉</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredTableRows.length === 0">
                  <td colspan="10" class="empty-td">No shifts found.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>

    <!-- ═══ ASSIGN / EDIT MODAL ═══ -->
    <transition name="modal-fade">
      <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
        <div class="assign-modal">
          <div class="assign-modal-header">
            <span>{{ editingShift ? 'Edit Shift' : 'Assign New Shift' }}</span>
            <button class="modal-x" @click="showAssignModal = false">✕</button>
          </div>
          <div class="assign-modal-body">
            <div class="form-row">
              <label>Staff Member</label>
              <select v-model="form.userID">
                <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.name }}</option>
              </select>
            </div>
            <div class="form-row">
              <label>Shift Type</label>
              <div class="shift-type-toggle">
                <button :class="{ active: form.shiftType === 'Morning' }" @click="form.shiftType = 'Morning'">🌤 Morning</button>
                <button :class="{ active: form.shiftType === 'Evening' }" @click="form.shiftType = 'Evening'">🌙 Evening</button>
              </div>
            </div>
            <div class="form-row two-col">
              <div>
                <label>Start Time</label>
                <input type="datetime-local" v-model="form.startTime" />
              </div>
              <div>
                <label>End Time</label>
                <input type="datetime-local" v-model="form.endTime" />
              </div>
            </div>
            <div class="form-row">
              <label>Notes</label>
              <textarea v-model="form.notes" rows="3" placeholder="Optional notes…"></textarea>
            </div>
          </div>
          <div class="assign-modal-footer">
            <button class="btn-cancel" @click="showAssignModal = false">Cancel</button>
            <button class="btn-save" @click="saveShift">{{ editingShift ? 'Save Changes' : 'Assign Shift' }}</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ═══ ATTENDANCE DETAIL DRAWER ═══ -->
    <transition name="drawer-slide">
      <div v-if="selectedLog" class="detail-drawer">
        <div class="drawer-header">
          <span>Attendance Detail</span>
          <button class="modal-x" @click="selectedLog = null">✕</button>
        </div>
        <div class="drawer-body">
          <div class="drawer-avatar-row">
            <div class="big-avatar">{{ getInitials(selectedLog.staffName) }}</div>
            <div>
              <p class="drawer-name">{{ selectedLog.staffName }}</p>
              <p class="drawer-role">{{ selectedLog.shiftType }} Shift</p>
            </div>
          </div>
          <div class="drawer-grid">
            <div class="dg-item">
              <span class="dg-label">DATE</span>
              <span class="dg-val">{{ formatShortDate(selectedLog.shiftStart) }}</span>
            </div>
            <div class="dg-item">
              <span class="dg-label">STATUS</span>
              <span class="dg-val">
                <span class="status-pill" :class="'pill-' + selectedLog.status.toLowerCase()">{{ selectedLog.status }}</span>
              </span>
            </div>
            <div class="dg-item">
              <span class="dg-label">SCHEDULED IN</span>
              <span class="dg-val mono">{{ formatTime(selectedLog.shiftStart) }}</span>
            </div>
            <div class="dg-item">
              <span class="dg-label">SCHEDULED OUT</span>
              <span class="dg-val mono">{{ formatTime(selectedLog.shiftEnd) }}</span>
            </div>
            <div class="dg-item">
              <span class="dg-label">CHECK IN</span>
              <span class="dg-val mono" :class="{ 'late-text': isLate(selectedLog) }">
                {{ selectedLog.checkIn ? formatTime(selectedLog.checkIn) : '—' }}
                <span v-if="isLate(selectedLog)" class="late-tag">LATE</span>
              </span>
            </div>
            <div class="dg-item">
              <span class="dg-label">CHECK OUT</span>
              <span class="dg-val mono">{{ selectedLog.checkOut ? formatTime(selectedLog.checkOut) : '—' }}</span>
            </div>
            <div class="dg-item full">
              <span class="dg-label">NOTES</span>
              <span class="dg-val">{{ selectedLog.notes || '—' }}</span>
            </div>
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue';

// ─── Hardcoded Data ────────────────────────────────────────────────────────────

const STAFF = [
  { id: 1, name: 'Aiman Hakim' },
  { id: 2, name: 'Nur Farah' },
  { id: 3, name: 'Razif Azlan' },
  { id: 4, name: 'Siti Norzahra' },
  { id: 5, name: 'Daniel Lim' },
  { id: 6, name: 'Priya Nair' },
];

const SHIFTS = [
  { id: 1,  userID: 1, assignedBy: 'Admin (You)', startTime: '2025-03-03T07:00:00', endTime: '2025-03-03T15:00:00', shiftType: 'Morning', notes: 'Open store. Check inventory.' },
  { id: 2,  userID: 2, assignedBy: 'Admin (You)', startTime: '2025-03-03T14:00:00', endTime: '2025-03-03T22:00:00', shiftType: 'Evening', notes: 'Closing shift.' },
  { id: 3,  userID: 3, assignedBy: 'Admin (You)', startTime: '2025-03-05T07:00:00', endTime: '2025-03-05T15:00:00', shiftType: 'Morning', notes: null },
  { id: 4,  userID: 4, assignedBy: 'Admin (You)', startTime: '2025-03-05T14:00:00', endTime: '2025-03-05T22:00:00', shiftType: 'Evening', notes: 'Team briefing 14:30.' },
  { id: 5,  userID: 5, assignedBy: 'Admin (You)', startTime: '2025-03-07T07:00:00', endTime: '2025-03-07T15:00:00', shiftType: 'Morning', notes: null },
  { id: 6,  userID: 6, assignedBy: 'Admin (You)', startTime: '2025-03-07T14:00:00', endTime: '2025-03-07T22:00:00', shiftType: 'Evening', notes: null },
  { id: 7,  userID: 1, assignedBy: 'Admin (You)', startTime: '2025-03-10T07:00:00', endTime: '2025-03-10T15:00:00', shiftType: 'Morning', notes: 'Monthly stock audit.' },
  { id: 8,  userID: 2, assignedBy: 'Admin (You)', startTime: '2025-03-10T14:00:00', endTime: '2025-03-10T22:00:00', shiftType: 'Evening', notes: null },
  { id: 9,  userID: 3, assignedBy: 'Admin (You)', startTime: '2025-03-12T07:00:00', endTime: '2025-03-12T15:00:00', shiftType: 'Morning', notes: 'Training session.' },
  { id: 10, userID: 4, assignedBy: 'Admin (You)', startTime: '2025-03-12T14:00:00', endTime: '2025-03-12T22:00:00', shiftType: 'Evening', notes: null },
  { id: 11, userID: 5, assignedBy: 'Admin (You)', startTime: '2025-03-14T07:00:00', endTime: '2025-03-14T15:00:00', shiftType: 'Morning', notes: null },
  { id: 12, userID: 6, assignedBy: 'Admin (You)', startTime: '2025-03-17T14:00:00', endTime: '2025-03-17T22:00:00', shiftType: 'Evening', notes: null },
];

const ATTENDANCE = [
  { id: 1,  shiftID: 1,  userID: 1, checkIn: '2025-03-03T07:02:00', checkOut: '2025-03-03T15:01:00', status: 'Completed', notes: null },
  { id: 2,  shiftID: 2,  userID: 2, checkIn: '2025-03-03T14:18:00', checkOut: '2025-03-03T22:05:00', status: 'Late',      notes: 'Arrived 18 min late' },
  { id: 3,  shiftID: 3,  userID: 3, checkIn: '2025-03-05T07:00:00', checkOut: '2025-03-05T15:00:00', status: 'Completed', notes: null },
  { id: 4,  shiftID: 4,  userID: 4, checkIn: null,                   checkOut: null,                   status: 'Missed',    notes: 'No show' },
  { id: 5,  shiftID: 5,  userID: 5, checkIn: '2025-03-07T07:05:00', checkOut: '2025-03-07T15:00:00', status: 'Completed', notes: null },
  { id: 6,  shiftID: 6,  userID: 6, checkIn: '2025-03-07T14:00:00', checkOut: null,                   status: 'Pending',   notes: null },
  { id: 7,  shiftID: 7,  userID: 1, checkIn: '2025-03-10T07:12:00', checkOut: '2025-03-10T15:00:00', status: 'Late',      notes: 'Traffic delay' },
  { id: 8,  shiftID: 8,  userID: 2, checkIn: '2025-03-10T14:00:00', checkOut: '2025-03-10T22:00:00', status: 'Completed', notes: null },
  { id: 9,  shiftID: 9,  userID: 3, checkIn: null,                   checkOut: null,                   status: 'Pending',   notes: null },
  { id: 10, shiftID: 10, userID: 4, checkIn: '2025-03-12T14:00:00', checkOut: '2025-03-12T22:00:00', status: 'Completed', notes: null },
  { id: 11, shiftID: 11, userID: 5, checkIn: '2025-03-14T07:00:00', checkOut: '2025-03-14T15:00:00', status: 'Completed', notes: null },
  { id: 12, shiftID: 12, userID: 6, checkIn: null,                   checkOut: null,                   status: 'Pending',   notes: null },
];

export default {
  name: 'ShiftAssignment',
  components: { AdminSidebar },

  data() {
    return {
      staffList: STAFF,
      shifts: [...SHIFTS],
      attendance: [...ATTENDANCE],
      calendar: null,
      calView: 'dayGridMonth',
      activeFilter: 'all',
      searchQuery: '',
      showAssignModal: false,
      editingShift: null,
      selectedLog: null,
      filters: [
        { key: 'all', label: 'All' },
        { key: 'pending', label: 'Pending' },
        { key: 'completed', label: 'Completed' },
        { key: 'late', label: 'Late' },
        { key: 'missed', label: 'Missed' },
      ],
      form: {
        userID: STAFF[0].id,
        shiftType: 'Morning',
        startTime: '',
        endTime: '',
        notes: '',
      },
    };
  },

  computed: {
    todayFormatted() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', month: 'long', day: 'numeric' });
    },

    enrichedRows() {
      return this.shifts.map(s => {
        const staff = this.staffList.find(u => u.id === s.userID);
        const log = this.attendance.find(a => a.shiftID === s.id);
        return {
          ...s,
          staffName: staff ? staff.name : `User #${s.userID}`,
          checkIn: log ? log.checkIn : null,
          checkOut: log ? log.checkOut : null,
          attendanceStatus: log ? log.status : 'Pending',
          logNotes: log ? log.notes : null,
        };
      });
    },

    enrichedLogs() {
      return this.attendance.map(a => {
        const staff = this.staffList.find(u => u.id === a.userID);
        const shift = this.shifts.find(s => s.id === a.shiftID);
        return {
          ...a,
          staffName: staff ? staff.name : `User #${a.userID}`,
          shiftType: shift ? shift.shiftType : '—',
          shiftStart: shift ? shift.startTime : null,
          shiftEnd: shift ? shift.endTime : null,
        };
      });
    },

    filteredAttendanceLogs() {
      if (this.activeFilter === 'all') return this.enrichedLogs;
      return this.enrichedLogs.filter(l => l.status.toLowerCase() === this.activeFilter);
    },

    filteredTableRows() {
      const q = this.searchQuery.toLowerCase();
      return this.enrichedRows.filter(r =>
        r.staffName.toLowerCase().includes(q) ||
        r.shiftType.toLowerCase().includes(q) ||
        r.assignedBy.toLowerCase().includes(q)
      );
    },

    kpis() {
      const total = this.shifts.length;
      const completed = this.attendance.filter(a => a.status === 'Completed').length;
      const late = this.attendance.filter(a => a.status === 'Late').length;
      const missed = this.attendance.filter(a => a.status === 'Missed').length;
      const pending = this.attendance.filter(a => a.status === 'Pending').length;
      return [
        { label: 'Total Shifts', value: total, sub: 'This month', subClass: '' },
        { label: 'Completed', value: completed, sub: `${Math.round(completed/total*100)}% rate`, subClass: 'sub-green' },
        { label: 'Late Arrivals', value: late, sub: `${Math.round(late/total*100)}% of shifts`, subClass: 'sub-amber' },
        { label: 'Missed', value: missed, sub: `${missed} no-shows`, subClass: 'sub-red' },
        { label: 'Pending', value: pending, sub: 'Awaiting check-in', subClass: '' },
      ];
    },

    calendarEvents() {
      return this.enrichedRows.map(row => {
        const statusColors = {
          Completed: '#16a34a',
          Late: '#d97706',
          Missed: '#dc2626',
          Pending: '#64748b',
        };
        return {
          id: row.id,
          title: `${row.shiftType === 'Morning' ? '🌤' : '🌙'} ${row.staffName}`,
          start: row.startTime,
          end: row.endTime,
          classNames: [`cal-event-${row.shiftType.toLowerCase()}`],
          borderColor: statusColors[row.attendanceStatus] || '#64748b',
          extendedProps: row,
        };
      });
    },
  },

  mounted() {
    this.loadFullCalendar();
  },

  beforeUnmount() {
    if (this.calendar) this.calendar.destroy();
  },

  methods: {
    loadFullCalendar() {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
      script.onload = () => this.initCalendar();
      document.head.appendChild(script);
    },

    initCalendar() {
      const el = document.getElementById('admin-calendar');
      if (!el || !window.FullCalendar) return;
      const self = this;

      this.calendar = new window.FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        initialDate: '2025-03-01',
        headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
        height: 'auto',
        events: this.calendarEvents,
        eventClick(info) {
          const props = info.event.extendedProps;
          const log = self.getLogByShift(props.id);
          if (log) self.selectedLog = log;
        },
        dayMaxEvents: 3,
        eventDisplay: 'block',
      });

      this.calendar.render();
    },

    switchView(v) {
      this.calView = v;
      if (this.calendar) this.calendar.changeView(v);
    },

    openAssignModal(shift = null) {
      this.editingShift = shift;
      if (shift) {
        this.form = {
          userID: shift.userID,
          shiftType: shift.shiftType,
          startTime: shift.startTime.slice(0, 16),
          endTime: shift.endTime.slice(0, 16),
          notes: shift.notes || '',
        };
      } else {
        this.form = { userID: this.staffList[0].id, shiftType: 'Morning', startTime: '', endTime: '', notes: '' };
      }
      this.showAssignModal = true;
    },

    saveShift() {
      if (this.editingShift) {
        const idx = this.shifts.findIndex(s => s.id === this.editingShift.id);
        if (idx !== -1) {
          this.shifts[idx] = {
            ...this.shifts[idx],
            userID: this.form.userID,
            shiftType: this.form.shiftType,
            startTime: this.form.startTime + ':00',
            endTime: this.form.endTime + ':00',
            notes: this.form.notes,
          };
        }
      } else {
        const newId = Math.max(...this.shifts.map(s => s.id)) + 1;
        this.shifts.push({
          id: newId,
          userID: this.form.userID,
          assignedBy: 'Admin (You)',
          startTime: this.form.startTime + ':00',
          endTime: this.form.endTime + ':00',
          shiftType: this.form.shiftType,
          notes: this.form.notes,
          created_at: new Date().toISOString(),
        });
        this.attendance.push({
          id: Math.max(...this.attendance.map(a => a.id)) + 1,
          shiftID: newId,
          userID: this.form.userID,
          checkIn: null,
          checkOut: null,
          status: 'Pending',
          notes: null,
        });
      }
      this.showAssignModal = false;
      this.$nextTick(() => {
        if (this.calendar) {
          this.calendar.removeAllEvents();
          this.calendarEvents.forEach(e => this.calendar.addEvent(e));
        }
      });
    },

    getLogByShift(shiftID) {
      return this.enrichedLogs.find(l => l.shiftID === shiftID) || null;
    },

    isLate(log) {
      if (!log.checkIn || !log.shiftStart) return false;
      return new Date(log.checkIn) - new Date(log.shiftStart) > 10 * 60 * 1000;
    },

    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    },

    formatTime(dt) {
      if (!dt) return '—';
      return new Date(dt).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    },

    formatShortDate(dt) {
      if (!dt) return '—';
      return new Date(dt).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    },
  },
};
</script>

<!-- FullCalendar overrides (global) -->
<style>
#admin-calendar .fc-toolbar-title {
  font-family: 'Sora', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}
#admin-calendar .fc-button {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #0f172a !important;
  border-color: #0f172a !important;
  border-radius: 6px !important;
  padding: 5px 12px !important;
  transition: all 0.15s;
}
#admin-calendar .fc-button:hover { background: #1e293b !important; }
#admin-calendar .fc-button-active { background: #334155 !important; }
#admin-calendar .fc-col-header-cell-cushion {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
}
#admin-calendar .fc-daygrid-day-number {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #475569;
  padding: 6px 8px 2px;
}
#admin-calendar .fc-day-today { background: #f0f9ff !important; }
#admin-calendar .fc-day-today .fc-daygrid-day-number {
  background: #0f172a;
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 5px 6px 2px auto;
  font-size: 0.65rem;
}
#admin-calendar .cal-event-morning {
  background: linear-gradient(135deg, #fbbf24, #fde68a) !important;
  color: #78350f !important;
  border-left: 3px solid #f59e0b !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  border-radius: 4px !important;
  padding: 1px 5px !important;
  cursor: pointer;
}
#admin-calendar .cal-event-evening {
  background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
  color: #dbeafe !important;
  border-left: 3px solid #1d4ed8 !important;
  font-family: 'JetBrains Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  border-radius: 4px !important;
  padding: 1px 5px !important;
  cursor: pointer;
}
#admin-calendar .fc-border-color { border-color: #e2e8f0; }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

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
  max-width: 1400px;
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

/* ── KPI Strip ── */
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}
.kpi-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
.kpi-val {
  font-family: 'Sora', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
}
.kpi-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.kpi-sub { font-family: 'Sora', sans-serif; font-size: 0.72rem; color: #94a3b8; }
.sub-green { color: #16a34a !important; }
.sub-amber { color: #d97706 !important; }
.sub-red { color: #dc2626 !important; }

/* ── Main Grid ── */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  margin-bottom: 22px;
  align-items: start;
}

/* Calendar Panel */
.calendar-panel,
.attendance-panel,
.staff-table-section {
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
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  color: #94a3b8;
  font-weight: 600;
}
.panel-date {
  font-family: 'Sora', sans-serif;
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
}
.view-toggle {
  display: flex;
  gap: 3px;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
}
.view-toggle button {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  border: none;
  background: transparent;
  color: #64748b;
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.12s;
}
.view-toggle button.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

#admin-calendar { padding: 16px; }

/* Attendance Panel */
.attendance-list {
  max-height: 480px;
  overflow-y: auto;
}
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
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}
.att-info { flex: 1; display: flex; flex-direction: column; gap: 1px; }
.att-name { font-size: 0.82rem; font-weight: 600; color: #0f172a; }
.att-shift { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; color: #94a3b8; }
.att-times {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.68rem;
  color: #475569;
}
.att-sep { color: #cbd5e1; }

/* Status Pills */
.att-badge, .status-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.badge-completed, .pill-completed { background: #dcfce7; color: #16a34a; }
.badge-late,      .pill-late      { background: #fef3c7; color: #d97706; }
.badge-missed,    .pill-missed    { background: #fee2e2; color: #dc2626; }
.badge-pending,   .pill-pending   { background: #f1f5f9; color: #64748b; }

.empty-state {
  padding: 32px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #cbd5e1;
  letter-spacing: 0.08em;
}

/* ── Staff Table ── */
.staff-table-section { overflow: visible; }
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
.shift-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8rem;
}
.shift-table thead tr {
  border-bottom: 2px solid #f1f5f9;
}
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
.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; }
.muted { color: #94a3b8; }
.dash { color: #cbd5e1; }

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

/* ── Assign Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.assign-modal {
  background: #fff;
  border-radius: 14px;
  width: 460px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(15,23,42,0.2);
}
.assign-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px;
  border-bottom: 1px solid #f1f5f9;
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
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

.assign-modal-body { padding: 20px 22px; display: flex; flex-direction: column; gap: 16px; }

.form-row { display: flex; flex-direction: column; gap: 5px; }
.form-row.two-col { flex-direction: row; gap: 12px; }
.form-row.two-col > div { flex: 1; display: flex; flex-direction: column; gap: 5px; }

.form-row label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
}
.form-row select,
.form-row input,
.form-row textarea {
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  padding: 8px 12px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  resize: none;
}
.form-row select:focus,
.form-row input:focus,
.form-row textarea:focus {
  border-color: #0f172a;
  box-shadow: 0 0 0 3px rgba(15,23,42,0.08);
  background: #fff;
}

.shift-type-toggle { display: flex; gap: 8px; }
.shift-type-toggle button {
  flex: 1;
  font-family: 'Sora', sans-serif;
  font-size: 0.82rem;
  font-weight: 600;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  padding: 9px;
  cursor: pointer;
  background: #f8fafc;
  color: #64748b;
  transition: all 0.15s;
}
.shift-type-toggle button.active {
  border-color: #0f172a;
  background: #0f172a;
  color: #fff;
}

.assign-modal-footer {
  display: flex;
  gap: 10px;
  padding: 16px 22px;
  border-top: 1px solid #f1f5f9;
  justify-content: flex-end;
}
.btn-cancel {
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  border-radius: 7px;
  padding: 8px 18px;
  cursor: pointer;
  transition: all 0.12s;
}
.btn-cancel:hover { background: #f8fafc; color: #0f172a; }
.btn-save {
  font-family: 'Sora', sans-serif;
  font-size: 0.8rem;
  font-weight: 700;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 7px;
  padding: 8px 20px;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s;
  letter-spacing: -0.01em;
}
.btn-save:hover { background: #1e293b; transform: translateY(-1px); }

/* ── Detail Drawer ── */
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
  font-family: 'Sora', sans-serif;
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
  letter-spacing: -0.02em;
}
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
  background: #0f172a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Sora', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
}
.drawer-name { font-weight: 700; color: #0f172a; font-size: 0.95rem; margin: 0 0 2px; letter-spacing: -0.02em; }
.drawer-role { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: #94a3b8; margin: 0; letter-spacing: 0.06em; }

.drawer-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.dg-item { display: flex; flex-direction: column; gap: 4px; }
.dg-item.full { grid-column: 1 / -1; }
.dg-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: #cbd5e1;
  font-weight: 600;
  text-transform: uppercase;
}
.dg-val {
  font-family: 'Sora', sans-serif;
  font-size: 0.83rem;
  color: #0f172a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dg-val.mono { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; }
.late-text { color: #d97706; }
.late-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.55rem;
  background: #fef3c7;
  color: #d97706;
  padding: 2px 5px;
  border-radius: 3px;
  font-weight: 700;
  letter-spacing: 0.06em;
}

/* ── Transitions ── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .assign-modal, .modal-fade-leave-active .assign-modal { transition: transform 0.2s ease; }
.modal-fade-enter-from .assign-modal, .modal-fade-leave-to .assign-modal { transform: scale(0.96) translateY(8px); }

.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.25s cubic-bezier(0.32, 0.72, 0, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }

/* Scrollbar styling */
.attendance-list::-webkit-scrollbar { width: 4px; }
.attendance-list::-webkit-scrollbar-track { background: transparent; }
.attendance-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

@media (max-width: 1100px) {
  .main-grid { grid-template-columns: 1fr; }
  .kpi-strip { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 700px) {
  .page-content { padding: 20px 16px; }
  .kpi-strip { grid-template-columns: repeat(2, 1fr); }
  .top-header { flex-direction: column; align-items: flex-start; }
}
</style>