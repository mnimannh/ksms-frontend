<template>
  <div class="calendar-panel">
    <div class="panel-head">
      <span class="panel-title">SCHEDULE OVERVIEW</span>
      <div class="view-toggle">
        <button :class="{ active: calView === 'dayGridMonth' }" @click="switchView('dayGridMonth')">Month</button>
        <button :class="{ active: calView === 'timeGridWeek' }" @click="switchView('timeGridWeek')">Week</button>
        <button :class="{ active: calView === 'listWeek' }"    @click="switchView('listWeek')">List</button>
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
  },
  emits: ['event-click', 'date-click'],

  data() {
    return {
      calendar: null,
      calView: 'dayGridMonth',
    };
  },

  mounted() {
    this.loadFullCalendar();
  },

  beforeUnmount() {
    if (this.calendar) this.calendar.destroy();
  },

  watch: {
    calendarEvents(newEvents) {
      if (!this.calendar) return;
      this.calendar.removeAllEvents();
      newEvents.forEach(e => this.calendar.addEvent(e));
    },
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

      this.calendar = new window.FullCalendar.Calendar(el, {
        initialView: 'dayGridMonth',
        headerToolbar: { left: 'prev,next today', center: 'title', right: '' },
        height: '625px',
        events: this.calendarEvents,
        eventClick: (info) => {
          this.$emit('event-click', info.event.extendedProps);
        },
        dateClick: (info) => {          // ← add this
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
  },
};
</script>

<!-- FullCalendar global overrides -->
<style>
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
</style>

<style scoped>
.calendar-panel {
  background: #fff;
  border: 1px solid #f1f5f9;
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