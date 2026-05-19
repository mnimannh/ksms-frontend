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
    };
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
      
      // Clear out existing event streams safely
      const sources = this.calendar.getEventSources();
      sources.forEach(source => source.remove());
      
      // Inject the combined shift + unclickable background source cleanly
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

  // ─────────────────────────────────────────────
  // CONVERT API DATE
  // "Dec 25" → "2026-12-25"
  // ─────────────────────────────────────────────
  convertHolidayDate(dateStr, year = 2026) {
    const monthMap = {
      Jan: '01',
      Feb: '02',
      Mar: '03',
      Apr: '04',
      May: '05',
      Jun: '06',
      Jul: '07',
      Aug: '08',
      Sep: '09',
      Oct: '10',
      Nov: '11',
      Dec: '12'
    };

    const [monthText, day] = dateStr.split(' ');

    return `${year}-${monthMap[monthText]}-${day.padStart(2, '0')}`;
  },

  // ─────────────────────────────────────────────
  // BUILD HOLIDAY EVENTS
  // ─────────────────────────────────────────────
  buildHolidayEvents(apiData, year = 2026) {
    return apiData.map(h => ({
      title: h.holiday_name,

      // VERY IMPORTANT
      // Use NOON to prevent timezone rollback
      start: `${this.convertHolidayDate(h.date, year)}T12:00:00`,

      allDay: true,

      display: 'block',

      classNames: ['holiday-block-event'],

      extendedProps: {
        publicHoliday: true,
        holidayName: h.holiday_name,
        mandatory: h.is_mandatory
      }
    }));
  },

  initCalendar() {
    const el = document.getElementById('admin-calendar');

    if (!el || !window.FullCalendar) return;

    this.calendar = new window.FullCalendar.Calendar(el, {

      initialView: 'dayGridMonth',

      // IMPORTANT FIX
      timeZone: 'local',

      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: ''
      },

      height: '625px',

      events: this.calendarEvents,

      dayCellClassNames: (arg) => {

        const cell = new Date(arg.date);
        cell.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const classes = [];

        // Block past dates
        if (cell < today) {
          classes.push('fc-day-past-blocked');
        }

        // Block weekends
        const dayOfWeek = arg.date.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          classes.push('fc-weekend-blocked');
        }

        return classes;
      },

      eventClick: (info) => {

        // Prevent holiday clicks
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

        // Block weekends
        const dayOfWeek = clickedDateObj.getDay();

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return;
        }

        // FIXED HOLIDAY CHECK
        const isHoliday = this.calendarEvents.some(event => {

          if (!event.extendedProps?.publicHoliday) {
            return false;
          }

          // Normalize event date safely
          const eventDate = event.start.split('T')[0];

          return eventDate === info.dateStr;
        });

        if (isHoliday) {
          return;
        }

        this.$emit('date-click', info.dateStr);
      },

      dayMaxEvents: 3,

      eventDisplay: 'block',
    });

    this.calendar.render();
  },

  switchView(v) {
    this.calView = v;

    if (this.calendar) {
      this.calendar.changeView(v);
    }
  },

  selectUser(id) {
    this.selectedUserId = id;
    this.dropdownOpen = false;
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
    -45deg,
    transparent,
    transparent 4px,
    rgba(0,0,0,0.03) 4px,
    rgba(0,0,0,0.03) 8px
  ) !important;
  cursor: not-allowed !important;
}
#admin-calendar .fc-day-past-blocked .fc-daygrid-day-number {
  color: #cbd5e1;
}

/* ── Weekend Striped Grey Lockout Styles ── */
#admin-calendar .fc-weekend-blocked {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(0,0,0,0.04) 4px,
    rgba(0,0,0,0.04) 8px
  ) !important;
  background-color: #f1f5f9 !important; /* Clean light grey background block */
  cursor: not-allowed !important;
}
#admin-calendar .fc-weekend-blocked .fc-daygrid-day-number {
  color: #94a3b8 !important; /* Mute day numerals on weekends */
}

#admin-calendar .fc-toolbar-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.02em;
}
#admin-calendar .fc-button {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #6366f1 !important;
  border-color: #6366f1 !important;
  border-radius: 6px !important;
  padding: 5px 12px !important;
  transition: all 0.15s;
}
#admin-calendar .fc-button:hover        { background: #4f46e5 !important; border-color: #4f46e5 !important; }
#admin-calendar .fc-button-active       { background: #4338ca !important; border-color: #4338ca !important; }
#admin-calendar .fc-col-header-cell-cushion {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #94a3b8;
}
#admin-calendar .fc-daygrid-day-number {
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  color: #475569;
  padding: 6px 8px 2px;
}
#admin-calendar .fc-day-today { background: #f0f9ff !important; }
#admin-calendar .fc-day-today .fc-daygrid-day-number {
  background: #6366f1;
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
  background: linear-gradient(135deg, #f59e0b, #fbbf24) !important;
  color: #854d0e !important;
  border-left: 3px solid #d97706 !important;
  font-family: 'DM Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  border-radius: 5px !important;
  padding: 2px 6px !important;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(245,158,11,.25);
}
#admin-calendar .cal-event-evening {
  background: linear-gradient(135deg, #5b21b6, #8b5cf6) !important;
  color: #ede9fe !important;
  border-left: 3px solid #4c1d95 !important;
  font-family: 'DM Mono', monospace !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  border-radius: 5px !important;
  padding: 2px 6px !important;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(139,92,246,.25);
}

/* ── Updated Public Holiday Layout & Click Immunization overrides ── */
#admin-calendar .holiday-block-event {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.92rem !important;          /* Bigger, more prominent typography */
  font-weight: 800 !important;            /* Heavy bold font weight style */
  color: #dc2626 !important;             /* Holiday crimson red */
  padding: 6px 10px !important;
  
  /* Formulates complete UI interaction lockout */
  pointer-events: none !important; 
  user-select: none !important;
  cursor: default !important;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
  gap: 10px;
}
.head-right {
  display: flex;
  align-items: center;
  gap: 8px;
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
.filter-btn:hover { border-color: #6366f1; color: #6366f1; }
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
.dd-item.on { background: #eef2ff; color: #6366f1; font-weight: 600; }
.panel-title {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  color: #94a3b8;
  font-weight: 600;
}
.view-toggle {
  display: flex;
  gap: 3px;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 6px;
}
.view-toggle button {
  font-family: 'DM Mono', monospace;
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
</style>