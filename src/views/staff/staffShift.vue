<template>
  <div class="staff-layout">
    <main class="page-container">
      <div class="page-content">
        
        <div class="top-header">
          <div class="header-text">
            <span class="eyebrow">{{ todayLabel }}</span>
            <h1 class="main-title">Shift <span class="accent">Calendar</span></h1>
            <p class="subtitle">Select a teammate's shift on the calendar to issue a swap request directly</p>
          </div>
          
          <div class="header-actions">
            <div class="compare-wrapper">
              <label class="compare-label">COMPARE SCHEDULE WITH:</label>
              <select v-model="compareWithUser" @change="onCompareChange" class="compare-select">
                <option :value="null">None (Only My Shifts)</option>
                <option v-for="staff in otherStaffList" :key="staff.id" :value="staff.id">
                  {{ staff.fullName }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="calendar-panel">
          <div class="panel-head">
            <div class="panel-title-wrapper">
              <span class="panel-title">SCHEDULE OVERVIEW</span>
            </div>
            
            <div class="head-right">
              <div class="view-toggle">
                <button :class="{ active: currentView === 'dayGridMonth' }" @click="changeView('dayGridMonth')">MONTH</button>
                <button :class="{ active: currentView === 'timeGridWeek' }" @click="changeView('timeGridWeek')">WEEK</button>
                <button :class="{ active: currentView === 'listMonth' }" @click="changeView('listMonth')">LIST</button>
              </div>
            </div>
          </div>

          <div id="staff-calendar">
            <div ref="calendarEl"></div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import API_BASE_URL from '@/services/api.js';

function authFetch(url, options = {}) {
  const token = localStorage.getItem('userToken') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
  return fetch(url, { ...options, headers });
}

export default {
  name: 'StaffShift',
  data() {
    return {
      shifts: [],
      staffList: [],
      holidays: [],
      currentUserId: null, // Populated via identity parsing token routines
      compareWithUser: null,
      currentView: 'dayGridMonth',
      loading: false,
    };
  },

  computed: {
    todayLabel() {
      return new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    },
    
    otherStaffList() {
      return this.staffList.filter(u => u.id !== this.currentUserId);
    },

    calendarEvents() {
      // 1. Shift Mapping logic
      // Filter out only current user shifts OR include compared peer tracking targets
      const baseFilteredShifts = this.shifts.filter(s => {
        if (s.status === 'draft') return false; // Staff never see tentative drafts
        if (!this.compareWithUser) {
          return s.userID === this.currentUserId;
        }
        return s.userID === this.currentUserId || s.userID === this.compareWithUser;
      });

      const shiftEvents = baseFilteredShifts.map(row => {
        const isMe = row.userID === this.currentUserId;
        return {
          id: row.id,
          title: isMe ? `My Shift (${row.shiftType})` : `${row.staffName || 'Teammate'} (${row.shiftType})`,
          start: row.startTime,
          end: row.endTime,
          backgroundColor: isMe ? '#6366f1' : '#94a3b8',
          borderColor: isMe ? '#4f46e5' : '#cbd5e1',
          classNames: [isMe ? 'my-personal-shift' : 'peer-compared-shift'],
          extendedProps: {
            ...row,
            publicHoliday: false
          }
        };
      });

      // 2. Holiday Data Event Map Array Construction 
      const holidayYear = new Date().getFullYear();
      const monthMap = {
        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
      };

      const holidayEvents = this.holidays.map((holiday, index) => {
        const [monthText, day] = holiday.date.split(' ');
        const iso = `${holidayYear}-${monthMap[monthText]}-${day.padStart(2, '0')}`;

        return {
          id: `holiday-${index}`,
          title: `🎉 ${holiday.holiday_name}`,
          start: iso,
          allDay: true,
          display: 'background',
          backgroundColor: 'rgba(254, 226, 226, 0.6)',
          classNames: ['holiday-block-event'],
          extendedProps: {
            publicHoliday: true,
            holidayName: holiday.holiday_name,
          },
        };
      });

      return [...shiftEvents, ...holidayEvents];
    }
  },

  async created() {
    this.parseUserIdentity();
    await this.fetchStaffData();
  },

  methods: {
    parseUserIdentity() {
      try {
        const token = localStorage.getItem('userToken') || localStorage.getItem('token');
        if (token) {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const payload = JSON.parse(window.atob(base64));
          this.currentUserId = payload.id || payload.sub;
        }
      } catch (e) {
        console.error("Failed executing structural authentication token parse sequence", e);
      }
    },

    async fetchStaffData() {
      this.loading = true;
      try {
        const year = new Date().getFullYear();
        const [shiftsRes, usersRes, holidayRes] = await Promise.all([
          authFetch(`${API_BASE_URL}/api/shifts`),
          authFetch(`${API_BASE_URL}/api/users`),
          fetch(`https://sabah-holiday.dydxsoft.my/api/selangor/${year}.json`)
        ]);

        if (shiftsRes.ok) this.shifts = await shiftsRes.json();
        if (usersRes.ok) this.staffList = await usersRes.json();
        
        if (holidayRes.ok) {
          const raw = await holidayRes.json();
          this.holidays = Array.isArray(raw) ? raw : (raw.holidays ?? raw.data ?? []);
        }

        // Trigger local calendar dynamic state payload refresh hook here if using standard fullcalendar handles
        this.updateCalendarInstanceEvents();

      } catch (err) {
        console.error("Data pipeline load exception initialized:", err);
      } finally {
        this.loading = false;
      }
    },

    updateCalendarInstanceEvents() {
      // Logic block mapping to pass this.calendarEvents arrays down cleanly to your real rendered view container instance
    },

    changeView(viewName) {
      this.currentView = viewName;
      // calendarInstance.changeView(viewName) execution map hooks here hook tied
    },

    onCompareChange() {
      // Redraws tracking dependencies array mappings implicitly via computed dependency evaluation loops
    },
    
    onEventClick(info) {
      if (info.event.extendedProps?.publicHoliday) return;
      this.$emit('swap-request-trigger', info.event.extendedProps);
    }
  }
};
</script>

<style scoped>
*, *::before, *::after { box-sizing: border-box; }

/* Layout Architecture Systematics */
.staff-layout { display: flex; width: 100%; height: 100vh; overflow: hidden; font-family: 'DM Sans', sans-serif; background: #f6f7fb; }
.page-container { flex: 1; min-width: 0; overflow-y: auto; background: #f6f7fb; }
.page-content { padding: 28px 32px 48px; max-width: 100%; margin: 0 auto; }

.top-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 22px; flex-wrap: wrap; gap: 16px; }
.eyebrow { font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 0.2em; color: #94a3b8; display: block; margin-bottom: 4px; }
.main-title { font-family: 'DM Sans', sans-serif; font-size: 1.85rem; font-weight: 700; color: #0f172a; margin: 0; letter-spacing: -0.035em; line-height: 1; }
.accent { color: #6366f1; }
.subtitle { font-size: 0.85rem; color: #64748b; margin-top: 6px; margin-bottom: 0; }

/* Compare Dropdown Header element mapping */
.compare-wrapper { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
.compare-label { font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 700; letter-spacing: 0.08em; color: #94a3b8; }
.compare-select { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 500; padding: 6px 12px; border-radius: 8px; cursor: pointer; outline: none; min-width: 210px; }
.compare-select:focus { border-color: #6366f1; }

/* Calendar Main Panel Card Structuring */
.calendar-panel { background: #fff; border: 1px solid #f1f5f9; border-radius: 12px; overflow: visible; display: flex; flex-direction: column; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.panel-head { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #f1f5f9; gap: 10px; }
.panel-title { font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 0.15em; color: #94a3b8; font-weight: 600; }
.head-right { display: flex; align-items: center; gap: 8px; }

/* Tab buttons for View Options controls */
.view-toggle { display: flex; gap: 3px; background: #f1f5f9; padding: 2px; border-radius: 6px; }
.view-toggle button { font-family: 'DM Mono', monospace; font-size: 0.6rem; font-weight: 600; letter-spacing: 0.05em; border: none; background: transparent; color: #64748b; padding: 4px 10px; border-radius: 4px; cursor: pointer; transition: all 0.12s; text-transform: uppercase; }
.view-toggle button.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

#staff-calendar { padding: 16px; flex: 1; }

/* ── Deep UI/UX Overrides breaking truncation limits and injecting visible PH layers ── */
:deep(.holiday-block-event) {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #dc2626 !important;
  padding: 6px 8px;
  pointer-events: none;
  user-select: none;
}

/* Force layout canvas cells to auto-grow naturally based on row contents */
:deep(.fc) {
  height: auto !important;
}

:deep(.fc-daygrid-day-frame) {
  min-height: 125px !important; /* Prevents shifts collapsing behind annoying "+X more" text strings */
}

:deep(.fc-daygrid-event-harness) {
  margin-bottom: 4px !important;
}
</style>