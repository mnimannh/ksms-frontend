<template>
  <div class="charts-section no-print">

    <!-- Top 10 Gross Profit -->
    <div class="chart-block">
      <p class="chart-title">Top 10 Items by Gross Profit (RM) — {{ periodLabel }}</p>
      <div class="chart-area">
        <canvas ref="profitChart" />
      </div>
    </div>

    <!-- Revenue vs COGS by category -->
    <div class="chart-block">
      <p class="chart-title">Revenue vs COGS by Category (RM) — {{ periodLabel }}</p>
      <div class="chart-area">
        <canvas ref="cogsChart" />
      </div>
    </div>

  </div>
</template>

<script>
import {
  Chart, BarController, BarElement,
  LinearScale, CategoryScale, Tooltip, Legend,
} from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend)

export default {
  name: 'ReportCharts',
  props: {
    periodLabel: { type: String, required: true },
    rows:        { type: Array,  required: true },
  },

  computed: {
    top10Profit() {
      return [...this.rows]
        .filter(r => r.sold > 0)
        .sort((a, b) => b.grossProfit - a.grossProfit)
        .slice(0, 10)
    },
    categoryTotals() {
      const map = {}
      this.rows.forEach(r => {
        if (!map[r.category]) map[r.category] = { revenue: 0, cogs: 0 }
        map[r.category].revenue += r.revenue
        map[r.category].cogs    += r.cogs
      })
      return Object.entries(map)
        .map(([name, v]) => ({ name, revenue: parseFloat(v.revenue.toFixed(2)), cogs: parseFloat(v.cogs.toFixed(2)) }))
        .sort((a, b) => b.revenue - a.revenue)
    },
  },

  watch: {
    rows() { this.$nextTick(() => { this.rebuildProfit(); this.rebuildCogs() }) },
  },

  mounted() {
    this.$nextTick(() => { this.initProfit(); this.initCogs() })
  },

  beforeUnmount() {
    this._profitChart?.destroy()
    this._cogsChart?.destroy()
  },

  methods: {
    short(name) { return name.length > 16 ? name.slice(0, 15) + '…' : name },

    rmTooltip(v) { return 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 }) },

    baseOptions(yLabel) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true, position: 'top', align: 'end',
            labels: { boxWidth: 10, boxHeight: 10, borderRadius: 3, font: { family: 'DM Sans', size: 12 }, color: '#64748b', padding: 16 },
          },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } } },
          y: {
            grid: { color: '#f1f5f9' }, beginAtZero: true,
            ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, callback: v => 'RM ' + v.toLocaleString() },
          },
        },
      }
    },

    initProfit() {
      const ctx = this.$refs.profitChart?.getContext('2d')
      if (!ctx) return
      const top = this.top10Profit
      this._profitChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top.map(r => this.short(r.name)),
          datasets: [
            {
              label: 'Revenue (RM)',
              data: top.map(r => r.revenue),
              backgroundColor: 'rgba(16,185,129,0.18)',
              borderColor: '#10b981', borderWidth: 1.5,
              borderRadius: 4, borderSkipped: false,
            },
            {
              label: 'COGS (RM)',
              data: top.map(r => r.cogs),
              backgroundColor: 'rgba(239,68,68,0.18)',
              borderColor: '#ef4444', borderWidth: 1.5,
              borderRadius: 4, borderSkipped: false,
            },
            {
              label: 'Gross Profit (RM)',
              data: top.map(r => r.grossProfit),
              backgroundColor: 'rgba(99,102,241,0.8)',
              borderColor: 'transparent',
              borderRadius: 4, borderSkipped: false,
            },
          ],
        },
        options: this.baseOptions(),
      })
    },

    initCogs() {
      const ctx = this.$refs.cogsChart?.getContext('2d')
      if (!ctx) return
      const cats = this.categoryTotals
      this._cogsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: cats.map(c => c.name),
          datasets: [
            {
              label: 'Revenue (RM)',
              data: cats.map(c => c.revenue),
              backgroundColor: 'rgba(16,185,129,0.8)',
              borderColor: 'transparent',
              borderRadius: 4, borderSkipped: false,
            },
            {
              label: 'COGS (RM)',
              data: cats.map(c => c.cogs),
              backgroundColor: 'rgba(239,68,68,0.75)',
              borderColor: 'transparent',
              borderRadius: 4, borderSkipped: false,
            },
          ],
        },
        options: this.baseOptions(),
      })
    },

    rebuildProfit() {
      if (!this._profitChart) return this.initProfit()
      const top = this.top10Profit
      this._profitChart.data.labels = top.map(r => this.short(r.name))
      this._profitChart.data.datasets[0].data = top.map(r => r.revenue)
      this._profitChart.data.datasets[1].data = top.map(r => r.cogs)
      this._profitChart.data.datasets[2].data = top.map(r => r.grossProfit)
      this._profitChart.update()
    },

    rebuildCogs() {
      if (!this._cogsChart) return this.initCogs()
      const cats = this.categoryTotals
      this._cogsChart.data.labels = cats.map(c => c.name)
      this._cogsChart.data.datasets[0].data = cats.map(c => c.revenue)
      this._cogsChart.data.datasets[1].data = cats.map(c => c.cogs)
      this._cogsChart.update()
    },
  },
}
</script>

<style scoped>
.charts-section { display: flex; flex-direction: column; gap: 24px; }
.chart-block    { display: flex; flex-direction: column; gap: 12px; }
.chart-title {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
}
.chart-area { height: 240px; position: relative; }

@media print {
  .no-print { display: none !important; }
}
</style>
