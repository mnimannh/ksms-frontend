<template>
  <div class="staff-shift-page">
    <!-- Sidebar -->
    <StaffSidebar />

    <!-- Main Content -->
    <div class="shift-content">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <span class="page-label">SCHEDULE</span>
          <h1 class="page-title">My Shifts</h1>
        </div>
        <div class="header-right">
          <div class="current-date-badge">
            <span class="badge-day">{{ todayDay }}</span>
            <span class="badge-date">{{ todayDate }}</span>
          </div>
          <div class="legend">
            <span class="legend-item morning">
              <span class="legend-dot"></span> Morning
            </span>
            <span class="legend-item evening">
              <span class="legend-dot"></span> Evening
            </span>
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="stats-row">
        <div class="stat-card">
          <span class="stat-number">{{ stats.totalThisMonth }}</span>
          <span class="stat-label">Shifts This Month</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.morningCount }}</span>
          <span class="stat-label">Morning Shifts</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.eveningCount }}</span>
          <span class="stat-label">Evening Shifts</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ stats.totalHours }}h</span>
          <span class="stat-label">Total Hours</span>
        </div>
      </div>

      <!-- Calendar Wrapper -->
      <div class="calendar-wrapper">
        <div id="calendar"></div>
      </div>

      <!-- Shift Detail Modal -->
      <transition name="modal-fade">
        <div v-if="selectedShift" class="modal-overlay" @click.self="selectedShift = null">
          <div class="modal-card">
            <div class="modal-header" :class="selectedShift.shiftType.toLowerCase()">
              <div class="modal-shift-type">
                <span class="shift-icon">{{ selectedShift.shiftType === 'Morning' ? '🌤' : '🌙' }}</span>
                <span>{{ selectedShift.shiftType }} Shift</span>
              </div>
              <button class="modal-close" @click="selectedShift = null">✕</button>
            </div>
            <div class="modal-body">
              <div class="modal-row">
                <span class="modal-field">Date</span>
                <span class="modal-value">{{ formatDate(selectedShift.startTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Start</span>
                <span class="modal-value">{{ formatTime(selectedShift.startTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">End</span>
                <span class="modal-value">{{ formatTime(selectedShift.endTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Duration</span>
                <span class="modal-value">{{ getDuration(selectedShift.startTime, selectedShift.endTime) }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Assigned By</span>
                <span class="modal-value">{{ selectedShift.assignedByName }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Actual Check-In</span>
                <span class="modal-value">
                  {{ selectedShift.actualCheckIn ? formatTime(selectedShift.actualCheckIn) : '—' }}
                </span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Actual Check-Out</span>
                <span class="modal-value">
                  {{ selectedShift.actualCheckOut ? formatTime(selectedShift.actualCheckOut) : '—' }}
                </span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Status</span>
                <span class="modal-value">
                  {{ selectedShift.status || 'Pending' }}
                </span>
              </div>
              <div class="modal-row notes-row" v-if="selectedShift.notes">
                <span class="modal-field">Notes</span>
                <span class="modal-value notes">{{ selectedShift.notes }}</span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import StaffSidebar from "@/components/sidebar/staffSidebar.vue";
import axios from "axios";

export default {
  name: "StaffShift",
  components: { StaffSidebar },

  data() {
    return {
      selectedShift: null,
      calendar: null,
      shifts: [],
      loading: false,
    };
  },

  computed: {
    todayDay() {
      return new Date().toLocaleDateString("en-US", { weekday: "long" });
    },
    todayDate() {
      return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    },
    stats() {
      const now = new Date();
      const thisMonth = this.shifts.filter(s => {
        const d = new Date(s.startTime);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
      const morning = thisMonth.filter(s => s.shiftType === "Morning");
      const evening = thisMonth.filter(s => s.shiftType === "Evening");
      const totalHours = thisMonth.reduce((sum, s) => {
        return sum + (new Date(s.endTime) - new Date(s.startTime)) / 3600000;
      }, 0);
      return {
        totalThisMonth: thisMonth.length,
        morningCount: morning.length,
        eveningCount: evening.length,
        totalHours: Math.round(totalHours),
      };
    },
    calendarEvents() {
      return this.shifts.map(shift => ({
        id: shift.id,
        title: `${shift.shiftType === "Morning" ? "🌤" : "🌙"} ${shift.shiftType}`,
        start: shift.startTime,
        end: shift.endTime,
        classNames: [`event-${shift.shiftType.toLowerCase()}`],
        extendedProps: { ...shift },
      }));
    }
  },

  mounted() {
    this.fetchShifts();
  },

  beforeUnmount() {
    if (this.calendar) this.calendar.destroy();
  },

  methods: {
async fetchShifts() {
  this.loading = true;
  try {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    // 1️⃣ Fetch all shifts for the current staff
    const { data: shiftsData } = await axios.get(`${API_BASE_URL}/api/shifts`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 2️⃣ Fetch attendance for each shift
    const shiftsWithAttendance = await Promise.all(
      shiftsData.map(async (shift) => {
        try {
          const { data: attendanceLogs } = await axios.get(
            `${API_BASE_URL}/api/attendance/shift/${shift.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const log = attendanceLogs[0] || {};
          return {
            ...shift,
            actualCheckIn: log.checkIn || null,
            actualCheckOut: log.checkOut || null,
            status: log.status || "Pending",
          };
        } catch (err) {
          console.error(`Error fetching attendance for shift ${shift.id}:`, err);
          return { ...shift, actualCheckIn: null, actualCheckOut: null, status: "Pending" };
        }
      })
    );

    // 3️⃣ Update component state
    this.shifts = shiftsWithAttendance;

    // 4️⃣ Update or initialize FullCalendar
    if (this.calendar) {
      this.calendar.getEventSources().forEach((source) => source.remove());
      this.calendar.addEventSource(this.calendarEvents);
    } else {
      this.loadFullCalendar();
    }

  } catch (err) {
    console.error("Error fetching shifts:", err);
  } finally {
    this.loading = false;
  }
},

    loadFullCalendar() {
      // Avoid appending duplicate link/script tags if they already exist
      if (!document.getElementById("fc-min-css")) {
        const link = document.createElement("link");
        link.id = "fc-min-css";
        link.rel = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css";
        document.head.appendChild(link);
      }

      if (!window.FullCalendar) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js";
        script.onload = () => this.initCalendar();
        document.head.appendChild(script);
      } else {
        this.initCalendar();
      }
    },

    initCalendar() {
      const el = document.getElementById("calendar");
      if (!el || !window.FullCalendar || this.calendar) return;

      const self = this;
      this.calendar = new window.FullCalendar.Calendar(el, {
        initialView: "dayGridMonth",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listMonth"
        },
        height: "auto",
        // Load events once during initialization
        events: this.calendarEvents,
        eventClick(info) {
          self.selectedShift = { ...info.event.extendedProps };
        },
        dayMaxEvents: 3,
        eventDisplay: "block",
      });

      this.calendar.render();
    },

    formatDate(dt) {
      return new Date(dt).toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric"
      });
    },
    formatTime(dt) {
      return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    getDuration(start, end) {
      const hours = (new Date(end) - new Date(start)) / 3600000;
      return `${hours}h`;
    }
  }
};
</script>

<style>
/* FullCalendar global overrides */
:root {
  --fc-border-color: #f0f0f0;
  --fc-today-bg-color: #fffbf0;
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: #fafafa;
  --fc-event-border-color: transparent;
  --fc-button-bg-color: #111;
  --fc-button-border-color: #111;
  --fc-button-hover-bg-color: #333;
  --fc-button-active-bg-color: #000;
  --fc-button-active-border-color: #000;
}

.fc .fc-toolbar-title {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 1.35rem;
  color: #111;
  letter-spacing: -0.02em;
}

.fc .fc-button {
  font-family: 'DM Mono', 'Courier New', monospace;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 6px !important;
  padding: 6px 14px !important;
  transition: all 0.15s ease;
}

.fc .fc-col-header-cell-cushion {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #888;
  padding: 10px 0 8px;
}

.fc .fc-daygrid-day-number {
  font-family: 'DM Mono', monospace;
  font-size: 0.8rem;
  color: #444;
  padding: 8px 10px 4px;
}

.fc .fc-day-today .fc-daygrid-day-number {
  background: #111;
  color: #fff;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  margin: 6px 8px 4px auto;
}

/* Event styles */
.fc .event-morning {
  background: linear-gradient(135deg, #f5a623, #f7c059) !important;
  color: #3a2000 !important;
  border-left: 3px solid #e08800 !important;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 5px !important;
  padding: 2px 6px !important;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(245, 166, 35, 0.25);
}

.fc .event-evening {
  background: linear-gradient(135deg, #4a3f7a, #6b5db5) !important;
  color: #e8e0ff !important;
  border-left: 3px solid #2d2059 !important;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  border-radius: 5px !important;
  padding: 2px 6px !important;
  cursor: pointer;
  box-shadow: 0 1px 4px rgba(74, 63, 122, 0.25);
}

.fc .fc-list-event-dot {
  display: none;
}

.fc .fc-list-event td {
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
}

.fc .fc-timegrid-event {
  border-radius: 6px !important;
}

.fc .fc-scroller {
  overflow: hidden !important;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;600&family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.staff-shift-page {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
}

.shift-content {
  flex: 1;
  padding: 36px 40px;
  max-width: calc(100% - 240px);
  overflow-x: hidden;
}

/* Header */
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 28px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.page-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: #aaa;
  font-weight: 500;
}

.page-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 2.2rem;
  color: #111;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

.current-date-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.badge-day {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: #bbb;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.badge-date {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem;
  color: #555;
  font-weight: 500;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  letter-spacing: 0.03em;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  display: inline-block;
}

.legend-item.morning .legend-dot { background: linear-gradient(135deg, #f5a623, #f7c059); }
.legend-item.evening .legend-dot { background: linear-gradient(135deg, #4a3f7a, #6b5db5); }

/* Stats */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 12px;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  transform: translateY(-1px);
}

.stat-number {
  font-family: 'DM Serif Display', Georgia, serif;
  font-size: 2rem;
  color: #111;
  line-height: 1;
  letter-spacing: -0.03em;
}

.stat-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  color: #aaa;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Calendar */
.calendar-wrapper {
  background: #fff;
  border: 1px solid #ebebeb;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  width: 420px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header.morning {
  background: linear-gradient(135deg, #f5a623, #f7c059);
  color: #3a2000;
}

.modal-header.evening {
  background: linear-gradient(135deg, #4a3f7a, #6b5db5);
  color: #e8e0ff;
}

.modal-shift-type {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'DM Sans', sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

.shift-icon { font-size: 1.2rem; }

.modal-close {
  background: rgba(0,0,0,0.1);
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  color: inherit;
  transition: background 0.15s;
}

.modal-close:hover { background: rgba(0,0,0,0.2); }

.modal-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.modal-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid #f3f3f3;
}

.modal-row:last-child { border-bottom: none; }

.notes-row { align-items: flex-start; gap: 16px; }

.modal-field {
  font-family: 'DM Mono', monospace;
  font-size: 0.68rem;
  color: #aaa;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  flex-shrink: 0;
  padding-top: 1px;
}

.modal-value {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem;
  color: #222;
  font-weight: 500;
  text-align: right;
}

.modal-value.notes {
  text-align: right;
  color: #555;
  font-weight: 400;
  font-size: 0.82rem;
  line-height: 1.5;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
  transform: scale(0.95) translateY(8px);
}

@media (max-width: 900px) {
  .shift-content { padding: 24px 20px; max-width: 100%; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>