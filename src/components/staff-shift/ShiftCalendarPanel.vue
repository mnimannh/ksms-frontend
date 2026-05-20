<template>
  <div class="calendar-panel" :class="{ 'swap-mode-active': isSwapMode }">
    <div class="card-header calendar-header-split">
      <div>
        <p class="card-title">
          {{ isSwapMode ? '⚡ Select Your Shift to Swap' : 'Shift Calendar' }}
        </p>
        <p class="card-sub">
          {{ isSwapMode
            ? 'Pick an eligible unticked shift directly on your schedule grid'
            : "Select a teammate's shift on the calendar to issue a swap request directly" }}
        </p>
      </div>

      <div class="calendar-actions-right">
        <button
          v-if="isSwapMode && selectedMyShiftId"
          class="btn-confirm-swap animate-pop"
          @click="$emit('execute-swap')"
        >
          Send Swap Request ✓
        </button>
        <button v-if="isSwapMode" class="btn-cancel-swap" @click="$emit('cancel-swap')">
          Cancel Selection
        </button>

        <div v-else class="colleague-selector-wrapper">
          <label for="colleague-select" class="selector-label">Compare Schedule With:</label>
          <select
            id="colleague-select"
            :value="selectedColleagueId || ''"
            class="colleague-dropdown"
            @change="onColleagueDropdownChange"
          >
            <option value="">None (Only My Shifts)</option>
            <option v-for="user in staffList" :key="user.id" :value="user.id">
              {{ user.fullName }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- ── Stats Bar ── -->
    <div class="stats-bar" v-if="!isSwapMode">
      <div class="stat-card">
        <div class="stat-icon stat-icon--total">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ totalShifts }}</span>
          <span class="stat-label">Total Shifts</span>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--morning">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ morningShifts }}</span>
          <span class="stat-label">Morning</span>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--evening">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ eveningShifts }}</span>
          <span class="stat-label">Evening</span>
        </div>
      </div>

      <div class="stat-divider"></div>

      <div class="stat-card">
        <div class="stat-icon stat-icon--hours">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
          </svg>
        </div>
        <div class="stat-body">
          <span class="stat-val">{{ totalHours }}<span class="stat-unit">h</span></span>
          <span class="stat-label">Total Hours</span>
        </div>
      </div>
    </div>

    <div class="calendar-body">
      <div v-if="loadingColleague" class="calendar-overlay-loader">Updating view...</div>
      <div id="calendar" class="staff-calendar-render"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShiftCalendarPanel",

  props: {
    shifts:              { type: Array,  default: () => [] },
    colleagueShifts:     { type: Array,  default: () => [] },
    swapRequests:        { type: Array,  default: () => [] },
    publicHolidays:      { type: Array,  default: () => [] },
    staffList:           { type: Array,  default: () => [] },
    myId:                { type: [Number, String], default: null },
    selectedColleagueId: { type: [Number, String], default: null },
    isSwapMode:          { type: Boolean, default: false },
    targetSwapShift:     { type: Object,  default: null },
    selectedMyShiftId:   { type: [Number, String], default: null },
    loadingColleague:    { type: Boolean, default: false },
  },

  emits: [
    "shift-click",
    "shift-selected",
    "colleague-change",
    "cancel-swap",
    "execute-swap",
  ],

  data() {
    return {
      calendar:     null,
      currentMonth: new Date().getMonth(),   // 0-indexed
      currentYear:  new Date().getFullYear(),
    };
  },

  computed: {
    // ── Stats: own shifts only, filtered to visible month ──
    monthlyShifts() {
      return this.shifts.filter(s => {
        if (!s.startTime) return false;
        const d = new Date(s.startTime);
        return d.getMonth() === this.currentMonth && d.getFullYear() === this.currentYear;
      });
    },

    totalShifts()   { return this.monthlyShifts.length; },

    morningShifts() {
      return this.monthlyShifts.filter(s =>
        (s.shiftType || '').toLowerCase() === 'morning'
      ).length;
    },

    eveningShifts() {
      return this.monthlyShifts.filter(s =>
        (s.shiftType || '').toLowerCase() === 'evening'
      ).length;
    },

    totalHours() {
      const raw = this.monthlyShifts.reduce((acc, s) => {
        if (s.startTime && s.endTime) {
          return acc + (new Date(s.endTime) - new Date(s.startTime)) / 3_600_000;
        }
        return acc;
      }, 0);
      return raw % 1 === 0 ? raw : parseFloat(raw.toFixed(1));
    },

    // ── Calendar events (unchanged) ──
    calendarEvents() {
      const myEvents = this.shifts.map(shift => {
        const hasPending = this.isShiftPendingSwap(shift.id);
        return {
          id: `my-${shift.id}`,
          title: `Me: ${shift.shiftType}${hasPending ? " ⏳" : ""}`,
          start: shift.startTime,
          end:   shift.endTime,
          classNames: [`event-${shift.shiftType.toLowerCase()}`, hasPending ? "shift-has-pending" : ""],
          extendedProps: { ...shift, isColleagueEvent: false },
        };
      });

      let colleagueEvents = [];
      if (this.selectedColleagueId && this.colleagueShifts.length) {
        const activeColleague = this.staffList.find(u => u.id == this.selectedColleagueId);
        const name = activeColleague ? activeColleague.fullName : "Teammate";
        colleagueEvents = this.colleagueShifts.map(shift => {
          const hasPending = this.isShiftPendingSwap(shift.id);
          return {
            id: `colleague-${shift.id}`,
            title: `${name}: ${shift.shiftType}${hasPending ? " ⏳" : ""}`,
            start: shift.startTime,
            end:   shift.endTime,
            classNames: ["event-colleague", `event-colleague-${shift.shiftType.toLowerCase()}`, hasPending ? "shift-has-pending" : ""],
            extendedProps: { ...shift, isColleagueEvent: true, ownerName: name },
          };
        });
      }

      const holidayEvents = this.publicHolidays.map(ph => {
        const isoDate = this.convertHolidayDate(ph.date, 2026);
        return {
          id: `ph-${isoDate}`,
          title: ph.holiday_name,
          start: isoDate,
          allDay: true,
          display: "block",
          classNames: ["holiday-block-event"],
          extendedProps: { publicHoliday: true },
        };
      });

      return [...myEvents, ...colleagueEvents, ...holidayEvents];
    },
  },

  watch: {
    calendarEvents() { this.refreshCalendarSource(); },
    isSwapMode()     { this.refreshCalendarSource(); },
    selectedMyShiftId() { this.refreshCalendarSource(); },
  },

  mounted() {
    this.loadFullCalendar();
  },

  beforeUnmount() {
    if (this.calendar) this.calendar.destroy();
  },

  methods: {
    convertHolidayDate(dateStr, year = 2026) {
      const monthMap = {
        Jan: "01", Feb: "02", Mar: "03", Apr: "04",
        May: "05", Jun: "06", Jul: "07", Aug: "08",
        Sep: "09", Oct: "10", Nov: "11", Dec: "12",
      };
      const [monthText, day] = dateStr.split(" ");
      return `${year}-${monthMap[monthText]}-${day.padStart(2, "0")}`;
    },

    onColleagueDropdownChange(e) {
      const rawVal = e.target.value;
      const val = (rawVal === "" || rawVal === "null") ? null : Number(rawVal) || rawVal;
      this.$emit("colleague-change", val);
    },

    isShiftPendingSwap(shiftId) {
      return this.swapRequests.some(
        req =>
          (req.shift_id == shiftId || req.target_shift_id == shiftId) &&
          ["pending", "accepted"].includes(req.status?.toLowerCase())
      );
    },

    isShiftForbidden(myShift) {
      if (!this.targetSwapShift) return false;
      if (myShift.id === this.targetSwapShift.id) return true;
      if (this.isShiftPendingSwap(myShift.id)) return true;

      const myDate     = new Date(myShift.startTime).toDateString();
      const targetDate = new Date(this.targetSwapShift.startTime).toDateString();

      const myConflict = this.colleagueShifts.some(s =>
        new Date(s.startTime).toDateString() === myDate &&
        s.id !== this.targetSwapShift.id
      );
      const targetConflict = this.shifts.some(s =>
        new Date(s.startTime).toDateString() === targetDate &&
        s.id !== myShift.id
      );

      return myConflict || targetConflict;
    },

    refreshCalendarSource() {
      if (this.calendar) {
        this.calendar.removeAllEventSources();
        this.calendar.addEventSource(this.calendarEvents);
      } else {
        this.loadFullCalendar();
      }
    },

    loadFullCalendar() {
      if (!document.getElementById("fc-min-css")) {
        const link = document.createElement("link");
        link.id   = "fc-min-css";
        link.rel  = "stylesheet";
        link.href = "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css";
        document.head.appendChild(link);
      }
      if (!window.FullCalendar) {
        const script  = document.createElement("script");
        script.src    = "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js";
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
        timeZone: "local",
        headerToolbar: {
          left:   "prev,next today",
          center: "title",
          right:  "dayGridMonth,timeGridWeek,listMonth",
        },
        height: "auto",
        events: this.calendarEvents,

        // ── Update stat month whenever user navigates ──
        datesSet: (info) => {
          const d = info.view.currentStart;
          self.currentMonth = d.getMonth();
          self.currentYear  = d.getFullYear();
        },

        dayCellClassNames(arg) {
          const classes   = [];
          const dayOfWeek = arg.date.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) classes.push("fc-weekend-blocked");

          const tzOffset  = arg.date.getTimezoneOffset() * 60000;
          const localDate = new Date(arg.date.getTime() - tzOffset);
          const cellDateStr = localDate.toISOString().slice(0, 10);

          const isHoliday = self.publicHolidays.some(h =>
            self.convertHolidayDate(h.date, 2026) === cellDateStr
          );
          if (isHoliday) classes.push("fc-day-has-holiday");

          return classes;
        },

        eventClick(info) {
          if (
            info.event.extendedProps?.publicHoliday ||
            info.event.classNames?.includes("holiday-block-event")
          ) {
            info.jsEvent.preventDefault();
            return false;
          }
          if (self.isSwapMode) return;
          self.$emit("shift-click", { ...info.event.extendedProps });
        },

        eventContent(arg) {
          const props         = arg.event.extendedProps;
          const mainContainer = document.createElement("div");
          mainContainer.className = "fc-custom-event-wrapper";

          const titleSpan     = document.createElement("span");
          titleSpan.innerText = arg.event.title;
          mainContainer.appendChild(titleSpan);

          if (self.isSwapMode && !props.isColleagueEvent && !props.publicHoliday) {
            const actionButton = document.createElement("button");
            const isForbidden  = self.isShiftForbidden(props);
            const isSelected   = self.selectedMyShiftId === props.id;

            if (isForbidden) {
              actionButton.className = "fc-event-tick-btn forbidden";
              actionButton.innerHTML = "✕";
              actionButton.disabled  = true;
            } else if (isSelected) {
              actionButton.className = "fc-event-tick-btn selected";
              actionButton.innerHTML = "✓";
            } else {
              actionButton.className = "fc-event-tick-btn unselected";
              actionButton.innerHTML = "";
            }

            actionButton.addEventListener("click", e => {
              e.stopPropagation();
              if (!isForbidden) self.$emit("shift-selected", props);
            });

            mainContainer.appendChild(actionButton);
          }

          return { domNodes: [mainContainer] };
        },

        dayMaxEvents: 4,
        eventDisplay: "block",
      });

      this.calendar.render();
    },
  },
};
</script>

<style>
/* ── FullCalendar Core Overrides ── */
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

.staff-calendar-render .fc-toolbar-title { font-family: 'DM Sans', sans-serif !important; font-size: 1.05rem !important; font-weight: 700 !important; color: #0f172a !important; letter-spacing: -0.02em !important; }
.staff-calendar-render .fc-button { font-family: 'DM Mono', monospace !important; font-size: 0.65rem !important; font-weight: 600 !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; border-radius: 6px !important; padding: 5px 12px !important; background: #6366f1 !important; border-color: #6366f1 !important; transition: all 0.15s ease; }
.staff-calendar-render .fc-button:hover { background: #4f46e5 !important; border-color: #4f46e5 !important; }
.staff-calendar-render .fc-button-active { background: #4338ca !important; border-color: #4338ca !important; }
.staff-calendar-render .fc-col-header-cell-cushion { font-family: 'DM Mono', monospace !important; font-size: 0.62rem !important; font-weight: 600 !important; letter-spacing: 0.12em !important; text-transform: uppercase !important; color: #94a3b8 !important; }
.staff-calendar-render .fc-daygrid-day-number { font-family: 'DM Mono', monospace !important; font-size: 0.72rem !important; color: #475569 !important; padding: 6px 8px 2px !important; }
.staff-calendar-render .fc-day-today { background: #f0f9ff !important; }
.staff-calendar-render .fc-day-today .fc-daygrid-day-number { background: #6366f1 !important; color: #fff !important; border-radius: 50% !important; width: 22px !important; height: 22px !important; display: flex !important; align-items: center !important; justify-content: center !important; padding: 0 !important; margin: 5px 6px 2px auto !important; font-size: 0.65rem !important; }

/* ── Shift event pills ── */
.staff-calendar-render .event-morning { background: linear-gradient(135deg, #f59e0b, #fbbf24) !important; color: #854d0e !important; border-left: 3px solid #d97706 !important; font-family: 'DM Mono', monospace !important; font-size: 0.68rem !important; font-weight: 600 !important; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; box-shadow: 0 1px 4px rgba(245,158,11,.25); margin-bottom: 2px; }
.staff-calendar-render .event-evening { background: linear-gradient(135deg, #5b21b6, #8b5cf6) !important; color: #ede9fe !important; border-left: 3px solid #4c1d95 !important; font-family: 'DM Mono', monospace !important; font-size: 0.68rem !important; font-weight: 600 !important; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; box-shadow: 0 1px 4px rgba(139,92,246,.25); margin-bottom: 2px; }

/* ── Colleague event pills ── */
.staff-calendar-render .event-colleague { font-family: 'DM Mono', monospace !important; font-size: 0.68rem !important; font-weight: 600 !important; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; border: 1px dashed #64748b !important; margin-bottom: 2px; opacity: 0.95; }
.staff-calendar-render .event-colleague, .staff-calendar-render .event-colleague * { color: #0f172a !important; }
.staff-calendar-render .event-colleague-morning { background: #fef3c7 !important; border-left: 3px solid #d97706 !important; }
.staff-calendar-render .event-colleague-evening { background: #f3e8ff !important; border-left: 3px solid #7c3aed !important; }

/* ── Pending swap pill state ── */
.staff-calendar-render .shift-has-pending { position: relative; background: #e2e8f0 !important; color: #94a3b8 !important; border-left: 3px solid #cbd5e1 !important; text-decoration: line-through; opacity: 0.6; }

/* ── List & time grid ── */
.staff-calendar-render .fc-list-event-dot { display: none; }
.staff-calendar-render .fc-list-event td { font-family: 'DM Mono', monospace; font-size: 0.78rem; }
.staff-calendar-render .fc-timegrid-event { border-radius: 6px !important; }
.staff-calendar-render .fc-scroller { overflow: hidden !important; }

/* ── Swap mode tick buttons ── */
.fc-custom-event-wrapper { display: flex; align-items: center; justify-content: space-between; width: 100%; overflow: hidden; }
.fc-custom-event-wrapper span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%; }
.fc-event-tick-btn { border-radius: 50% !important; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; cursor: pointer; margin-left: 4px; transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.12); flex-shrink: 0; }
.fc-event-tick-btn.unselected { background: transparent !important; border: 1.5px solid rgba(255,255,255,0.85) !important; color: transparent !important; }
.fc-event-tick-btn.unselected:hover { background: rgba(255,255,255,0.3) !important; transform: scale(1.15); }
.fc-event-tick-btn.selected  { background: #10b981 !important; border: 1.5px solid #10b981 !important; color: #ffffff !important; transform: scale(1.15); }
.fc-event-tick-btn.forbidden { background: #cbd5e1 !important; border: 1.5px solid #94a3b8 !important; color: #64748b !important; cursor: not-allowed !important; opacity: 0.55; box-shadow: none !important; }
.swap-mode-active .staff-calendar-render .event-colleague { opacity: 0.2 !important; pointer-events: none !important; }

/* ── Weekend striped grey lockout ── */
.staff-calendar-render .fc-weekend-blocked {
  background: repeating-linear-gradient(
    -45deg, transparent, transparent 4px,
    rgba(0,0,0,0.04) 4px, rgba(0,0,0,0.04) 8px
  ) !important;
  background-color: #f1f5f9 !important;
  pointer-events: none !important;
}
.staff-calendar-render .fc-weekend-blocked .fc-daygrid-day-number { color: #94a3b8 !important; }

/* ── Public holiday red cell tint ── */
.staff-calendar-render .fc-day-has-holiday {
  background: repeating-linear-gradient(
    -45deg, transparent, transparent 4px,
    rgba(220,38,38,0.04) 4px, rgba(220,38,38,0.04) 8px
  ) !important;
  background-color: #fef2f2 !important;
}
.staff-calendar-render .fc-day-has-holiday .fc-daygrid-day-number { color: #7f1d1d !important; font-weight: 700; }

/* ── Holiday banner event row styles ── */
.staff-calendar-render .holiday-block-event {
  display: block !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  padding: 2px 6px !important;
  pointer-events: none !important;
  user-select: none !important;
  cursor: default !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  width: 100% !important;
}
.staff-calendar-render .holiday-block-event,
.staff-calendar-render .holiday-block-event *,
.staff-calendar-render .holiday-block-event .fc-event-main,
.staff-calendar-render .holiday-block-event .fc-event-title {
  color: #000000 !important;
}
</style>

<style scoped>
.calendar-panel {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  overflow: hidden;
  position: relative;
}
.calendar-header-split {
  display: flex; flex-direction: column; gap: 12px;
  padding: 16px 16px 12px; border-bottom: 1px solid #f8fafc;
}
.card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }
.calendar-body { padding: 12px; position: relative; }

/* ── Stats Bar ── */
.stats-bar {
  display: flex;
  align-items: center;
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
.stat-body { display: flex; flex-direction: column; gap: 1px; }
.stat-val {
  font-family: 'DM Mono', monospace;
  font-size: 1rem; font-weight: 700; color: #0f172a; line-height: 1;
}
.stat-unit {
  font-size: 0.65rem; font-weight: 600; color: #94a3b8; margin-left: 1px;
}
.stat-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.56rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase; color: #94a3b8;
}

.calendar-actions-right { display: flex; align-items: center; gap: 8px; }
.btn-cancel-swap  { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; background: #ef4444; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; }
.btn-confirm-swap { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; background: #10b981; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; }

.animate-pop { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.swap-mode-active { border: 2px solid #6366f1 !important; animation: panel-shake 0.5s both; }
.swap-mode-active .calendar-header-split { background: #f5f3ff; border-bottom: 1px solid #ddd6fe; }
@keyframes panel-shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80%  { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-3px, 0, 0); }
  40%, 60%  { transform: translate3d(3px, 0, 0); }
}

.colleague-selector-wrapper { display: flex; flex-direction: column; gap: 4px; }
.selector-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
.colleague-dropdown { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; color: #334155; outline: none; width: 100%; max-width: 240px; }

.calendar-overlay-loader { position: absolute; top: 12px; right: 12px; background: rgba(15,23,42,0.8); color: #fff; padding: 4px 10px; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 11px; z-index: 5; }

@media (min-width: 600px) {
  .calendar-header-split { flex-direction: row; align-items: center; justify-content: space-between; padding: 18px 20px 14px; }
  .colleague-selector-wrapper { align-items: flex-end; }
  .calendar-body { padding: 16px; }
}
@media (min-width: 900px) {
  .calendar-header-split { padding: 20px 24px 16px; }
  .calendar-body { padding: 24px; }
}
</style>