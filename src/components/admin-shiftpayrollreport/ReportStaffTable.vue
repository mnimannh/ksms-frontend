<template>
  <div class="table-section">
    <div class="section-header">
      <span class="section-accent" style="background:#6366f1"></span>
      <h2 class="section-title">Staff Shift &amp; Payroll Details</h2>
    </div>
    <div class="table-wrap">
      <table class="rt">
        <thead>
          <tr>
            <th class="c">#</th>
            <th>Staff Name</th>
            <th>Role</th>
            <th class="c">Shifts</th>
            <th class="c">Completed</th>
            <th class="c">Late</th>
            <th class="c">Missed</th>
            <th class="c">Hours Worked</th>
            <th class="r">Hourly Rate</th>
            <th class="r">Pay / Shift</th>
            <th class="r">Total Pay</th>
            <th class="c">Payroll</th>
            <th class="c">Received</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in rows" :key="row.userID">
            <td class="c idx">{{ i + 1 }}</td>
            <td>
              <div class="name-cell">
                <div class="avatar" :style="{ background: avatarColor(row.fullName) }">{{ initials(row.fullName) }}</div>
                <span class="name-text">{{ row.fullName }}</span>
              </div>
            </td>
            <td><span :class="['role-tag', row.role]">{{ row.role }}</span></td>
            <td class="c fw">{{ row.shiftsAssigned }}</td>
            <td class="c fw">{{ row.completed }}</td>
            <td class="c">
              <span :class="['badge', row.late > 0 ? 'warn' : 'ok']">{{ row.late }}</span>
            </td>
            <td class="c">
              <span :class="['badge', row.missed > 0 ? 'danger' : 'ok']">{{ row.missed }}</span>
            </td>
            <td class="c mono">{{ row.hoursWorked.toFixed(2) }} h</td>
            <td class="r mono muted">{{ fmtRM(row.hourlyRate) }}/h</td>
            <td class="r mono muted">{{ fmtRM(row.payPerShift) }}</td>
            <td class="r mono pay-val">{{ fmtRM(row.totalPay) }}</td>
            <td class="c">
              <span :class="['pill', row.payrollCreated ? 'created' : 'pending']">
                {{ row.payrollCreated ? 'Created' : 'Pending' }}
              </span>
            </td>
            <td class="c">
              <span :class="['pill', row.payrollReceived ? 'received' : 'notyet']">
                {{ row.payrollReceived ? 'Received' : 'Not Yet' }}
              </span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="foot-lbl">Totals</td>
            <td class="c foot-val">{{ totals.shiftsAssigned }}</td>
            <td class="c foot-val">{{ totals.completed }}</td>
            <td class="c foot-val">{{ totals.late }}</td>
            <td class="c foot-val">{{ totals.missed }}</td>
            <td class="c foot-val mono">{{ totals.hoursWorked.toFixed(2) }} h</td>
            <td class="r foot-val mono">—</td>
            <td class="r foot-val mono">—</td>
            <td class="r foot-val mono pay-total">{{ fmtRM(totals.totalPay) }}</td>
            <td colspan="2"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script>
const P = ['#6366f1','#10b981','#f59e0b','#ef4444','#3b82f6','#8b5cf6','#14b8a6','#f97316']
const hash = s => { let h=0; for (const c of s) h=(h*31+c.charCodeAt(0))&0xffffffff; return Math.abs(h) }

export default {
  name: 'ReportStaffTable',
  props: { rows: Array },
  computed: {
    totals() {
      return this.rows.reduce((a, r) => ({
        shiftsAssigned: a.shiftsAssigned + r.shiftsAssigned,
        completed:      a.completed      + r.completed,
        late:           a.late           + r.late,
        missed:         a.missed         + r.missed,
        hoursWorked:    a.hoursWorked    + r.hoursWorked,
        totalPay:       parseFloat((a.totalPay + r.totalPay).toFixed(2)),
      }), { shiftsAssigned:0, completed:0, late:0, missed:0, hoursWorked:0, totalPay:0 })
    },
  },
  methods: {
    initials(n) { return n.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() },
    avatarColor(n) { return P[hash(n) % P.length] },
    fmtRM(v) { return 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) },
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
.rt th.c, .rt td.c { text-align: center; }
.rt th.r, .rt td.r { text-align: right; }
.rt td { padding: 11px 13px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.rt tbody tr:last-child td { border-bottom: none; }
.rt tbody tr:hover td { background: #fafbff; }

.idx  { color: #94a3b8; font-size: 12px; width: 36px; }
.fw   { font-weight: 600; color: #0f172a; }
.mono { font-family: 'DM Mono', monospace; font-size: 12.5px; }
.muted { color: #64748b; }

.name-cell { display: flex; align-items: center; gap: 9px; }
.avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 10px; font-weight: 700;
}
.name-text { font-weight: 500; color: #0f172a; white-space: nowrap; }

.role-tag { font-size: 11px; font-weight: 600; padding: 2px 9px; border-radius: 20px; text-transform: capitalize; white-space: nowrap; }
.role-tag.admin { background: #eef2ff; color: #6366f1; }
.role-tag.staff { background: #f0fdf4; color: #16a34a; }

.badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 6px;
  font-size: 12.5px; font-weight: 700;
}
.badge.ok     { background: #f0fdf4; color: #16a34a; }
.badge.warn   { background: #fffbeb; color: #d97706; }
.badge.danger { background: #fef2f2; color: #dc2626; }

.pill { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.pill.created  { background: #eef2ff; color: #6366f1; }
.pill.pending  { background: #f1f5f9; color: #94a3b8; }
.pill.received { background: #f0fdf4; color: #16a34a; }
.pill.notyet   { background: #fef2f2; color: #dc2626; }

.pay-val   { color: #0f172a; font-weight: 600; font-size: 13px; }
.pay-total { color: #6366f1; font-weight: 700; font-size: 13px; }

tfoot tr td { background: #f8fafc; border-top: 2px solid #e2e8f0; border-bottom: none; }
.foot-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.foot-val { font-weight: 700; color: #0f172a; }

@media print {
  .rt th, .rt td { padding: 5px 7px; font-size: 8pt; }
  .rt th { font-size: 7pt; }
  .avatar { display: none; }
  .name-cell { gap: 0; }
}
</style>