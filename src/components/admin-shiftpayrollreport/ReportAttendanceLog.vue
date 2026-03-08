<template>
  <div class="table-section">
    <div class="section-header">
      <span class="section-accent" style="background:#10b981"></span>
      <h2 class="section-title">Shift Attendance Log</h2>
    </div>
    <div class="table-wrap">
      <table class="rt">
        <thead>
          <tr>
            <th class="c">#</th>
            <th>Staff Name</th>
            <th class="c">Shift ID</th>
            <th>Check-In</th>
            <th>Check-Out</th>
            <th class="c">Duration</th>
            <th class="c">Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, i) in logs" :key="log.id">
            <td class="c idx">{{ i + 1 }}</td>
            <td>
              <div class="name-cell">
                <div class="avatar" :style="{ background: avatarColor(log.fullName) }">{{ initials(log.fullName) }}</div>
                {{ log.fullName }}
              </div>
            </td>
            <td class="c mono muted">#{{ log.shiftID }}</td>
            <td class="mono dt">{{ fmtDt(log.checkIn) }}</td>
            <td class="mono dt">{{ fmtDt(log.checkOut) }}</td>
            <td class="c mono">{{ duration(log.checkIn, log.checkOut) }}</td>
            <td class="c">
              <span :class="['pill', log.status.toLowerCase()]">{{ log.status }}</span>
            </td>
            <td class="notes-cell">{{ log.notes || '—' }}</td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="8" class="empty-row">No attendance records found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
const P = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#14b8a6','#f97316']
const hash = s => { let h=0; for (const c of s) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h) }

export default {
  name: 'ReportAttendanceLog',
  props: { logs: Array },
  methods: {
    initials(n) { return n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() },
    avatarColor(n) { return P[hash(n) % P.length] },
    fmtDt(dt) {
      if (!dt) return '—'
      return new Date(dt).toLocaleString('en-MY', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })
    },
    duration(ci, co) {
      if (!ci || !co) return '—'
      const diff = (new Date(co) - new Date(ci)) / 3600000
      return diff < 0 ? '—' : diff.toFixed(2) + ' h'
    },
  },
}
</script>

<style scoped>
.section-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.section-accent { display: inline-block; width: 4px; height: 18px; border-radius: 2px; flex-shrink: 0; }
.section-title  { font-size: 14px; font-weight: 700; color: #0f172a; }

.table-wrap { overflow-x: auto; border-radius: 10px; border: 1.5px solid #f1f5f9; }

.rt { width: 100%; border-collapse: collapse; font-size: 13px; color: #334155; }
.rt thead tr { background: #f8fafc; }
.rt th {
  padding: 10px 13px; text-align: left;
  font-size: 10.5px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: .055em;
  border-bottom: 1.5px solid #e2e8f0; white-space: nowrap;
}
.rt td { padding: 10px 13px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.rt tbody tr:last-child td { border-bottom: none; }
.rt tbody tr:hover td { background: #fafbff; }
.rt th.c, .rt td.c { text-align: center; }

.idx   { color: #94a3b8; font-size: 12px; width: 36px; }
.mono  { font-family: 'DM Mono', monospace; font-size: 12px; }
.muted { color: #64748b; }
.dt    { color: #475569; white-space: nowrap; }
.notes-cell { font-size: 12px; color: #64748b; max-width: 180px; }
.empty-row  { text-align: center; color: #94a3b8; padding: 32px; font-size: 13px; }

.name-cell { display: flex; align-items: center; gap: 9px; font-weight: 500; color: #0f172a; white-space: nowrap; }
.avatar {
  width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 9px; font-weight: 700;
}

.pill { font-size: 11px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
.pill.completed { background: #f0fdf4; color: #16a34a; }
.pill.pending   { background: #f1f5f9; color: #64748b; }
.pill.late      { background: #fffbeb; color: #d97706; }
.pill.missed    { background: #fef2f2; color: #dc2626; }

@media print {
  .rt th, .rt td { padding: 5px 7px; font-size: 8pt; }
  .rt th { font-size: 7pt; }
  .avatar { display: none; }
  .name-cell { gap: 0; }
}
</style>