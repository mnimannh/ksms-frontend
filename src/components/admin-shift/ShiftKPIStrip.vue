<template>
  <div class="kpi-strip">
    <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label">
      <div class="kpi-icon" :style="{ background: kpi.iconBg }">
        <svg :style="{ color: kpi.iconColor }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" v-html="kpi.icon" />
      </div>
      <div class="kpi-body">
        <span class="kpi-val">{{ kpi.value }}</span>
        <span class="kpi-label">{{ kpi.label }}</span>
        <span class="kpi-sub" :class="kpi.subClass">{{ kpi.sub }}</span>
      </div>
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
        { label: 'Total Shifts',  value: total,     sub: 'This month',                           subClass: '',          iconBg: '#eef2ff', iconColor: '#6366f1', icon: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>' },
        { label: 'Completed',     value: completed, sub: `${total ? Math.round(completed/total*100) : 0}% rate`,   subClass: 'sub-green', iconBg: '#f0fdf4', iconColor: '#22c55e', icon: '<polyline points="20 6 9 17 4 12"/>' },
        { label: 'Late Arrivals', value: late,      sub: `${total ? Math.round(late/total*100) : 0}% of shifts`, subClass: 'sub-amber', iconBg: '#fffbeb', iconColor: '#f59e0b', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
        { label: 'Missed',        value: missed,    sub: `${missed} no-shows`,                   subClass: 'sub-red',   iconBg: '#fff1f2', iconColor: '#ef4444', icon: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>' },
        { label: 'Pending',       value: pending,   sub: 'Awaiting check-in',                    subClass: '',          iconBg: '#f8fafc', iconColor: '#64748b', icon: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
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
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 18px 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  transition: box-shadow 0.2s, transform 0.2s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); transform: translateY(-2px); }
.kpi-icon {
  width: 40px; height: 40px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.kpi-body { display: flex; flex-direction: column; gap: 2px; }
.kpi-val {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.04em;
  line-height: 1;
}
.kpi-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  color: #94a3b8;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.kpi-sub { font-family: 'DM Sans', sans-serif; font-size: 0.72rem; color: #94a3b8; }
.sub-green { color: #16a34a !important; }
.sub-amber { color: #d97706 !important; }
.sub-red   { color: #dc2626 !important; }

@media (max-width: 1100px) { .kpi-strip { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 700px)  { .kpi-strip { grid-template-columns: repeat(2, 1fr); } }
</style>