<template>
  <div class="kpi-strip">
    <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
      <span class="kpi-val">{{ kpi.value }}</span>
      <span class="kpi-label">{{ kpi.label }}</span>
      <span class="kpi-sub" :class="kpi.subClass">{{ kpi.sub }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShiftKpiStrip',
  props: {
    shifts: { type: Array, required: true },
    attendance: { type: Array, required: true },
  },
  computed: {
    kpis() {
      const total = this.shifts.length;
      const completed = this.attendance.filter(a => a.status === 'Completed').length;
      const late      = this.attendance.filter(a => a.status === 'Late').length;
      const missed    = this.attendance.filter(a => a.status === 'Missed').length;
      const pending   = this.attendance.filter(a => a.status === 'Pending').length;
      return [
        { label: 'Total Shifts',   value: total,     sub: 'This month',              subClass: '' },
        { label: 'Completed',      value: completed, sub: `${Math.round(completed / total * 100)}% rate`, subClass: 'sub-green' },
        { label: 'Late Arrivals',  value: late,      sub: `${Math.round(late / total * 100)}% of shifts`, subClass: 'sub-amber' },
        { label: 'Missed',         value: missed,    sub: `${missed} no-shows`,       subClass: 'sub-red' },
        { label: 'Pending',        value: pending,   sub: 'Awaiting check-in',        subClass: '' },
      ];
    },
  },
};
</script>

<style scoped>
.kpi-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 22px;
}
.kpi-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: box-shadow 0.2s, transform 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-1px); }
.kpi-val {
  font-family: 'Sora', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
}
.kpi-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.6rem;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.kpi-sub { font-family: 'Sora', sans-serif; font-size: 0.72rem; color: #94a3b8; }
.sub-green { color: #16a34a !important; }
.sub-amber { color: #d97706 !important; }
.sub-red   { color: #dc2626 !important; }

@media (max-width: 1100px) { .kpi-strip { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px)  { .kpi-strip { grid-template-columns: repeat(2, 1fr); } }
</style>