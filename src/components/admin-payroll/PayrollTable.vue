<template>
  <div class="table-card">
    <table class="payroll-table">
      <thead>
        <tr>
          <th>Staff Member</th>
          <th>Department</th>
          <th>Shifts</th>
          <th>Hours Worked</th>
          <th>Attendance</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(staff, idx) in staffList"
          :key="staff.userID"
          class="table-row"
          :style="`animation-delay:${idx * 45}ms`"
        >
          <td>
            <div class="staff-cell">
              <div class="avatar" :style="`background:${staff.avatarColor}`">{{ staff.initials }}</div>
              <div>
                <span class="staff-name">{{ staff.name }}</span>
                <span class="staff-id">ID #{{ staff.userID }}</span>
              </div>
            </div>
          </td>

          <td><span class="dept-badge">{{ staff.department }}</span></td>

          <td>
            <span class="shift-num">{{ staff.completedShifts }}/{{ staff.totalShifts }}</span>
            <span class="shift-sub">completed</span>
          </td>

          <td>
            <div class="hours-cell">
              <span class="hours-val">{{ staff.hoursWorked }}h</span>
              <div class="hours-bar">
                <div class="hours-fill" :style="`width:${Math.min((staff.hoursWorked/200)*100,100)}%`" />
              </div>
            </div>
          </td>

          <td>
            <div class="pills">
              <span class="pill completed">{{ staff.attendance.completed }} ✓</span>
              <span class="pill late"      v-if="staff.attendance.late > 0">{{ staff.attendance.late }} ⚠</span>
              <span class="pill missed"    v-if="staff.attendance.missed > 0">{{ staff.attendance.missed }} ✕</span>
            </div>
          </td>

          <td>
            <span class="status-badge" :class="staff.payrollStatus">
              <span class="dot" /><span>{{ labelMap[staff.payrollStatus] }}</span>
            </span>
          </td>

          <td>
            <div class="actions">
              <button
                v-if="staff.payrollStatus === 'pending'"
                class="btn primary"
                @click="$emit('generate', staff)"
              >Generate</button>
              
              <button v-else class="btn ghost" @click="$emit('view', staff)">
                View Payslip
              </button>
              
              <button class="btn icon" @click="$emit('view-log', staff)" title="Attendance Log">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="staffList.length === 0" class="empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
      </svg>
      <p>No staff records found.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayrollTable',
  emits: ['generate', 'view', 'view-log'],
  props: {
    staffList: { type: Array, required: true },
  },
  data() {
    return {
      labelMap: { pending: 'Pending', generated: 'Generated', received: 'Received' },
    }
  },
}
</script>

<style scoped>
.table-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
}
.payroll-table { width: 100%; border-collapse: collapse; }
.payroll-table thead tr {
  background: #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}
.payroll-table th {
  padding: 12px 18px;
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .07em;
  text-align: left;
  white-space: nowrap;
}
.table-row {
  border-bottom: 1px solid #f8fafc;
  animation: rowIn .3s ease both;
  transition: background .12s;
}
.table-row:last-child { border-bottom: none; }
.table-row:hover { background: #fafbff; }
@keyframes rowIn {
  from { opacity:0; transform:translateY(5px); }
  to   { opacity:1; transform:translateY(0); }
}
.payroll-table td { padding: 14px 18px; vertical-align: middle; }

.staff-cell { display:flex; align-items:center; gap:11px; }
.avatar {
  width:34px; height:34px;
  border-radius:8px;
  display:flex; align-items:center; justify-content:center;
  font-size:12px; font-weight:600; color:#fff; flex-shrink:0;
}
.staff-name { display:block; font-size:14px; font-weight:500; color:#1e293b; }
.staff-id   { display:block; font-size:11.5px; color:#94a3b8; margin-top:1px; }

.dept-badge {
  display:inline-block;
  padding:3px 10px;
  background:#f1f5f9;
  border-radius:5px;
  font-size:12px; color:#475569; font-weight:500;
}

.shift-num { display:block; font-size:14px; font-weight:600; color:#1e293b; }
.shift-sub { display:block; font-size:11.5px; color:#94a3b8; }

.hours-cell { min-width:90px; }
.hours-val { display:block; font-size:14px; font-weight:600; color:#1e293b; margin-bottom:5px; }
.hours-bar { height:4px; background:#f1f5f9; border-radius:99px; overflow:hidden; }
.hours-fill { height:100%; background:linear-gradient(90deg,#6366f1,#8b5cf6); border-radius:99px; transition:width .4s; }

.pills { display:flex; gap:5px; flex-wrap:wrap; }
.pill { padding:2px 8px; border-radius:5px; font-size:11.5px; font-weight:500; }
.pill.completed { background:#f0fdf4; color:#16a34a; }
.pill.late      { background:#fffbeb; color:#b45309; }
.pill.missed    { background:#fef2f2; color:#dc2626; }

.status-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 11px; border-radius:6px;
  font-size:12.5px; font-weight:500; white-space:nowrap;
}
.status-badge.pending   { background:#fffbeb; color:#92400e; }
.status-badge.generated { background:#eff6ff; color:#1d4ed8; }
.status-badge.received  { background:#f0fdf4; color:#15803d; }
.dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

.actions { display:flex; gap:6px; align-items:center; }
.btn {
  padding:6px 14px;
  border-radius:7px;
  font-family:'DM Sans',sans-serif;
  font-size:13px; font-weight:500;
  cursor:pointer; border:none;
  transition:all .15s;
}
.btn.primary { background:#6366f1; color:#fff; }
.btn.primary:hover { background:#4f46e5; }
.btn.ghost {
  background:#f8fafc; color:#475569;
  border:1px solid #e2e8f0;
}
.btn.ghost:hover { background:#f1f5f9; }
.btn.icon {
  width:32px; height:32px; padding:0;
  display:flex; align-items:center; justify-content:center;
  background:#f8fafc; color:#94a3b8;
  border:1px solid #e2e8f0;
}
.btn.icon:hover { background:#f1f5f9; color:#475569; }

.empty {
  display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  padding:52px; gap:12px;
  color:#94a3b8; font-size:14px;
}
</style>