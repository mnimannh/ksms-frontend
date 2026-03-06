<template>
  <div class="summary-grid">
    <div class="summary-card" v-for="card in cards" :key="card.label">
<div class="icon-wrap" :class="card.color">
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    v-html="card.iconPath"
  ></svg>
</div>
      <div class="summary-info">
        <span class="val">{{ card.value }}</span>
        <span class="lbl">{{ card.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PayrollSummaryCards',
  props: {
    staffList: { type: Array, required: true },
  },
  computed: {
    cards() {
      const total     = this.staffList.length
      const generated = this.staffList.filter(s => s.payrollStatus !== 'pending').length
      const pending   = this.staffList.filter(s => s.payrollStatus === 'pending').length
      const hours     = this.staffList.reduce((s, x) => s + x.hoursWorked, 0).toFixed(1)
      return [
        {
          label: 'Total Staff', value: total, color: 'blue',
          iconPath: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
        },
        {
          label: 'Generated', value: generated, color: 'green',
          iconPath: `<polyline points="20 6 9 17 4 12"/>`,
        },
        {
          label: 'Pending', value: pending, color: 'amber',
          iconPath: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
        },
        {
          label: 'Total Hours', value: hours + 'h', color: 'purple',
          iconPath: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
        },
      ]
    },
  },
}
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.summary-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.icon-wrap {
  width: 38px; height: 38px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.icon-wrap.blue   { background:#eff6ff; color:#3b82f6; }
.icon-wrap.green  { background:#f0fdf4; color:#22c55e; }
.icon-wrap.amber  { background:#fffbeb; color:#f59e0b; }
.icon-wrap.purple { background:#f5f3ff; color:#8b5cf6; }
.val { display:block; font-size:22px; font-weight:600; color:#0f172a; letter-spacing:-0.02em; }
.lbl { display:block; font-size:12px; color:#94a3b8; margin-top:1px; }
@media(max-width:900px){ .summary-grid{ grid-template-columns:repeat(2,1fr); } }
@media(max-width:500px){ .summary-grid{ grid-template-columns:1fr 1fr; } }
</style>