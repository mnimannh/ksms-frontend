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
      <p class="kpi-val">
        <span v-if="card.prefix" class="kpi-prefix">{{ card.prefix }}</span>{{ card.value }}<span class="kpi-unit" v-if="card.unit">{{ card.unit }}</span>
      </p>
      <p class="kpi-label">{{ card.label }}</p>
      <div class="kpi-bar"><div class="kpi-fill" :style="`width:${card.pct}%; background:${card.color}`" /></div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'PayrollSummaryCards',
  props: {
    records:     { type: Array,  required: true },
    hourlyRate:  { type: Number, default: 0 },
  },
  computed: {
    cards() {
      // All records unfiltered for "all time" — but we only have `records` prop
      // records[0] = current/latest month, records[1] = last month
      const lastMonthRecord = this.records[1] ?? null
      const lastMonthHours  = lastMonthRecord?.hoursWorked ?? 0
      const lastMonthPay    = lastMonthHours * this.hourlyRate
      const lastMonthLabel  = lastMonthRecord?.monthLabel?.split(' ')[0] ?? '—'

      const totalHours   = this.records.reduce((s, r) => s + r.hoursWorked, 0)
      const totalEarned  = this.records.reduce((s, r) => s + r.hoursWorked * this.hourlyRate, 0)
      const total        = this.records.length

      return [
        {
          label: 'Hourly Rate', value: this.hourlyRate.toFixed(2), prefix: 'RM ',
          trend: 'per hour', trendClass: 'neutral',
          pct: 100,
          color: '#6366f1', bg: '#eef2ff',
          iconPath: `<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`,
        },
        {
          label: 'Last Month Pay', value: lastMonthPay.toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 }), prefix: 'RM ',
          trend: lastMonthLabel, trendClass: lastMonthRecord ? 'up' : 'neutral',
          pct: Math.min((lastMonthHours / 200) * 100, 100),
          color: '#10b981', bg: '#f0fdf4',
          iconPath: `<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>`,
        },
        {
          label: 'Total Hours Worked', value: totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1), unit: 'h',
          trend: `${total} month${total !== 1 ? 's' : ''}`, trendClass: 'neutral',
          pct: Math.min((totalHours / (200 * total || 1)) * 100, 100),
          color: '#f59e0b', bg: '#fffbeb',
          iconPath: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`,
        },
        {
          label: 'Total Earned (All Time)', value: totalEarned.toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 }), prefix: 'RM ',
          trend: `${total} month${total !== 1 ? 's' : ''}`, trendClass: 'neutral',
          pct: 100,
          color: '#8b5cf6', bg: '#f5f3ff',
          iconPath: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>`,
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
.kpi-val    { font-size:22px; font-weight:700; color:#0f172a; letter-spacing:-.03em; margin-bottom:2px; word-break:break-all; }
.kpi-prefix { font-size:13px; font-weight:500; color:#94a3b8; }
.kpi-unit   { font-size:16px; font-weight:500; color:#94a3b8; }
.kpi-label  { font-size:12.5px; color:#64748b; margin-bottom:12px; }
.kpi-bar    { height:3px; background:#f1f5f9; border-radius:99px; overflow:hidden; }
.kpi-fill   { height:100%; border-radius:99px; transition:width .6s ease; }

@media(max-width:1024px) { .summary-grid { grid-template-columns: repeat(2,1fr); } }
@media(max-width:560px)  { .summary-grid { grid-template-columns: 1fr 1fr; } }
</style>