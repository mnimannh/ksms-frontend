<template>
  <div class="app-layout">
    <StaffSidebar />

    <main class="dashboard">

      <!-- ── TOP BAR ─────────────────────────────────────────── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ todayFull }}</p>
          <h1 class="topbar-title">
            Good {{ greetingWord }}, <span class="accent">{{ staff.fullName.split(' ')[0] }}</span>
          </h1>
        </div>
        <div class="topbar-right">
          <div class="clock-chip">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            <span class="clock-time">{{ currentTime }}</span>
          </div>
          <div class="live-dot" v-if="todayShift && todayShift.checkIn && !todayShift.checkOut">
            <span class="pulse" />On Shift
          </div>
        </div>
      </div>

      <!-- ── STAT CARDS ─────────────────────────────────────── -->
      <div class="kpi-grid">

        <div class="kpi-card" style="animation-delay:0ms">
          <div class="kpi-top">
            <div class="kpi-icon" style="background:#eff6ff; color:#3b82f6;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <span class="kpi-trend" :class="todayShift ? 'up' : 'down'">
              {{ todayShift ? '● Scheduled' : '○ Rest Day' }}
            </span>
          </div>
          <p class="kpi-val">{{ todayShift ? todayShift.shiftType : '—' }}</p>
          <p class="kpi-label">Today's Shift</p>
          <div class="kpi-bar"><div class="kpi-fill" style="width:100%; background:#3b82f6" /></div>
        </div>

        <div class="kpi-card" style="animation-delay:60ms">
          <div class="kpi-top">
            <div class="kpi-icon" style="background:#f0fdf4; color:#22c55e;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span class="kpi-trend up">↑ This month</span>
          </div>
          <p class="kpi-val">{{ payroll.shiftsCompleted }}<span class="kpi-unit">/{{ payroll.totalShifts }}</span></p>
          <p class="kpi-label">Shifts Completed</p>
          <div class="kpi-bar">
            <div class="kpi-fill" :style="`width:${(payroll.shiftsCompleted/payroll.totalShifts)*100}%; background:#22c55e`" />
          </div>
        </div>

        <div class="kpi-card" style="animation-delay:120ms">
          <div class="kpi-top">
            <div class="kpi-icon" style="background:#fffbeb; color:#f59e0b;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span class="kpi-trend up">↑ Logged</span>
          </div>
          <p class="kpi-val">{{ payroll.hoursWorked }}<span class="kpi-unit">h</span></p>
          <p class="kpi-label">Hours This Month</p>
          <div class="kpi-bar">
            <div class="kpi-fill" :style="`width:${Math.min((payroll.hoursWorked/200)*100,100)}%; background:#f59e0b`" />
          </div>
        </div>

        <div class="kpi-card" style="animation-delay:180ms">
          <div class="kpi-top">
            <div class="kpi-icon" style="background:#f5f3ff; color:#8b5cf6;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <span class="kpi-trend" :class="payroll.isReceived ? 'up' : payroll.isCreated ? 'up' : 'down'">
              {{ payroll.isReceived ? '✓ Received' : payroll.isCreated ? '● Generated' : '○ Pending' }}
            </span>
          </div>
          <p class="kpi-val">{{ attendanceRate }}<span class="kpi-unit">%</span></p>
          <p class="kpi-label">Attendance Rate</p>
          <div class="kpi-bar">
            <div class="kpi-fill" :style="`width:${attendanceRate}%; background:#8b5cf6`" />
          </div>
        </div>

      </div>

      <!-- ── TWO-COL: TODAY'S SHIFT + PAYROLL ───────────────── -->
      <div class="mid-row two-col">

        <!-- Today's Shift -->
        <div class="panel">
          <div class="card-header">
            <div>
              <p class="card-title">Today's Shift</p>
              <p class="card-sub">{{ todayDate }}</p>
            </div>
            <span class="badge"
              :class="!todayShift ? 'grey' :
                todayShift.attendanceStatus === 'Completed' ? 'green' :
                todayShift.attendanceStatus === 'Late'      ? 'amber' :
                todayShift.attendanceStatus === 'Missed'    ? 'red'   : 'grey'"
            >
              {{ todayShift ? todayShift.attendanceStatus : 'No Shift' }}
            </span>
          </div>

          <div v-if="todayShift">
            <div class="shift-meta-row">
              <span class="shift-type-tag" :class="todayShift.shiftType.toLowerCase()">
                {{ todayShift.shiftType }} Shift
              </span>
              <div class="shift-time-range">
                <span class="mono">{{ todayShift.startTime }}</span>
                <span class="time-sep">→</span>
                <span class="mono">{{ todayShift.endTime }}</span>
              </div>
            </div>

            <div class="checkin-grid">
              <div class="ci-cell">
                <p class="ci-label">Check In</p>
                <p class="ci-val" :class="todayShift.checkIn ? 'done' : 'none'">
                  {{ todayShift.checkIn || '—' }}
                </p>
              </div>
              <div class="ci-sep" />
              <div class="ci-cell">
                <p class="ci-label">Check Out</p>
                <p class="ci-val" :class="todayShift.checkOut ? 'done' : 'none'">
                  {{ todayShift.checkOut || '—' }}
                </p>
              </div>
              <div class="ci-sep" />
              <div class="ci-cell">
                <p class="ci-label">Duration</p>
                <p class="ci-val" :class="todayShift.checkIn && todayShift.checkOut ? 'done' : 'none'">
                  {{ calcHours(todayShift.checkIn, todayShift.checkOut) }}
                </p>
              </div>
            </div>

            <div class="notes-row" v-if="todayShift.notes">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ todayShift.notes }}
            </div>
          </div>

          <div v-else class="empty-state">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" stroke-width="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <p>No shift scheduled today</p>
          </div>
        </div>

        <!-- Payroll -->
        <div class="panel">
          <div class="card-header">
            <div>
              <p class="card-title">My Payroll</p>
              <p class="card-sub">{{ currentMonth }}</p>
            </div>
            <span class="badge"
              :class="payroll.isReceived ? 'green' : payroll.isCreated ? 'blue' : 'amber'">
              {{ payroll.isReceived ? 'Received' : payroll.isCreated ? 'Generated' : 'Pending' }}
            </span>
          </div>

          <!-- Stats row -->
          <div class="payroll-stats-row">
            <div class="ps-item">
              <span class="ps-val">{{ payroll.hoursWorked }}<span class="ps-unit">h</span></span>
              <span class="ps-label">Hours Logged</span>
            </div>
            <div class="ps-divider" />
            <div class="ps-item">
              <span class="ps-val">{{ payroll.shiftsCompleted }}<span class="ps-unit">/{{ payroll.totalShifts }}</span></span>
              <span class="ps-label">Shifts Done</span>
            </div>
            <div class="ps-divider" />
            <div class="ps-item">
              <span class="ps-val">{{ attendanceRate }}<span class="ps-unit">%</span></span>
              <span class="ps-label">Attendance</span>
            </div>
          </div>

          <!-- Progress tracker -->
          <p class="progress-section-label">Payroll Progress</p>
          <div class="progress-track">
            <div class="prog-step active">
              <div class="prog-dot filled" />
              <span>Logged</span>
            </div>
            <div class="prog-line" :class="{ filled: payroll.isCreated }" />
            <div class="prog-step" :class="{ active: payroll.isCreated }">
              <div class="prog-dot" :class="{ filled: payroll.isCreated }" />
              <span>Generated</span>
            </div>
            <div class="prog-line" :class="{ filled: payroll.isReceived }" />
            <div class="prog-step" :class="{ active: payroll.isReceived }">
              <div class="prog-dot" :class="{ filled: payroll.isReceived }" />
              <span>Received</span>
            </div>
          </div>

          <!-- Attendance breakdown -->
          <div class="att-breakdown">
            <div class="att-row" v-for="a in attendanceItems" :key="a.label">
              <span class="att-dot" :style="`background:${a.color}`" />
              <span class="att-label">{{ a.label }}</span>
              <span class="att-val">{{ a.value }}</span>
            </div>
          </div>

        </div>
      </div>

      <!-- ── UPCOMING SHIFTS ─────────────────────────────────── -->
      <div class="panel">
        <div class="card-header">
          <div>
            <p class="card-title">Upcoming Shifts</p>
            <p class="card-sub">Next scheduled assignments</p>
          </div>
          <span class="badge blue">{{ upcomingShifts.length }} Scheduled</span>
        </div>

        <div class="upcoming-list">
          <div
            v-for="(s, i) in upcomingShifts"
            :key="s.id"
            class="upcoming-row"
            :style="`animation-delay:${i*50}ms`"
          >
            <div class="up-date-col">
              <span class="up-day">{{ s.day }}</span>
              <span class="up-date">{{ s.date }}</span>
            </div>
            <div class="up-bar" :class="s.shiftType.toLowerCase()" />
            <div class="up-info">
              <span class="up-name">{{ s.shiftType }} Shift</span>
              <span class="up-time">{{ s.startTime }} – {{ s.endTime }}</span>
            </div>
            <span class="up-badge" :class="s.shiftType.toLowerCase()">{{ s.shiftType }}</span>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import StaffSidebar from '@/components/sidebar/staffSidebar.vue'

export default {
  name: 'StaffDashboard',
  components: { StaffSidebar },

  data() {
    const now = new Date()
    const h = now.getHours()
    return {
      currentTime: '',
      _clockTimer: null,

      greetingWord: h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening',
      todayFull:    now.toLocaleDateString('en-MY', { weekday:'long', day:'numeric', month:'long', year:'numeric' }),
      todayDate:    now.toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' }),
      currentMonth: now.toLocaleDateString('en-MY', { month:'long', year:'numeric' }),

      staff: {
        id: 3,
        fullName: 'Mohd Faris',
        role: 'staff',
      },

      // shift_assignment + shift_attendance_log
      todayShift: {
        id: 3030,
        shiftType: 'Morning',
        startTime: '10:00',
        endTime: '18:00',
        checkIn: '10:05',
        checkOut: null,
        attendanceStatus: 'Late',
        notes: 'Please ensure POS is closed by 17:45.',
      },

      // payroll table
      payroll: {
        hoursWorked: 162.5,
        shiftsCompleted: 19,
        totalShifts: 24,
        isCreated: false,
        isReceived: false,
        attendance: { completed: 17, late: 2, missed: 5 },
      },

      // shift_assignment — next 4
      upcomingShifts: [
        { id:1, day:'Tomorrow',  date:'Sat, 7 Mar',  shiftType:'Morning', startTime:'08:00', endTime:'16:00' },
        { id:2, day:'Sun',       date:'Sun, 8 Mar',  shiftType:'Evening', startTime:'16:00', endTime:'00:00' },
        { id:3, day:'Mon',       date:'Mon, 9 Mar',  shiftType:'Morning', startTime:'08:00', endTime:'16:00' },
        { id:4, day:'Tue',       date:'Tue, 10 Mar', shiftType:'Evening', startTime:'16:00', endTime:'00:00' },
      ],
    }
  },

  computed: {
    attendanceRate() {
      const { completed, late, missed } = this.payroll.attendance
      const total = completed + late + missed
      if (!total) return 0
      return Math.round(((completed + late) / total) * 100)
    },
    attendanceItems() {
      return [
        { label: 'Completed', value: this.payroll.attendance.completed, color: '#22c55e' },
        { label: 'Late',      value: this.payroll.attendance.late,      color: '#f59e0b' },
        { label: 'Missed',    value: this.payroll.attendance.missed,    color: '#ef4444' },
      ]
    },
  },

  mounted() {
    this.updateClock()
    this._clockTimer = setInterval(this.updateClock, 1000)
  },
  beforeUnmount() {
    clearInterval(this._clockTimer)
  },

  methods: {
    updateClock() {
      this.currentTime = new Date().toLocaleTimeString('en-MY', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      })
    },
    calcHours(checkIn, checkOut) {
      if (!checkIn || !checkOut) return '—'
      const [inH, inM]   = checkIn.split(':').map(Number)
      const [outH, outM] = checkOut.split(':').map(Number)
      const diff = ((outH * 60 + outM) - (inH * 60 + inM)) / 60
      return diff > 0 ? diff.toFixed(1) + 'h' : '—'
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
/* ── Base ──────────────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
}
.dashboard {
  flex: 1;
  padding: 32px 36px 48px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Top Bar ───────────────────────────────────────────────────── */
.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 26px; font-weight: 600; color: #0f172a; letter-spacing: -.025em; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 12px; }

.clock-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px; color: #475569;
}
.clock-time {
  font-family: 'DM Mono', monospace;
  font-size: 13px; color: #0f172a; font-weight: 500;
}

.live-dot {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; color: #10b981; font-weight: 500;
}
.pulse {
  width: 8px; height: 8px; background: #10b981;
  border-radius: 50%; display: block;
  animation: pulse-anim 1.8s ease infinite;
}
@keyframes pulse-anim {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}
@keyframes fadeUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}

/* ── KPI Cards ─────────────────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.kpi-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  animation: fadeUp .35s ease both;
  transition: box-shadow .15s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
.kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.kpi-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.kpi-trend { font-size: 11.5px; font-weight: 500; padding: 3px 8px; border-radius: 5px; }
.kpi-trend.up   { background: #f0fdf4; color: #15803d; }
.kpi-trend.down { background: #fef2f2; color: #dc2626; }
.kpi-val {
  font-size: 28px; font-weight: 700; color: #0f172a;
  letter-spacing: -.03em; margin-bottom: 2px;
}
.kpi-unit { font-size: 16px; font-weight: 500; color: #94a3b8; }
.kpi-label { font-size: 12.5px; color: #64748b; margin-bottom: 12px; }
.kpi-bar { height: 3px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.kpi-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }

/* ── Panels ────────────────────────────────────────────────────── */
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.panel {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.card-header {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.card-title { font-size: 14.5px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }

.badge {
  display: inline-flex; align-items: center;
  padding: 4px 11px; border-radius: 6px;
  font-size: 12px; font-weight: 600; white-space: nowrap; flex-shrink: 0;
}
.badge.blue  { background: #eff6ff; color: #1d4ed8; }
.badge.green { background: #f0fdf4; color: #15803d; }
.badge.amber { background: #fffbeb; color: #b45309; }
.badge.red   { background: #fef2f2; color: #dc2626; }
.badge.grey  { background: #f8fafc; color: #64748b; }

/* ── Today Shift Panel ─────────────────────────────────────────── */
.shift-meta-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.shift-type-tag {
  display: inline-block; padding: 4px 12px; border-radius: 6px;
  font-size: 12px; font-weight: 600;
}
.shift-type-tag.morning { background: #fef9c3; color: #854d0e; }
.shift-type-tag.evening { background: #ede9fe; color: #5b21b6; }

.shift-time-range {
  display: flex; align-items: center; gap: 8px;
  font-family: 'DM Mono', monospace;
  font-size: 13.5px; font-weight: 500; color: #0f172a;
}
.mono      { font-family: 'DM Mono', monospace; }
.time-sep  { color: #94a3b8; font-family: 'DM Sans', sans-serif; font-size: 12px; }

.checkin-grid {
  display: flex; align-items: stretch;
  background: #f8fafc; border-radius: 10px;
  margin-bottom: 14px;
}
.ci-cell  { flex: 1; text-align: center; padding: 14px 12px; }
.ci-sep   { width: 1px; background: #e2e8f0; }
.ci-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; }
.ci-val   { font-family: 'DM Mono', monospace; font-size: 18px; font-weight: 500; }
.ci-val.done { color: #0f172a; }
.ci-val.none { color: #cbd5e1; }

.notes-row {
  display: flex; align-items: flex-start; gap: 7px;
  font-size: 12.5px; color: #64748b; line-height: 1.55;
  background: #f8fafc; border-radius: 8px; padding: 10px 12px;
}
.empty-state {
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  padding: 32px 0; gap: 10px;
  color: #cbd5e1; font-size: 13px;
}

/* ── Payroll Panel ─────────────────────────────────────────────── */
.payroll-stats-row {
  display: flex; align-items: center;
  background: #f8fafc; border-radius: 10px;
  padding: 16px 0; margin-bottom: 20px;
}
.ps-item  { flex: 1; text-align: center; }
.ps-val   { display: block; font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; margin-bottom: 4px; }
.ps-unit  { font-size: 14px; font-weight: 500; color: #94a3b8; }
.ps-label { font-size: 12px; color: #64748b; }
.ps-divider { width: 1px; height: 44px; background: #e2e8f0; }

.progress-section-label {
  font-size: 11px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 12px;
}
.progress-track {
  display: flex; align-items: center; margin-bottom: 18px;
}
.prog-step { display: flex; flex-direction: column; align-items: center; gap: 5px; flex-shrink: 0; }
.prog-step span { font-size: 11px; color: #94a3b8; white-space: nowrap; }
.prog-step.active span { color: #475569; font-weight: 500; }
.prog-dot {
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid #e2e8f0; background: #fff; transition: all .3s;
}
.prog-dot.filled { background: #0f172a; border-color: #0f172a; }
.prog-line {
  flex: 1; height: 2px; background: #e2e8f0;
  margin-bottom: 18px; transition: background .3s;
}
.prog-line.filled { background: #0f172a; }

.att-breakdown {
  display: flex; flex-direction: column; gap: 7px;
  border: 1px solid #f1f5f9; border-radius: 9px; padding: 12px 14px;
}
.att-row { display: flex; align-items: center; gap: 9px; font-size: 13px; }
.att-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.att-label { flex: 1; color: #475569; }
.att-val  { font-weight: 600; color: #1e293b; }

/* ── Upcoming Shifts ───────────────────────────────────────────── */
.upcoming-list { display: flex; flex-direction: column; gap: 8px; }
.upcoming-row {
  display: flex; align-items: center; gap: 16px;
  padding: 13px 16px;
  background: #f8fafc; border-radius: 10px;
  animation: fadeUp .35s ease both;
  transition: background .12s;
}
.upcoming-row:hover { background: #f1f5f9; }

.up-date-col { width: 80px; flex-shrink: 0; }
.up-day  { display: block; font-size: 13px; font-weight: 600; color: #0f172a; }
.up-date { display: block; font-size: 11.5px; color: #94a3b8; margin-top: 2px; }

.up-bar {
  width: 3px; height: 36px; border-radius: 99px; flex-shrink: 0;
}
.up-bar.morning { background: #f59e0b; }
.up-bar.evening { background: #8b5cf6; }

.up-info { flex: 1; }
.up-name { display: block; font-size: 13.5px; font-weight: 500; color: #1e293b; }
.up-time {
  display: block; font-size: 12px; color: #94a3b8;
  font-family: 'DM Mono', monospace; margin-top: 2px;
}

.up-badge {
  padding: 3px 10px; border-radius: 5px;
  font-size: 11.5px; font-weight: 600;
}
.up-badge.morning { background: #fef9c3; color: #854d0e; }
.up-badge.evening { background: #ede9fe; color: #5b21b6; }

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .two-col  { grid-template-columns: 1fr; }
  .dashboard { padding: 20px 18px 40px; }
}
@media (max-width: 560px) {
  .kpi-grid { grid-template-columns: 1fr 1fr; }
  .topbar-title { font-size: 20px; }
}
</style>