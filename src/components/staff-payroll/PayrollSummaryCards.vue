<template>
  <div class="summary-grid">

    <div class="kpi-card" v-for="(card, i) in cards" :key="card.label" :style="`animation-delay:${i*60}ms`">
      <div class="kpi-top">
        <div class="kpi-icon" :style="`background:${card.bg}; color:${card.color}`">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" v-html="card.iconPath" />
        </div>
        <span class="kpi-trend" :class="card.trendClass">{{ card.trend }}</span>
      </div>
      <p class="kpi-val">{{ card.value }}<span class="kpi-unit" v-if="card.unit">{{ card.unit }}</span></p>
      <p class="kpi-label">{{ card.label }}</p>
      <div class="kpi-bar"><div class="kpi-fill" :style="`width:${card.pct}%; background:${card.color}`" /></div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'PayrollSummaryCards',
  props: {
    records: { type: Array, required: true },
  },
  computed: {
    cards() {
      const total       = this.records.length
      const received    = this.records.filter(r => r.isReceived).length
      const generated   = this.records.filter(r => r.isCreated && !r.isReceived).length
      const pending     = this.records.filter(r => !r.isCreated).length
      const totalHours  = this.records.reduce((s, r) => s + r.hoursWorked, 0)
      const latestHours = this.records[0]?.hoursWorked ?? 0

      return [
        {
          label: 'Total Hours Logged', value: totalHours.toFixed(1), unit: 'h',
          trend: 'All time', trendClass: 'neutral',
          pct: Math.min((totalHours / 1400) * 100, 100),
          color: '#6366f1', bg: '#eef2ff',
          iconPath: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
        },
        {
          label: 'This Month Hours', value: latestHours.toFixed(1), unit: 'h',
          trend: this.records[0]?.monthLabel?.split(' ')[0] ?? '—', trendClass: 'up',
          pct: Math.min((latestHours / 200) * 100, 100),
          color: '#10b981', bg: '#f0fdf4',
          iconPath: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
        },
        {
          label: 'Payroll Received', value: received, unit: '',
          trend: `of ${total} months`, trendClass: 'up',
          pct: total ? (received / total) * 100 : 0,
          color: '#22c55e', bg: '#f0fdf4',
          iconPath: `<polyline points="20 6 9 17 4 12"/>`,
        },
        {
          label: 'Pending / Generated', value: `${pending} / ${generated}`, unit: '',
          trend: pending > 0 ? `${pending} awaiting` : 'All clear',
          trendClass: pending > 0 ? 'down' : 'up',
          pct: total ? ((pending + generated) / total) * 100 : 0,
          color: '#f59e0b', bg: '#fffbeb',
          iconPath: `<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>`,
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
@keyframes fadeUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
.kpi-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px; }
.kpi-icon {
  width:38px; height:38px; border-radius:10px;
  display:flex; align-items:center; justify-content:center;
}
.kpi-trend { font-size:11.5px; font-weight:500; padding:3px 8px; border-radius:5px; }
.kpi-trend.up      { background:#f0fdf4; color:#15803d; }
.kpi-trend.down    { background:#fef2f2; color:#dc2626; }
.kpi-trend.neutral { background:#f8fafc; color:#64748b; }
.kpi-val  { font-size:28px; font-weight:700; color:#0f172a; letter-spacing:-.03em; margin-bottom:2px; }
.kpi-unit { font-size:16px; font-weight:500; color:#94a3b8; }
.kpi-label { font-size:12.5px; color:#64748b; margin-bottom:12px; }
.kpi-bar  { height:3px; background:#f1f5f9; border-radius:99px; overflow:hidden; }
.kpi-fill { height:100%; border-radius:99px; transition:width .6s ease; }

@media(max-width:1024px) { .summary-grid { grid-template-columns: repeat(2,1fr); } }
@media(max-width:560px)  { .summary-grid { grid-template-columns: 1fr 1fr; } }
</style>