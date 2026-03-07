<template>
  <div class="charts-section">

    <!-- Stock vs Sold -->
    <div class="chart-block">
      <p class="chart-title">Stock vs Sold — {{ periodLabel }}</p>
      <div class="chart-area">
        <canvas ref="barChart" />
      </div>
    </div>

    <!-- Revenue vs Potential -->
    <div class="chart-block">
      <p class="chart-title">Revenue Earned vs Potential Revenue (RM) — {{ periodLabel }}</p>
      <div class="chart-area">
        <canvas ref="revenueChart" />
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
    rows:        { type: Array,  required: true }, // enriched rows
  },

  computed: {
    top10Stock() {
      return [...this.rows].sort((a, b) => b.stock - a.stock).slice(0, 10)
    },
    top10Revenue() {
      return [...this.rows].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
    },
  },

  watch: {
    rows() { this.$nextTick(() => { this.rebuildBar(); this.rebuildRevenue() }) },
  },

  mounted() {
    this.$nextTick(() => { this.initBar(); this.initRevenue() })
  },

  beforeUnmount() {
    this._barChart?.destroy()
    this._revenueChart?.destroy()
  },

  methods: {
    shortName(name) {
      return name.length > 14 ? name.slice(0, 13) + '…' : name
    },

    initBar() {
      const ctx = this.$refs.barChart?.getContext('2d')
      if (!ctx) return
      const top = this.top10Stock
      this._barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top.map(r => this.shortName(r.name)),
          datasets: [
            {
              label: 'Total Stock',
              data: top.map(r => r.stock),
              backgroundColor: 'rgba(99,102,241,0.15)',
              borderColor: '#6366f1', borderWidth: 1.5,
              borderRadius: 4, borderSkipped: false,
            },
            {
              label: 'Qty Sold',
              data: top.map(r => r.sold),
              backgroundColor: 'rgba(16,185,129,0.8)',
              borderColor: 'transparent',
              borderRadius: 4, borderSkipped: false,
            },
          ],
        },
        options: this.baseOptions(),
      })
    },

    initRevenue() {
      const ctx = this.$refs.revenueChart?.getContext('2d')
      if (!ctx) return
      const top = this.top10Revenue
      this._revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: top.map(r => this.shortName(r.name)),
          datasets: [
            {
              label: 'Revenue Earned (RM)',
              data: top.map(r => r.revenue),
              backgroundColor: 'rgba(16,185,129,0.8)',
              borderColor: 'transparent',
              borderRadius: 4, borderSkipped: false,
            },
            {
              label: 'Potential Revenue (RM)',
              data: top.map(r => r.potentialRevenue),
              backgroundColor: 'rgba(99,102,241,0.15)',
              borderColor: '#6366f1', borderWidth: 1.5,
              borderRadius: 4, borderSkipped: false,
            },
          ],
        },
        options: {
          ...this.baseOptions(),
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#94a3b8', font: { family: 'DM Sans', size: 11 },
                callback: v => 'RM ' + v.toLocaleString(),
              },
              beginAtZero: true,
            },
          },
        },
      })
    },

    baseOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true, position: 'top', align: 'end',
            labels: {
              boxWidth: 10, boxHeight: 10, borderRadius: 3,
              font: { family: 'DM Sans', size: 12 },
              color: '#64748b', padding: 16,
            },
          },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 } } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, stepSize: 20 },
            beginAtZero: true,
          },
        },
      }
    },

    rebuildBar() {
      if (!this._barChart) return this.initBar()
      const top = this.top10Stock
      this._barChart.data.labels = top.map(r => this.shortName(r.name))
      this._barChart.data.datasets[0].data = top.map(r => r.stock)
      this._barChart.data.datasets[1].data = top.map(r => r.sold)
      this._barChart.update()
    },

    rebuildRevenue() {
      if (!this._revenueChart) return this.initRevenue()
      const top = this.top10Revenue
      this._revenueChart.data.labels = top.map(r => this.shortName(r.name))
      this._revenueChart.data.datasets[0].data = top.map(r => r.revenue)
      this._revenueChart.data.datasets[1].data = top.map(r => r.potentialRevenue)
      this._revenueChart.update()
    },
  },
}
</script>

<style scoped>
.charts-section { display: flex; flex-direction: column; gap: 24px; }

.chart-block { display: flex; flex-direction: column; gap: 12px; }

.chart-title {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
}
.chart-area { height: 220px; position: relative; }

@media print {
  /* Force charts to not overflow */
  .chart-area {
    height: 150px !important;
    overflow: hidden !important;
    page-break-inside: avoid;
  }

  /* Force sections to break cleanly */
  .chart-section    { page-break-after: always; }
  .table-section    { page-break-before: auto; break-inside: avoid; }

  /* Fix scrollable table */
  .table-wrap {
    overflow: visible !important;
    overflow-x: visible !important;
  }

  /* Canvas explicit sizing */
  canvas {
    max-width: 100% !important;
    height: 150px !important;
  }
}
</style>