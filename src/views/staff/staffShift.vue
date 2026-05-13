<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="page">

      <!-- ── TOP BAR ── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ todayDay }}, {{ todayDate }}</p>
          <h1 class="topbar-title">My <span class="accent">Shifts</span></h1>
        </div>
        <div class="topbar-right">
          <div class="legend">
            <span class="legend-item morning">
              <span class="legend-dot"></span> Morning
            </span>
            <span class="legend-item evening">
              <span class="legend-dot"></span> Evening
            </span>
          </div>
          <div class="live-dot"><span class="pulse" />Live</div>
        </div>
      </div>

      <!-- ── STAT CARDS ── -->
      <div class="summary-row">
        <div class="summary-card" style="animation-delay:0ms">
          <div class="summary-icon" style="background:#eef2ff; color:#6366f1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.totalThisMonth }}</p>
            <p class="summary-label">Shifts This Month</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:60ms">
          <div class="summary-icon" style="background:#fffbeb; color:#f59e0b">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.morningCount }}</p>
            <p class="summary-label">Morning Shifts</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:120ms">
          <div class="summary-icon" style="background:#f5f3ff; color:#8b5cf6">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.eveningCount }}</p>
            <p class="summary-label">Evening Shifts</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:180ms">
          <div class="summary-icon" style="background:#f0fdf4; color:#10b981">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ stats.totalHours }}<span class="summary-unit">h</span></p>
            <p class="summary-label">Total Hours</p>
          </div>
        </div>
      </div>

      <!-- ── CALENDAR ── -->
      <div class="calendar-panel">
        <div class="card-header">
          <div>
            <p class="card-title">Shift Calendar</p>
            <p class="card-sub">Click on any shift to view details</p>
          </div>
        </div>
        <div class="calendar-body">
          <div id="calendar"></div>
        </div>
      </div>

      <!-- ── SHIFT DETAIL MODAL ── -->
      <transition name="modal-fade">
        <div v-if="selectedShift" class="modal-overlay" @click.self="selectedShift = null">
          <div class="modal-card">
            <div class="modal-header" :class="selectedShift.shiftType.toLowerCase()">
              <div class="modal-shift-type">
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
                <span class="modal-value">{{ selectedShift.actualCheckIn ? formatTime(selectedShift.actualCheckIn) : '—' }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Actual Check-Out</span>
                <span class="modal-value">{{ selectedShift.actualCheckOut ? formatTime(selectedShift.actualCheckOut) : '—' }}</span>
              </div>
              <div class="modal-row">
                <span class="modal-field">Status</span>
                <span class="modal-value">{{ selectedShift.status || 'Pending' }}</span>
              </div>
              <div class="modal-row notes-row" v-if="selectedShift.notes">
                <span class="modal-field">Notes</span>
                <span class="modal-value notes">{{ selectedShift.notes }}</span>
              </div>
            </div>
            <div class="modal-footer-actions">
              <button class="btn-swap" @click="openSwapModal(selectedShift)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                Request Swap
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- ── SWAP REQUEST MODAL ── -->
      <SwapRequestModal
        v-if="swapShift"
        :shift="swapShift"
        :staff-list="staffList"
        @close="swapShift = null"
        @submitted="onSwapSubmitted"
      />

    </main>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import StaffSidebar from "@/components/sidebar/staffSidebar.vue";
import SwapRequestModal from "@/components/staff-shift/SwapRequestModal.vue";
import axios from "axios";

export default {
  name: "StaffShift",
  components: { StaffSidebar, SwapRequestModal },

  data() {
    return {
      selectedShift: null,
      swapShift:     null,
      staffList:     [],
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
      const totalHours = thisMonth.reduce((sum, s) => {
        return sum + (new Date(s.endTime) - new Date(s.startTime)) / 3600000;
      }, 0);
      return {
        totalThisMonth: thisMonth.length,
        morningCount: thisMonth.filter(s => s.shiftType === "Morning").length,
        eveningCount: thisMonth.filter(s => s.shiftType === "Evening").length,
        totalHours: Math.round(totalHours),
      };
    },
    calendarEvents() {
      return this.shifts.map(shift => ({
        id: shift.id,
        title: shift.shiftType,
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
    openSwapModal(shift) {
      this.swapShift    = shift;
      this.selectedShift = null;
    },
    onSwapSubmitted() {
      this.swapShift = null;
    },

    async fetchShifts() {
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        const { data: shiftsData } = await axios.get(`${API_BASE_URL}/api/shifts/staff/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const shiftsWithAttendance = await Promise.all(
          shiftsData.map(async (shift) => {
            try {
              const { data: attendanceLogs } = await axios.get(
                `${API_BASE_URL}/api/attendance/shift/${shift.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const log = attendanceLogs[0] || {};
              return { ...shift, actualCheckIn: log.checkIn || null, actualCheckOut: log.checkOut || null, status: log.status || "Pending" };
            } catch {
              return { ...shift, actualCheckIn: null, actualCheckOut: null, status: "Pending" };
            }
          })
        );

        this.shifts = shiftsWithAttendance;

        // Fetch colleague list for swap modal
        try {
          const { data: users } = await axios.get(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const myId = JSON.parse(atob(token.split('.')[1])).id;
          this.staffList = users.filter(u => u.role === 'staff' && u.status === 'active' && u.id !== myId);
        } catch { /* non-fatal */ }

        if (this.calendar) {
          this.calendar.getEventSources().forEach(s => s.remove());
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
        headerToolbar: { left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,listMonth" },
        height: "auto",
        events: this.calendarEvents,
        eventClick(info) { self.selectedShift = { ...info.event.extendedProps }; },
        dayMaxEvents: 3,
        eventDisplay: "block",
      });
      this.calendar.render();
    },

    formatDate(dt) {
      return new Date(dt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    },
    formatTime(dt) {
      return new Date(dt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    },
    getDuration(start, end) {
      return `${(new Date(end) - new Date(start)) / 3600000}h`;
    },
  },
};
</script>

<style>
/* ── FullCalendar global overrides (unchanged) ── */
:root {
  --fc-border-color: #f1f5f9;
  --fc-today-bg-color: #eff6ff;
  --fc-page-bg-color: transparent;
  --fc-neutral-bg-color: #f8fafc;
  --fc-event-border-color: transparent;
  --fc-button-bg-color: #0f172a;
  --fc-button-border-color: #0f172a;
  --fc-button-hover-bg-color: #1e293b;
  --fc-button-active-bg-color: #0f172a;
  --fc-button-active-border-color: #0f172a;
}
.fc .fc-toolbar-title { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.35rem; color: #0f172a; letter-spacing: -0.02em; }
.fc .fc-button { font-family: 'DM Mono', 'Courier New', monospace; font-size: 0.72rem; font-weight: 500; letter-spacing: 0.04em; text-transform: uppercase; border-radius: 6px !important; padding: 6px 14px !important; transition: all 0.15s ease; }
.fc .fc-col-header-cell-cushion { font-family: 'DM Mono', monospace; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; padding: 10px 0 8px; }
.fc .fc-daygrid-day-number { font-family: 'DM Mono', monospace; font-size: 0.8rem; color: #64748b; padding: 8px 10px 4px; }
.fc .fc-day-today .fc-daygrid-day-number { background: #0f172a; color: #fff; border-radius: 50%; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; padding: 0; margin: 6px 8px 4px auto; }
.fc .event-morning { background: linear-gradient(135deg, #f59e0b, #fbbf24) !important; color: #854d0e !important; border-left: 3px solid #d97706 !important; font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 600; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; box-shadow: 0 1px 4px rgba(245,158,11,.25); }
.fc .event-evening { background: linear-gradient(135deg, #5b21b6, #8b5cf6) !important; color: #ede9fe !important; border-left: 3px solid #4c1d95 !important; font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 600; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; box-shadow: 0 1px 4px rgba(139,92,246,.25); }
.fc .fc-list-event-dot { display: none; }
.fc .fc-list-event td { font-family: 'DM Mono', monospace; font-size: 0.78rem; }
.fc .fc-timegrid-event { border-radius: 6px !important; }
.fc .fc-scroller { overflow: hidden !important; }
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base (mobile) ───────────────────────────────────────────── */
.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b;
}

.page {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px; overflow-x: hidden;
}

/* Topbar — stacked on mobile */
.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }

.topbar-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

.legend { display: flex; gap: 12px; }
.legend-item {
  font-family: 'DM Mono', monospace;
  font-size: 0.7rem; display: flex; align-items: center;
  gap: 6px; color: #64748b; letter-spacing: 0.03em;
}
.legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.legend-item.morning .legend-dot { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.legend-item.evening .legend-dot { background: linear-gradient(135deg, #5b21b6, #8b5cf6); }

.live-dot {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #10b981; font-weight: 500;
}
.pulse {
  width: 8px; height: 8px;
  background: #10b981; border-radius: 50%; display: block;
  animation: pulse 1.8s ease infinite;
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}

/* Summary cards — 2 cols on mobile */
.summary-row {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;
}
.summary-card {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; padding: 14px 16px;
  display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  animation: fadeUp .35s ease both;
  transition: box-shadow .15s, transform .15s;
}
.summary-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); transform: translateY(-1px); }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.summary-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.summary-val {
  font-size: 22px; font-weight: 700; color: #0f172a;
  letter-spacing: -.03em; line-height: 1; margin-bottom: 3px;
}
.summary-unit { font-size: 14px; font-weight: 500; color: #94a3b8; margin-left: 2px; }
.summary-label { font-size: 11px; color: #94a3b8; }

/* Calendar panel */
.calendar-panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04); overflow: hidden;
}
.card-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px; border-bottom: 1px solid #f8fafc;
}
.card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }
.calendar-body { padding: 12px; }

/* Modal — full-width on mobile */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(15,23,42,.45); backdrop-filter: blur(4px);
  display: flex; align-items: flex-end; justify-content: center;
  z-index: 1000; padding: 0;
}
.modal-card {
  background: #fff; border-radius: 16px 16px 0 0;
  width: 100%; overflow: hidden;
  box-shadow: 0 -8px 40px rgba(0,0,0,.2);
}
.modal-header {
  padding: 18px 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.modal-header.morning { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #854d0e; }
.modal-header.evening { background: linear-gradient(135deg, #5b21b6, #8b5cf6); color: #ede9fe; }
.modal-shift-type {
  display: flex; align-items: center; gap: 10px;
  font-weight: 600; font-size: 1rem;
}
.modal-close {
  background: rgba(0,0,0,.1); border: none;
  width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.75rem; color: inherit; transition: background .15s;
}
.modal-close:hover { background: rgba(0,0,0,.2); }
.modal-body { padding: 16px 20px 28px; display: flex; flex-direction: column; }
.modal-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 10px 0; border-bottom: 1px solid #f1f5f9;
}
.modal-row:last-child { border-bottom: none; }
.notes-row { align-items: flex-start; gap: 16px; }
.modal-field {
  font-family: 'DM Mono', monospace; font-size: 0.68rem;
  color: #94a3b8; letter-spacing: 0.08em; text-transform: uppercase;
  flex-shrink: 0; padding-top: 1px;
}
.modal-value {
  font-family: 'DM Sans', sans-serif; font-size: 0.875rem;
  color: #0f172a; font-weight: 500; text-align: right;
}
.modal-value.notes { color: #475569; font-weight: 400; font-size: 0.82rem; line-height: 1.5; }

.modal-footer-actions {
  padding: 12px 20px 16px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end;
}
.btn-swap {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #475569;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all .15s;
}
.btn-swap:hover { background: #6366f1; border-color: #6366f1; color: #fff; }

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from,  .modal-fade-leave-to      { opacity: 0; }
.modal-fade-enter-active .modal-card, .modal-fade-leave-active .modal-card { transition: transform .25s ease; }
.modal-fade-enter-from   .modal-card, .modal-fade-leave-to    .modal-card  { transform: translateY(100%); }

/* ── Tablet (≥ 600px) ─────────────────────────────────────── */
@media (min-width: 600px) {
  .page { padding: 24px 24px 44px; gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  .topbar-title { font-size: 24px; }
  .summary-row { gap: 12px; }
  .summary-card { padding: 16px 18px; }
  .summary-icon { width: 42px; height: 42px; border-radius: 11px; }
  .summary-val { font-size: 24px; }
  .card-header { padding: 18px 20px 14px; }
  .calendar-body { padding: 16px; }
  .modal-overlay { align-items: center; padding: 20px; }
  .modal-card { border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
  .modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card { transform: scale(.95) translateY(8px); }
}

/* ── Desktop (≥ 900px) ────────────────────────────────────── */
@media (min-width: 900px) {
  .page { padding: 32px 36px 48px; gap: 20px; }
  .topbar-title { font-size: 26px; }
  .summary-row { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .summary-card { padding: 18px 20px; gap: 14px; }
  .summary-val { font-size: 26px; }
  .summary-unit { font-size: 16px; }
  .card-header { padding: 20px 24px 16px; }
  .calendar-body { padding: 24px; }
}
</style>
