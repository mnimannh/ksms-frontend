<template>
  <div class="calendar-panel">
    <div class="panel-head">
      <span class="panel-title">SCHEDULE OVERVIEW</span>
      <div class="head-right">
        <div class="user-filter" v-if="staffList.length">
          <button class="filter-btn" :class="{ active: selectedUserId !== null }" @click.stop="dropdownOpen = !dropdownOpen">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            {{ selectedUserId ? staffList.find(s => s.id === selectedUserId)?.fullName : 'All Staff' }}
            <svg width="8" height="8" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 1l4 4 4-4"/></svg>
          </button>
          <div class="filter-dropdown" v-if="dropdownOpen" @click.stop>
            <div class="dd-item" :class="{ on: selectedUserId === null }" @click="selectUser(null)">All Staff</div>
            <div
              v-for="s in staffList" :key="s.id"
              class="dd-item" :class="{ on: selectedUserId === s.id }"
              @click="selectUser(s.id)"
            >{{ s.fullName }}</div>
          </div>
        </div>

        <div class="view-toggle">
          <button :class="{ active: calView === 'dayGridMonth' }" @click="switchView('dayGridMonth')">Month</button>
          <button :class="{ active: calView === 'timeGridWeek' }" @click="switchView('timeGridWeek')">Week</button>
          <button :class="{ active: calView === 'listWeek' }"    @click="switchView('listWeek')">List</button>
        </div>
      </div>
    </div>

    <!-- ── Stats Bar ── -->
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-icon stat-icon--total">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ totalShifts }}</span>
          <span class="stat-label">Total Shifts</span>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--morning">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ morningShifts }}</span>
          <span class="stat-label">Morning</span>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--evening">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ eveningShifts }}</span>
          <span class="stat-label">Evening</span>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--hours">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ totalHours }}<span class="stat-unit">h</span></span>
          <span class="stat-label">Total Hours</span>
        </div>
      </div>
    </div>

    <div id="admin-calendar"></div>
  </div>
</template>

<script>
export default {
  name: 'ShiftCalendarPanel',
  props: {
    calendarEvents: { type: Array, required: true },
    staffList:      { type: Array, default: () => [] },
  },
  emits: ['event-click', 'date-click', 'filter-user'],

  data() {
    return {
      calendar: null,
      calView: 'dayGridMonth',
      dropdownOpen: false,
      selectedUserId: null,
      // Track current visible month/year for stat computation
      currentMonth: new Date().getMonth(),      // 0-indexed
      currentYear:  new Date().getFullYear(),
    };
  },

  computed: {
    // ── Shift events only (exclude holidays / background) for the visible period ──
    filteredShiftEvents() {
      return this.calendarEvents.filter(e => {
        // Skip holidays and background highlight events
        if (e.extendedProps?.publicHoliday || e.display === 'background') return false;
        if (!e.classNames) return false;

        // Month filter – match against the calendar's currently visible month
        const raw = (e.start || '').split('T')[0];
        if (!raw) return false;
        const d = new Date(raw);
        if (
          d.getMonth()    !== this.currentMonth ||
          d.getFullYear() !== this.currentYear
        ) return false;

        // Staff filter
        if (
          this.selectedUserId !== null &&
e.extendedProps?.userID !== this.selectedUserId
        ) return false;

        return true;
      });
    },

    totalShifts()   { return this.filteredShiftEvents.length; },

    morningShifts() {
      return this.filteredShiftEvents.filter(e =>
        Array.isArray(e.classNames) && e.classNames.includes('cal-event-morning')
      ).length;
    },

    eveningShifts() {
      return this.filteredShiftEvents.filter(e =>
        Array.isArray(e.classNames) && e.classNames.includes('cal-event-evening')
      ).length;
    },

    totalHours() {
      const raw = this.filteredShiftEvents.reduce((acc, e) => {
        if (e.start && e.end) {
          const ms = new Date(e.end) - new Date(e.start);
          return acc + ms / 3_600_000;
        }
        // Fallback: read from extendedProps if parent stores hours there
        if (e.extendedProps?.hours) {
          return acc + Number(e.extendedProps.hours);
        }
        return acc;
      }, 0);
      // Round to 1 decimal, strip trailing .0
      return raw % 1 === 0 ? raw : parseFloat(raw.toFixed(1));
    },
  },

  mounted() {
    this.loadFullCalendar();
    document.addEventListener('click', this.closeDropdown);
  },

  beforeUnmount() {
    if (this.calendar) this.calendar.destroy();
    document.removeEventListener('click', this.closeDropdown);
  },

  watch: {
    calendarEvents(newEvents) {
      if (!this.calendar) return;
      const sources = this.calendar.getEventSources();
      sources.forEach(source => source.remove());
      this.calendar.addEventSource(newEvents);
    },
  },

  methods: {
    loadFullCalendar() {
      if (!document.querySelector('link[href*="fullcalendar"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
        document.head.appendChild(link);
      }

      if (window.FullCalendar) {
        this.initCalendar();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
      script.onload = () => this.initCalendar();
      document.head.appendChild(script);
    },

    // ── "Dec 25" → "2026-12-25" ──
    convertHolidayDate(dateStr, year = 2026) {
      const monthMap = {
        Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06',
        Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12',
      };
      const [monthText, day] = dateStr.split(' ');
      return `${year}-${monthMap[monthText]}-${day.padStart(2, '0')}`;
    },

    buildHolidayEvents(apiData, year = 2026) {
      return apiData.map(h => ({
        title: h.holiday_name,
        start: `${this.convertHolidayDate(h.date, year)}T12:00:00`,
        allDay: true,
        display: 'block',
        classNames: ['holiday-block-event'],
        extendedProps: {
          publicHoliday: true,
          holidayName:   h.holiday_name,
          mandatory:     h.is_mandatory,
        },
      }));
    },

    initCalendar() {
      const el = document.getElementById('admin-calendar');
      if (!el || !window.FullCalendar) return;

      this.calendar = new window.FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        timeZone: 'local',

        headerToolbar: {
          left:   'prev,next today',
          center: 'title',
          right:  '',
        },

        height: '625px',
        events: this.calendarEvents,

        // ── fires whenever the visible date range changes (prev / next / today) ──
        datesSet: (info) => {
          // info.view.currentStart is the first day of the visible month
          const d = info.view.currentStart;
          this.currentMonth = d.getMonth();
          this.currentYear  = d.getFullYear();
        },

        dayCellClassNames: (arg) => {
          const cell = new Date(arg.date);
          cell.setHours(0, 0, 0, 0);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const classes = [];
          if (cell < today) classes.push('fc-day-past-blocked');
          const dow = arg.date.getDay();
          if (dow === 0 || dow === 6) classes.push('fc-weekend-blocked');
          return classes;
        },

        eventClick: (info) => {
          if (
            info.event.extendedProps?.publicHoliday ||
            info.event.display === 'background' ||
            info.event.classNames?.includes('holiday-block-event')
          ) {
            info.jsEvent.preventDefault();
            info.jsEvent.stopPropagation();
            return false;
          }
          this.$emit('event-click', info.event.extendedProps);
        },

        dateClick: (info) => {
          const clickedDateObj = new Date(info.dateStr);
          const dow = clickedDateObj.getDay();
          if (dow === 0 || dow === 6) return;

          const isHoliday = this.calendarEvents.some(event => {
            if (!event.extendedProps?.publicHoliday) return false;
            return event.start.split('T')[0] === info.dateStr;
          });
          if (isHoliday) return;

          this.$emit('date-click', info.dateStr);
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

    selectUser(id) {
      this.selectedUserId = id;
      this.dropdownOpen   = false;
      this.$emit('filter-user', id);
    },

    closeDropdown() {
      this.dropdownOpen = false;
    },
  },
};
</script>

<style>
#admin-calendar .fc-day-past-blocked {
  background: repeating-linear-gradient(
    -45deg, transparent, transparent 4px,
    rgba(0,0,0,0.03) 4px, rgba(0,0,0,0.03) 8px
  ) !important;
  cursor: not-allowed !important;
}
#admin-calendar .fc-day-past-blocked .fc-daygrid-day-number { color: #cbd5e1; }

#admin-calendar .fc-weekend-blocked {
  background: repeating-linear-gradient(
    -45deg, transparent, transparent 4px,
    rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px
  ) !important;
  background-color: #f1f5f9 !important;
  cursor: not-allowed !important;
}
#admin-calendar .fc-weekend-blocked .fc-daygrid-day-number { color: #94a3b8 !important; }

#admin-calendar .fc-toolbar-title {
  font-family: 'DM Sans', sans-serif; font-size: 1.05rem;
  font-weight: 700; color: #0f172a; letter-spacing: -0.02em;
}
#admin-calendar .fc-button {
  font-family: 'DM Mono', monospace; font-size: 0.65rem;
  font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
  background: #6366f1 !important; border-color: #6366f1 !important;
  border-radius: 6px !important; padding: 5px 12px !important; transition: all 0.15s;
}
#admin-calendar .fc-button:hover       { background: #4f46e5 !important; border-color: #4f46e5 !important; }
#admin-calendar .fc-button-active      { background: #4338ca !important; border-color: #4338ca !important; }
#admin-calendar .fc-col-header-cell-cushion {
  font-family: 'DM Mono', monospace; font-size: 0.62rem;
  font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #94a3b8;
}
#admin-calendar .fc-daygrid-day-number {
  font-family: 'DM Mono', monospace; font-size: 0.72rem; color: #475569; padding: 6px 8px 2px;
}
#admin-calendar .fc-day-today { background: #f0f9ff !important; }
#admin-calendar .fc-day-today .fc-daygrid-day-number {
  background: #6366f1; color: #fff; border-radius: 50%;
  width: 22px; height: 22px; display: flex; align-items: center;
  justify-content: center; padding: 0; margin: 5px 6px 2px auto; font-size: 0.65rem;
}
#admin-calendar .cal-event-morning {
  background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
  color: #854d0e !important; border-left: 3px solid #d97706 !important;
  font-family: 'DM Mono', monospace !important; font-size: 0.68rem !important;
  font-weight: 600 !important; border-radius: 5px !important;
  padding: 2px 6px !important; cursor: pointer;
  box-shadow: 0 1px 4px rgba(245,158,11,.25);
}
#admin-calendar .cal-event-evening {
  background: linear-gradient(135deg, #5b21b6, #8b5cf6) !important;
  color: #ede9fe !important; border-left: 3px solid #4c1d95 !important;
  font-family: 'DM Mono', monospace !important; font-size: 0.68rem !important;
  font-weight: 600 !important; border-radius: 5px !important;
  padding: 2px 6px !important; cursor: pointer;
  box-shadow: 0 1px 4px rgba(139,92,246,.25);
}
#admin-calendar .holiday-block-event {
  display: flex !important; align-items: center !important;
  justify-content: flex-start !important;
  font-family: 'DM Sans', sans-serif !important; font-size: 0.92rem !important;
  font-weight: 800 !important; color: #dc2626 !important; padding: 6px 10px !important;
  pointer-events: none !important; user-select: none !important; cursor: default !important;
}
</style>

<style scoped>
.calendar-panel {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: visible;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid #f1f5f9; gap: 10px;
}
.head-right { display: flex; align-items: center; gap: 8px; }

/* ── Stats Bar ── */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 10px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: #fafbff;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 9px;
  flex: 1;
  padding: 4px 8px;
}
.stat-divider {
  width: 1px;
  height: 28px;
  background: #e2e8f0;
  flex-shrink: 0;
}
.stat-icon {
  width: 28px; height: 28px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.stat-icon--total   { background: #eef2ff; color: #6366f1; }
.stat-icon--morning { background: #fffbeb; color: #d97706; }
.stat-icon--evening { background: #f5f3ff; color: #7c3aed; }
.stat-icon--hours   { background: #f0fdf4; color: #16a34a; }
.stat-body {
  display: flex; flex-direction: column; gap: 1px;
}
.stat-val {
  font-family: 'DM Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
}
.stat-unit {
  font-size: 0.65rem;
  font-weight: 600;
  color: #94a3b8;
  margin-left: 1px;
}
.stat-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
}

/* User filter */
.user-filter { position: relative; }
.filter-btn {
  display: flex; align-items: center; gap: 5px;
  font-family: 'DM Mono', monospace; font-size: 0.6rem;
  font-weight: 600; letter-spacing: 0.05em;
  border: 1px solid #e2e8f0; background: #f8fafc;
  color: #64748b; padding: 4px 10px; border-radius: 6px;
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.filter-btn:hover  { border-color: #6366f1; color: #6366f1; }
.filter-btn.active { background: #eef2ff; border-color: #c7d2fe; color: #6366f1; }
.filter-dropdown {
  position: absolute; top: calc(100% + 5px); right: 0;
  background: #fff; border: 1px solid #e2e8f0; border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 50;
  min-width: 160px; overflow: hidden;
}
.dd-item {
  padding: 8px 14px;
  font-family: 'DM Sans', sans-serif; font-size: 0.78rem; color: #374151;
  cursor: pointer; transition: background 0.1s;
}
.dd-item:hover { background: #f8fafc; }
.dd-item.on    { background: #eef2ff; color: #6366f1; font-weight: 600; }
.panel-title {
  font-family: 'DM Mono', monospace; font-size: 0.62rem;
  letter-spacing: 0.15em; color: #94a3b8; font-weight: 600;
}
.view-toggle {
  display: flex; gap: 3px; background: #f1f5f9;
  padding: 2px; border-radius: 6px;
}
.view-toggle button {
  font-family: 'DM Mono', monospace; font-size: 0.6rem;
  font-weight: 600; letter-spacing: 0.05em; border: none;
  background: transparent; color: #64748b; padding: 4px 10px;
  border-radius: 4px; cursor: pointer; transition: all 0.12s;
}
.view-toggle button.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
#admin-calendar { padding: 16px; }
</style>