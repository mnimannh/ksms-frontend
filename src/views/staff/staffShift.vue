<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="page">

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
            <span class="legend-item colleague" v-if="selectedColleagueId">
              <span class="legend-dot"></span> Teammate
            </span>
            <span class="legend-item holiday-legend">
              <span class="legend-dot holiday-dot"></span> Public Holiday
            </span>
          </div>
          <div class="live-dot"><span class="pulse" />Live</div>
        </div>
      </div>

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

      <div v-if="swapRequests.length" class="progress-panel animate-pop">
        <div class="panel-header">
          <h2 class="panel-title">🔄 Swap Request Hub</h2>
          <p class="panel-sub">Review incoming proposals or track your outward requests</p>
        </div>
        
        <div class="progress-list">
          <div v-for="swap in swapRequests" :key="swap.id" class="progress-card">
            <div class="progress-card-main">
              <div class="swap-participants">
                <span v-if="swap.requester_id == myId" class="participant-badge me">Me</span>
                <span v-else class="participant-badge staff">{{ swap.requester_name || getColleagueName(swap.requester_id) }}</span>
                
                <span class="swap-arrow">➔</span>
                
                <span v-if="swap.target_id == myId" class="participant-badge me">Me</span>
                <span v-else class="participant-badge staff">{{ swap.target_name || getColleagueName(swap.target_id) }}</span>
              </div>
              <div class="swap-details">
                <p class="swap-info-text">
                  Swapping 
                  <strong>{{ swap.requester_id == myId ? 'your' : (swap.requester_name || getColleagueName(swap.requester_id)) + "'s" }}</strong> shift on 
                  <strong>{{ formatDate(swap.shift_start) }}</strong> 
                  for 
                  <strong>{{ swap.target_id == myId ? 'your' : (swap.target_name || getColleagueName(swap.target_id)) + "'s" }}</strong> shift on
                  <strong>{{ formatDate(swap.target_shift_start) }}</strong>.
                </p>
              </div>
            </div>

            <div class="progress-card-status">
              <div v-if="swap.target_id == myId && swap.status?.toLowerCase() === 'pending'" class="peer-action-buttons">
                <button class="btn-action-accept" @click="respondToSwapRequest(swap.id, 'accepted')">Accept</button>
                <button class="btn-action-reject" @click="respondToSwapRequest(swap.id, 'rejected')">Reject</button>
              </div>

              <div v-else>
                <span class="status-indicator" :class="getFriendlyStatusClass(swap.status)">
                  <span class="status-dot"></span> {{ getFriendlyStatusLabel(swap.status, swap.requester_id) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="calendar-panel" :class="{ 'swap-mode-active': isSwapMode }">
        <div class="card-header calendar-header-split">
          <div>
            <p class="card-title">
              {{ isSwapMode ? '⚡ Select Your Shift to Swap' : 'Shift Calendar' }}
            </p>
            <p class="card-sub">
              {{ isSwapMode ? 'Pick an eligible unticked shift directly on your schedule grid' : 'Select a teammate\'s shift on the calendar to issue a swap request directly' }}
            </p>
          </div>
          
          <div class="calendar-actions-right">
            <button v-if="isSwapMode && selectedMyShiftId" class="btn-confirm-swap animate-pop" @click="executeSwapSubmission">
              Send Swap Request ✓
            </button>
            <button v-if="isSwapMode" class="btn-cancel-swap" @click="cancelSwapMode">
              Cancel Selection
            </button>

            <div v-else class="colleague-selector-wrapper">
              <label for="colleague-select" class="selector-label">Compare Schedule With:</label>
              <select 
                id="colleague-select" 
                v-model="selectedColleagueId" 
                @change="onColleagueChange"
                class="colleague-dropdown"
              >
                <option :value="null">None (Only My Shifts)</option>
                <option v-for="user in staffList" :key="user.id" :value="user.id">
                  {{ user.fullName }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="calendar-body">
          <div v-if="loadingColleague" class="calendar-overlay-loader">Updating view...</div>
          <div id="calendar"></div>
        </div>
      </div>

      <transition name="modal-fade">
        <div v-if="selectedShift" class="modal-overlay" @click.self="selectedShift = null">
          <div class="modal-card">
            <div class="modal-header" :class="selectedShift.isColleagueEvent ? 'colleague-header' : selectedShift.shiftType.toLowerCase()">
              <div class="modal-shift-type">
                <span>{{ selectedShift.isColleagueEvent ? `${selectedShift.ownerName}'s` : 'My' }} {{ selectedShift.shiftType }} Shift</span>
              </div>
              <button class="modal-close" @click="selectedShift = null">✕</button>
            </div>
            <div class="modal-body">
              <div class="modal-row" v-if="selectedShift.isColleagueEvent">
                <span class="modal-field">Staff Member</span>
                <span class="modal-value">{{ selectedShift.ownerName }}</span>
              </div>
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
              <div class="modal-row" v-if="!selectedShift.isColleagueEvent">
                <span class="modal-field">Assigned By</span>
                <span class="modal-value">{{ selectedShift.assignedByName }}</span>
              </div>
              <div class="modal-row" v-if="!selectedShift.isColleagueEvent">
                <span class="modal-field">Status</span>
                <span class="modal-value">{{ selectedShift.status || 'Pending' }}</span>
              </div>
            </div>

            <div class="modal-footer-actions" v-if="selectedShift.isColleagueEvent && !isSwapMode">
              <div v-if="isShiftPendingSwap(selectedShift.id)" class="swap-pending-alert">
                <span class="alert-icon">⏳</span> Swap request for this shift is already in progress
              </div>
              <button v-else class="btn-swap" @click="initiateSwapMode(selectedShift)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
                Request Swap with Teammate
              </button>
            </div>
          </div>
        </div>
      </transition>

    </main>
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
      myId: null, 
      selectedShift: null,
      staffList:     [],
      calendar:      null,
      shifts:        [],
      colleagueShifts: [],
      swapRequests:  [], 
      publicHolidays: [], 
      selectedColleagueId: null,
      loading:        false,
      loadingColleague: false,
      
      isSwapMode: false,
      targetSwapShift: null,
      selectedMyShiftId: null 
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
      const myEvents = this.shifts.map(shift => {
        const hasPending = this.isShiftPendingSwap(shift.id);
        return {
          id: `my-${shift.id}`,
          title: `Me: ${shift.shiftType}${hasPending ? ' ⏳' : ''}`,
          start: shift.startTime,
          end: shift.endTime,
          classNames: [`event-${shift.shiftType.toLowerCase()}`, hasPending ? 'shift-has-pending' : ''],
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
            title: `${name}: ${shift.shiftType}${hasPending ? ' ⏳' : ''}`,
            start: shift.startTime,
            end: shift.endTime,
            classNames: ['event-colleague', `event-colleague-${shift.shiftType.toLowerCase()}`, hasPending ? 'shift-has-pending' : ''],
            extendedProps: { ...shift, isColleagueEvent: true, ownerName: name },
          };
        });
      }

      const holidayEvents = this.publicHolidays.map(ph => ({
        id: `ph-${ph.id || ph.date}`,
        title: ph.name,
        start: ph.date,
        display: 'block',
        classNames: ['holiday-block-event'],
        extendedProps: { publicHoliday: true }
      }));

      return [...myEvents, ...colleagueEvents, ...holidayEvents];
    }
  },

  mounted() {
    this.fetchShifts();
  },

  beforeUnmount() {
    if (this.calendar) this.calendar.destroy();
  },

  methods: {
    initiateSwapMode(colleagueShift) {
      this.targetSwapShift = colleagueShift;
      this.isSwapMode = true;
      this.selectedShift = null; 
      this.selectedMyShiftId = null; 
      this.refreshCalendarSource(); 
    },

    cancelSwapMode() {
      this.isSwapMode = false;
      this.targetSwapShift = null;
      this.selectedMyShiftId = null;
      this.refreshCalendarSource();
    },

    isShiftForbidden(myShift) {
      if (!this.targetSwapShift) return false;
      const myShiftDate = new Date(myShift.startTime).toDateString();
      const targetDate = new Date(this.targetSwapShift.startTime).toDateString();
      return myShiftDate === targetDate || this.isShiftPendingSwap(myShift.id);
    },

    isShiftPendingSwap(shiftId) {
      return this.swapRequests.some(req => 
        (req.shift_id == shiftId || req.target_shift_id == shiftId) && 
        (['pending', 'accepted'].includes(req.status?.toLowerCase()))
      );
    },

    getColleagueName(id) {
      const staff = this.staffList.find(u => u.id == id);
      return staff ? staff.fullName : 'Teammate';
    },

    getFriendlyStatusClass(status) {
      const s = status?.toLowerCase();
      if (s === 'pending') return 'pending';
      if (s === 'accepted') return 'accepted';
      if (s === 'approved') return 'approved';
      return 'rejected';
    },

    getFriendlyStatusLabel(status, requesterId) {
      const s = status?.toLowerCase();
      if (s === 'pending') {
        return requesterId == this.myId ? 'Waiting for Peer' : 'Action Required';
      }
      if (s === 'accepted') return 'Waiting Admin Approval';
      if (s === 'approved') return 'Approved & Changed';
      return 'Rejected';
    },

    handleSelectShift(myShiftProps) {
      if (this.isShiftForbidden(myShiftProps)) return;
      this.selectedMyShiftId = this.selectedMyShiftId === myShiftProps.id ? null : myShiftProps.id;
      this.refreshCalendarSource();
    },

    async respondToSwapRequest(swapId, newStatus) {
      const actionText = newStatus === 'accepted' ? 'accept' : 'reject';
      if (!confirm(`Are you sure you want to ${actionText} this shift swap proposal?`)) return;

      try {
        this.loading = true;
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        
        await axios.patch(`${API_BASE_URL}/api/swaps/${swapId}/respond`, {
          status: newStatus
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert(`You successfully ${newStatus} the trade request!`);
        await this.fetchShifts();
      } catch (err) {
        console.error("Failed to post response update:", err);
        alert(err.response?.data?.message || "Error processing swap choice.");
      } finally {
        this.loading = false;
      }
    },

    async executeSwapSubmission() {
      if (!this.selectedMyShiftId || !this.targetSwapShift) return;
      
      const chosenShift = this.shifts.find(s => s.id === this.selectedMyShiftId);
      if (!chosenShift) return;

      if (!confirm(`Confirm swap proposal: Exchange your "${chosenShift.shiftType}" shift for ${this.targetSwapShift.ownerName}'s shift?`)) return;

      try {
        this.loading = true;
        const token = localStorage.getItem("token") || localStorage.getItem("userToken");
        
        await axios.post(`${API_BASE_URL}/api/swaps`, {
          targetId: this.selectedColleagueId,     
          shiftId: this.selectedMyShiftId,         
          targetShiftId: this.targetSwapShift.id   
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert("Swap request successfully submitted!");
        this.isSwapMode = false;
        this.targetSwapShift = null;
        this.selectedMyShiftId = null;
        await this.fetchShifts();
      } catch (err) {
        console.error("Failed to complete swap submission workflow:", err);
        alert(err.response?.data?.message || "Error submitting request.");
      } finally {
        this.loading = false;
      }
    },

    async fetchSwapRequests() {
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(`${API_BASE_URL}/api/swaps`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const rawSwaps = Array.isArray(data) ? data : [];
        if (this.myId) {
          this.swapRequests = rawSwaps.filter(req => req.requester_id == this.myId || req.target_id == this.myId);
        } else {
          this.swapRequests = rawSwaps;
        }
      } catch (err) {
        console.error("Could not fetch progress metrics for active swaps:", err);
      }
    },

    async fetchShifts() {
      this.loading = true;
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        if (!token) return;

        const payload = JSON.parse(atob(token.split('.')[1]));
        this.myId = payload.id;

        await this.fetchSwapRequests();

        // Fetch Public Holidays array data source stream from your API endpoint
       // Public Holidays (FIXED - no auth header needed)
try {
  const year = new Date().getFullYear();

  // 1. Fire requests in parallel using native fetch
  // (Assuming you only need to fetch the holidays here, or you can add your other APIs to this array)
  const [holidayRes] = await Promise.all([
    fetch(`https://sabah-holiday.dydxsoft.my/api/selangor/${year}.json`)
  ]);

  // 2. Safely isolate the holiday data parsing behind an .ok check
  if (holidayRes.ok) {
    const raw = await holidayRes.json();
    this.publicHolidays = Array.isArray(raw) ? raw : (raw.holidays ?? raw.data ?? []);
  } else {
    this.publicHolidays = [];
  }

} catch (err) {

  console.warn("Holiday API failed gracefully (likely CORS or Network error):", err);
  this.publicHolidays = [];
}
        const { data: shiftsData } = await axios.get(`${API_BASE_URL}/api/shifts/staff/me`, {
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

        try {
          const { data: users } = await axios.get(`${API_BASE_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.staffList = users.filter(u => u.role === 'staff' && u.status === 'active' && u.id !== this.myId);
        } catch { /* Fail-safes fallback */ }

        this.refreshCalendarSource();
      } catch (err) {
        console.error("Error fetching shifts:", err);
      } finally {
        this.loading = false;
      }
    },

    async onColleagueChange() {
      if (!this.selectedColleagueId) {
        this.colleagueShifts = [];
        this.refreshCalendarSource();
        return;
      }

      this.loadingColleague = true;
      try {
        const token = localStorage.getItem("userToken") || localStorage.getItem("token");
        const { data: colleagueData } = await axios.get(`${API_BASE_URL}/api/shifts/staff/${this.selectedColleagueId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.colleagueShifts = colleagueData;
      } catch (err) {
        console.error("Could not fetch teammate schedules:", err);
        this.colleagueShifts = [];
      } finally {
        this.loadingColleague = false;
        this.refreshCalendarSource();
      }
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
        
        dayCellClassNames(arg) {
          const classes = [];
          const dayOfWeek = arg.date.getDay();

          // 1. Mark and evaluate weekends (Sat = 6, Sun = 0)
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            classes.push('fc-weekend-blocked');
          }

          // 2. Cross-compare to mark Public Holidays in the cell backgrounds
          const cellDateStr = arg.date.toISOString().slice(0, 10);
          const hasHolidayObj = self.publicHolidays.some(h => h.date === cellDateStr);
          if (hasHolidayObj) {
            classes.push('fc-day-has-holiday');
          }

          return classes;
        },

        eventClick(info) {
          // Safeguard Interceptor: Lock clicking action workflows on holiday layout rows
          if (
            info.event.extendedProps?.publicHoliday || 
            info.event.classNames?.includes('holiday-block-event')
          ) {
            info.jsEvent.preventDefault();
            return false;
          }

          if (self.isSwapMode) return; 
          self.selectedShift = { ...info.event.extendedProps };
        },

        eventContent(arg) {
          const props = arg.event.extendedProps;
          const mainContainer = document.createElement('div');
          mainContainer.className = 'fc-custom-event-wrapper';
          
          const titleSpan = document.createElement('span');
          titleSpan.innerText = arg.event.title;
          mainContainer.appendChild(titleSpan);

          if (self.isSwapMode && !props.isColleagueEvent && !props.publicHoliday) {
            const actionButton = document.createElement('button');
            const isForbidden = self.isShiftForbidden(props);
            const isSelected = self.selectedMyShiftId === props.id;

            if (isForbidden) {
              actionButton.className = 'fc-event-tick-btn forbidden';
              actionButton.innerHTML = '✕'; 
              actionButton.disabled = true;
            } else if (isSelected) {
              actionButton.className = 'fc-event-tick-btn selected';
              actionButton.innerHTML = '✓';
            } else {
              actionButton.className = 'fc-event-tick-btn unselected';
              actionButton.innerHTML = ''; 
            }
            
            actionButton.addEventListener('click', (e) => {
              e.stopPropagation(); 
              if (!isForbidden) self.handleSelectShift(props);
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

    formatDate(dt) {
      return new Date(dt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
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
/* ── FullCalendar Core Engine Custom Element Overrides ── */
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

.fc .event-morning { background: linear-gradient(135deg, #f59e0b, #fbbf24) !important; color: #854d0e !important; border-left: 3px solid #d97706 !important; font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 600; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; box-shadow: 0 1px 4px rgba(245,158,11,.25); margin-bottom: 2px; }
.fc .event-evening { background: linear-gradient(135deg, #5b21b6, #8b5cf6) !important; color: #ede9fe !important; border-left: 3px solid #4c1d95 !important; font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 600; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; box-shadow: 0 1px 4px rgba(139,92,246,.25); margin-bottom: 2px; }

.fc .event-colleague { font-family: 'DM Mono', monospace; font-size: 0.72rem; font-weight: 600; border-radius: 5px !important; padding: 2px 6px !important; cursor: pointer; border: 1px dashed #64748b !important; margin-bottom: 2px; opacity: 0.95; }
.fc .event-colleague, .fc .event-colleague * { color: #0f172a !important; }
.fc .event-colleague-morning { background: #fef3c7 !important; border-left: 3px solid #d97706 !important; }
.fc .event-colleague-evening { background: #f3e8ff !important; border-left: 3px solid #7c3aed !important; }

.fc .shift-has-pending { position: relative; background: #e2e8f0 !important; color: #94a3b8 !important; border-left: 3px solid #cbd5e1 !important; text-decoration: line-through; opacity: 0.6; }
.fc .fc-list-event-dot { display: none; }
.fc .fc-list-event td { font-family: 'DM Mono', monospace; font-size: 0.78rem; }
.fc .fc-timegrid-event { border-radius: 6px !important; }
.fc .fc-scroller { overflow: hidden !important; }

.fc-custom-event-wrapper { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.fc-event-tick-btn { border-radius: 50% !important; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 900; cursor: pointer; margin-left: 4px; transition: all 0.15s ease; box-shadow: 0 1px 3px rgba(0,0,0,0.12); flex-shrink: 0; }
.fc-event-tick-btn.unselected { background: transparent !important; border: 1.5px solid rgba(255, 255, 255, 0.85) !important; color: transparent !important; }
.fc-event-tick-btn.unselected:hover { background: rgba(255, 255, 255, 0.3) !important; transform: scale(1.15); }
.fc-event-tick-btn.selected { background: #10b981 !important; border: 1.5px solid #10b981 !important; color: #ffffff !important; transform: scale(1.15); }
.fc-event-tick-btn.forbidden { background: #cbd5e1 !important; border: 1.5px solid #94a3b8 !important; color: #64748b !important; cursor: not-allowed !important; opacity: 0.55; box-shadow: none !important; }

.swap-mode-active .fc .event-colleague { opacity: 0.2 !important; pointer-events: none !important; }

/* ── Weekend Striped Grey Lockout Engine Styles ── */
.fc .fc-weekend-blocked {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(0, 0, 0, 0.04) 4px,
    rgba(0, 0, 0, 0.04) 8px
  ) !important;
  background-color: #f1f5f9 !important;
  pointer-events: none !important;
}
.fc .fc-weekend-blocked .fc-daygrid-day-number {
  color: #94a3b8 !important;
}

/* ── Public Holiday Striped Crimson Red Overrides ── */
.fc .fc-day-has-holiday {
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 4px,
    rgba(220, 38, 38, 0.04) 4px,
    rgba(220, 38, 38, 0.04) 8px
  ) !important;
  background-color: #fef2f2 !important;
}
.fc .fc-day-has-holiday .fc-daygrid-day-number {
  color: #dc2626 !important;
  font-weight: 700;
}

/* ── Banner Event Overrides for PH rows ── */
.fc .holiday-block-event {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.75rem !important;
  font-weight: 700 !important;
  color: #dc2626 !important;
  padding: 3px 6px !important;
  pointer-events: none !important;
  user-select: none !important;
}
</style>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Mono:wght@400;500;600&family=DM+Sans:opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.app-layout { display: flex; min-height: 100vh; background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b; }
.page { flex: 1; padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 16px; overflow-x: hidden; }

.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

.legend { display: flex; gap: 12px; align-items: center; }
.legend-item { font-family: 'DM Mono', monospace; font-size: 0.7rem; display: flex; align-items: center; gap: 6px; color: #64748b; letter-spacing: 0.03em; }
.legend-dot { width: 10px; height: 10px; border-radius: 3px; display: inline-block; }
.legend-item.morning .legend-dot { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.legend-item.evening .legend-dot { background: linear-gradient(135deg, #5b21b6, #8b5cf6); }
.legend-item.colleague .legend-dot { background: #f3e8ff; border: 1px dashed #64748b; }
.legend-dot.holiday-dot { background-color: #fef2f2; border: 1px solid #dc2626; }
.legend-item.holiday-legend { color: #dc2626; font-weight: 500; }

.live-dot { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #10b981; font-weight: 500; }
.pulse { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: block; animation: pulse 1.8s ease infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); } 50% { box-shadow: 0 0 0 6px rgba(16,185,129,0); } }

.summary-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.summary-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; padding: 14px 16px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.04); animation: fadeUp .35s ease both; transition: all .15s; }
.summary-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); transform: translateY(-1px); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.summary-icon { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
.summary-val { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; margin-bottom: 3px; }
.summary-unit { font-size: 14px; font-weight: 500; color: #94a3b8; margin-left: 2px; }
.summary-label { font-size: 11px; color: #94a3b8; }

/* ── HUB PANEL & ACTION BUTTONS ── */
.progress-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 4px rgba(0, 0, 0, 0.02); }
.panel-header { display: flex; flex-direction: column; }
.panel-title { font-size: 14px; font-weight: 600; color: #0f172a; }
.panel-sub { font-size: 12px; color: #94a3b8; }
.progress-list { display: flex; flex-direction: column; gap: 8px; max-height: 240px; overflow-y: auto; }
.progress-card { display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px; padding: 12px 14px; gap: 12px; }
.progress-card-main { display: flex; align-items: center; gap: 14px; flex: 1; }
.swap-participants { display: flex; align-items: center; gap: 6px; }
.participant-badge { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
.participant-badge.me { background: #eef2ff; color: #6366f1; }
.participant-badge.staff { background: #f1f5f9; color: #475569; }
.swap-arrow { font-size: 11px; color: #94a3b8; }
.swap-info-text { font-size: 12px; color: #334155; line-height: 1.4; }

.peer-action-buttons { display: flex; gap: 6px; }
.btn-action-accept { background: #10b981; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-action-accept:hover { background: #059669; }
.btn-action-reject { background: #ef4444; color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
.btn-action-reject:hover { background: #dc2626; }

.status-indicator { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; }
.status-indicator.pending { background: #fff7ed; color: #c2410c; }
.status-indicator.pending .status-dot { background: #c2410c; }
.status-indicator.accepted { background: #f0fdf4; color: #16a34a; }
.status-indicator.accepted .status-dot { background: #16a34a; }
.status-indicator.approved { background: #eff6ff; color: #2563eb; }
.status-indicator.approved .status-dot { background: #2563eb; }
.status-indicator.rejected { background: #fef2f2; color: #dc2626; }
.status-indicator.rejected .status-dot { background: #dc2626; }
.status-dot { width: 6px; height: 6px; border-radius: 50%; }

.calendar-panel { background: #fff; border: 1px solid #f1f5f9; border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04); overflow: hidden; position: relative; }
.calendar-header-split { display: flex; flex-direction: column; gap: 12px; padding: 16px 16px 12px; border-bottom: 1px solid #f8fafc; }
.card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }
.calendar-body { padding: 12px; position: relative; }

.calendar-actions-right { display: flex; align-items: center; gap: 8px; }
.btn-cancel-swap { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; background: #ef4444; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; }
.btn-confirm-swap { font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; background: #10b981; color: #ffffff; border: none; padding: 8px 14px; border-radius: 8px; cursor: pointer; }

.animate-pop { animation: popIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

.swap-mode-active { border: 2px solid #6366f1 !important; animation: panel-shake 0.5s both; }
.swap-mode-active .calendar-header-split { background: #f5f3ff; border-bottom: 1px solid #ddd6fe; }
@keyframes panel-shake { 10%, 90% { transform: translate3d(-1px, 0, 0); } 20%, 80% { transform: translate3d(2px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-3px, 0, 0); } 40%, 60% { transform: translate3d(3px, 0, 0); } }

.colleague-selector-wrapper { display: flex; flex-direction: column; gap: 4px; }
.selector-label { font-family: 'DM Mono', monospace; font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.05em; }
.colleague-dropdown { font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; background-color: #f8fafc; color: #334155; outline: none; width: 100%; max-width: 240px; }

.calendar-overlay-loader { position: absolute; top: 12px; right: 12px; background: rgba(15, 23, 42, 0.8); color: #fff; padding: 4px 10px; border-radius: 4px; font-family: 'DM Mono', monospace; font-size: 11px; z-index: 5; }

.modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.45); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; z-index: 1000; }
.modal-card { background: #fff; border-radius: 16px 16px 0 0; width: 100%; overflow: hidden; box-shadow: 0 -8px 40px rgba(0,0,0,.2); }
.modal-header { padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; }
.modal-header.morning { background: linear-gradient(135deg, #f59e0b, #fbbf24); color: #854d0e; }
.modal-header.evening { background: linear-gradient(135deg, #5b21b6, #8b5cf6); color: #ede9fe; }
.modal-header.colleague-header { background: linear-gradient(135deg, #475569, #64748b); color: #f8fafc; }
.modal-body { padding: 16px 20px 28px; display: flex; flex-direction: column; }
.modal-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.modal-row:last-child { border-bottom: none; }
.modal-field { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; }
.modal-value { font-family: 'DM Sans', sans-serif; font-size: 0.875rem; color: #0f172a; font-weight: 500; }
.modal-footer-actions { padding: 12px 20px 16px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }

.swap-pending-alert { font-size: 13px; font-weight: 500; color: #d97706; background-color: #fffbeb; border: 1px solid #fde68a; padding: 8px 14px; border-radius: 8px; width: 100%; text-align: center; }
.btn-swap { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #f8fafc; color: #475569; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
.btn-swap:hover { background: #6366f1; border-color: #6366f1; color: #fff; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from,  .modal-fade-leave-to      { opacity: 0; }
.modal-fade-enter-active .modal-card, .modal-fade-leave-active .modal-card { transition: transform .25s ease; }
.modal-fade-enter-from   .modal-card, .modal-fade-leave-to    .modal-card  { transform: translateY(100%); }

@media (min-width: 600px) {
  .page { padding: 24px 24px 44px; gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  .topbar-title { font-size: 24px; }
  .summary-row { gap: 12px; }
  .summary-card { padding: 16px 18px; }
  .summary-icon { width: 42px; height: 42px; border-radius: 11px; }
  .summary-val { font-size: 24px; }
  .calendar-header-split { flex-direction: row; align-items: center; justify-content: space-between; padding: 18px 20px 14px; }
  .colleague-selector-wrapper { align-items: flex-end; }
  .calendar-body { padding: 16px; }
  .modal-overlay { align-items: center; padding: 20px; }
  .modal-card { border-radius: 16px; width: 100%; max-width: 440px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
  .modal-fade-enter-from .modal-card, .modal-fade-leave-to .modal-card { transform: scale(.95) translateY(8px); }
}
@media (min-width: 900px) {
  .page { padding: 32px 36px 48px; gap: 20px; }
  .topbar-title { font-size: 26px; }
  .summary-row { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .summary-card { padding: 18px 20px; gap: 14px; }
  .summary-val { font-size: 26px; }
  .summary-unit { font-size: 16px; }
  .calendar-header-split { padding: 20px 24px 16px; }
  .calendar-body { padding: 24px; }
}
</style>