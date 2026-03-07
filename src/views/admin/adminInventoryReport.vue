<template>
  <div class="app-layout">
    <AdminSidebar class="no-print" />

    <main class="report-main">

      <!-- ── TOOLBAR ── -->
      <div class="toolbar no-print">
        <div class="toolbar-left">
          <div class="breadcrumb">
            <span class="bc-root">Reports</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span class="bc-current">Inventory Report</span>
          </div>
        </div>
        <div class="toolbar-right">
          <div class="filter-group">
            <label class="filter-label">Month</label>
            <select v-model="selectedMonth" class="filter-select">
              <option v-for="(m, i) in months" :key="i" :value="i">{{ m }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Year</label>
            <select v-model="selectedYear" class="filter-select">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">Category</label>
            <select v-model="categoryFilter" class="filter-select">
              <option value="">All</option>
              <option v-for="c in allCategories" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <button class="btn-print" @click="handlePrint">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save PDF
          </button>
        </div>
      </div>

      <!-- ── REPORT DOCUMENT ── -->
      <div class="report-doc" id="report-document">

        <!-- ── Doc Header ── -->
        <div class="doc-header">
          <div class="doc-header-left">
            <div class="doc-logo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2"/>
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
                <line x1="12" y1="12" x2="12" y2="16"/>
                <line x1="10" y1="14" x2="14" y2="14"/>
              </svg>
            </div>
            <div>
              <p class="doc-store">KSMS Store System</p>
              <h1 class="doc-title">Inventory Report</h1>
            </div>
          </div>
          <div class="doc-header-right">
            <div class="doc-meta-row">
              <span class="doc-meta-label">Period</span>
              <span class="doc-meta-val">{{ months[selectedMonth] }} {{ selectedYear }}</span>
            </div>
            <div class="doc-meta-row">
              <span class="doc-meta-label">Category</span>
              <span class="doc-meta-val">{{ categoryFilter || 'All Categories' }}</span>
            </div>
            <div class="doc-meta-row">
              <span class="doc-meta-label">Generated</span>
              <span class="doc-meta-val">{{ generatedAt }}</span>
            </div>
          </div>
        </div>

        <div class="doc-divider" />

        <!-- ── Summary Strip Row 1: Counts ── -->
        <div class="summary-block">
          <p class="summary-block-title">Overview</p>
          <div class="summary-strip">
            <div class="sum-item" v-for="s in overviewSummary" :key="s.label">
              <p class="sum-val" :style="`color:${s.color}`">{{ s.value }}</p>
              <p class="sum-label">{{ s.label }}</p>
            </div>
          </div>
        </div>

        <!-- ── Summary Strip Row 2: Financials ── -->
        <div class="summary-block">
          <p class="summary-block-title">Financials</p>
          <div class="summary-strip fin-strip">
            <div class="sum-item fin-item" v-for="s in financialSummary" :key="s.label">
              <p class="sum-val fin-val" :style="`color:${s.color}`">{{ s.value }}</p>
              <p class="sum-label">{{ s.label }}</p>
              <p class="sum-sub" v-if="s.sub">{{ s.sub }}</p>
            </div>
          </div>
        </div>

        <div class="doc-divider" />

        <!-- ── Chart ── -->
        <div class="chart-section">
          <div class="section-label">Stock vs Sold — {{ months[selectedMonth] }} {{ selectedYear }}</div>
          <div class="chart-area">
            <canvas ref="barChart" />
          </div>
        </div>

        <!-- ── Revenue Chart ── -->
        <div class="chart-section">
          <div class="section-label">Revenue vs Potential Revenue by Item (RM)</div>
          <div class="chart-area">
            <canvas ref="revenueChart" />
          </div>
        </div>

        <!-- ── Inventory Table ── -->
        <div class="table-section">
          <div class="section-label-row">
            <div class="section-label">Inventory Breakdown</div>
            <div class="search-wrap no-print">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input v-model="search" placeholder="Search…" class="search-input" />
            </div>
          </div>

          <table class="report-table">
            <thead>
              <tr>
                <th class="col-no">#</th>
                <th class="sortable" @click="sort('name')">
                  Inventory Name <span class="sort-arr" :class="sortBy==='name' ? sortDir : ''">↕</span>
                </th>
                <th class="sortable" @click="sort('category')">
                  Category <span class="sort-arr" :class="sortBy==='category' ? sortDir : ''">↕</span>
                </th>
                <th class="col-num sortable" @click="sort('price')">
                  Unit Price <span class="sort-arr" :class="sortBy==='price' ? sortDir : ''">↕</span>
                </th>
                <th class="col-num sortable" @click="sort('stock')">
                  Total Stock <span class="sort-arr" :class="sortBy==='stock' ? sortDir : ''">↕</span>
                </th>
                <th class="col-num sortable" @click="sort('sold')">
                  Qty Sold <span class="sort-arr" :class="sortBy==='sold' ? sortDir : ''">↕</span>
                </th>
                <th class="col-num">Remaining</th>
                <th class="col-num sortable" @click="sort('revenue')">
                  Revenue (RM) <span class="sort-arr" :class="sortBy==='revenue' ? sortDir : ''">↕</span>
                </th>
                <th class="col-num sortable" @click="sort('potentialRevenue')">
                  Potential Rev. <span class="sort-arr" :class="sortBy==='potentialRevenue' ? sortDir : ''">↕</span>
                </th>
                <th class="col-status">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, i) in sortedRows"
                :key="row.id"
                class="tr-data"
                :class="{ 'tr-zero': row.stock === 0 }"
              >
                <td class="col-no td-no">{{ i + 1 }}</td>
                <td class="td-name">{{ row.name }}</td>
                <td>
                  <span class="cat-pill" :style="`background:${catColor(row.category)}22; color:${catColor(row.category)}`">
                    {{ row.category }}
                  </span>
                </td>
                <td class="col-num td-mono">{{ fmt(row.price) }}</td>
                <td class="col-num td-mono">{{ row.stock }}</td>
                <td class="col-num td-mono td-sold">{{ row.sold }}</td>
                <td class="col-num td-mono td-remain">{{ row.remaining }}</td>
                <td class="col-num td-mono td-revenue">{{ fmt(row.revenue) }}</td>
                <td class="col-num td-mono td-potential">{{ fmt(row.potentialRevenue) }}</td>
                <td class="col-status">
                  <span class="status-pill" :class="statusClass(row)">{{ statusText(row) }}</span>
                </td>
              </tr>
              <tr v-if="sortedRows.length === 0">
                <td colspan="10" class="td-empty">No records found.</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="tr-total">
                <td colspan="4" class="td-total-label">Totals</td>
                <td class="col-num td-mono td-total-val">{{ totals.stock }}</td>
                <td class="col-num td-mono td-total-val">{{ totals.sold }}</td>
                <td class="col-num td-mono td-total-val">{{ totals.remaining }}</td>
                <td class="col-num td-mono td-total-revenue">{{ fmt(totals.revenue) }}</td>
                <td class="col-num td-mono td-total-potential">{{ fmt(totals.potentialRevenue) }}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- ── Category Breakdown ── -->
        <div class="cat-section">
          <div class="section-label">By Category</div>
          <div class="cat-grid">
            <div class="cat-card" v-for="(c, i) in categoryBreakdown" :key="c.name">
              <div class="cat-card-top">
                <span class="cat-dot" :style="`background:${donutColors[i % donutColors.length]}`" />
                <span class="cat-name">{{ c.name }}</span>
              </div>
              <div class="cat-stats">
                <div class="cat-stat">
                  <span class="cs-val">{{ c.stock }}</span>
                  <span class="cs-lbl">Stock</span>
                </div>
                <div class="cat-stat">
                  <span class="cs-val sold-color">{{ c.sold }}</span>
                  <span class="cs-lbl">Sold</span>
                </div>
                <div class="cat-stat">
                  <span class="cs-val">{{ c.items }}</span>
                  <span class="cs-lbl">Items</span>
                </div>
              </div>
              <div class="cat-fin-row">
                <div class="cat-fin-item">
                  <span class="cf-label">Revenue</span>
                  <span class="cf-val revenue-color">RM {{ fmtShort(c.revenue) }}</span>
                </div>
                <div class="cat-fin-item">
                  <span class="cf-label">Potential</span>
                  <span class="cf-val potential-color">RM {{ fmtShort(c.potentialRevenue) }}</span>
                </div>
              </div>
              <div class="cat-progress">
                <div
                  class="cat-prog-fill"
                  :style="`width:${c.soldPct}%; background:${donutColors[i % donutColors.length]}`"
                />
              </div>
              <p class="cat-pct-label">{{ c.soldPct }}% sell-through</p>
            </div>
          </div>
        </div>

        <!-- ── Doc Footer ── -->
        <div class="doc-footer">
          <span>KSMS Inventory Report · {{ months[selectedMonth] }} {{ selectedYear }}</span>
          <span>Generated {{ generatedAt }}</span>
        </div>

      </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import {
  Chart, BarController, BarElement, LinearScale,
  CategoryScale, Tooltip, Legend,
} from 'chart.js'

Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend)

// Hardcoded inventory data — price = selling price from variants.price
const INVENTORY = [
  { id:1,  name:'Milo Tin',           category:'Beverages',  stock:120, sold:42,  price:18.90 },
  { id:2,  name:'Nescafe 3in1',       category:'Beverages',  stock:95,  sold:58,  price:12.50 },
  { id:3,  name:'Mineral Water',      category:'Beverages',  stock:200, sold:140, price:1.50  },
  { id:4,  name:'Teh Tarik Powder',   category:'Beverages',  stock:60,  sold:22,  price:8.90  },
  { id:5,  name:'Basmati Rice 10kg',  category:'Dry Goods',  stock:48,  sold:18,  price:32.00 },
  { id:6,  name:'Sugar 1kg',          category:'Dry Goods',  stock:62,  sold:28,  price:3.20  },
  { id:7,  name:'Oats 500g',          category:'Dry Goods',  stock:40,  sold:12,  price:7.50  },
  { id:8,  name:'Cooking Oil 5L',     category:'Condiments', stock:0,   sold:6,   price:38.00 },
  { id:9,  name:'Chilli Sauce 340g',  category:'Condiments', stock:34,  sold:22,  price:4.50  },
  { id:10, name:'Soy Sauce 500ml',    category:'Condiments', stock:28,  sold:14,  price:3.80  },
  { id:11, name:'Latex Gloves M',     category:'Cleaning',   stock:15,  sold:10,  price:12.00 },
  { id:12, name:'Dishwash Liquid',    category:'Cleaning',   stock:0,   sold:4,   price:5.90  },
  { id:13, name:'Floor Cleaner 1L',   category:'Cleaning',   stock:22,  sold:8,   price:9.90  },
  { id:14, name:'Frozen Chicken',     category:'Frozen',     stock:22,  sold:35,  price:22.00 },
  { id:15, name:'Frozen Fish Fillet', category:'Frozen',     stock:18,  sold:20,  price:15.00 },
]

const CAT_COLORS = {
  'Beverages':  '#6366f1',
  'Dry Goods':  '#f59e0b',
  'Condiments': '#10b981',
  'Cleaning':   '#ef4444',
  'Frozen':     '#06b6d4',
}

export default {
  name: 'AdminInventoryReport',
  components: { AdminSidebar },

  data() {
    const now = new Date()
    const years = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) years.push(y)

    return {
      months: ['January','February','March','April','May','June','July','August','September','October','November','December'],
      years,
      selectedMonth: now.getMonth(),
      selectedYear:  now.getFullYear(),
      categoryFilter: '',
      search: '',
      sortBy: 'name',
      sortDir: 'asc',
      donutColors: ['#6366f1','#f59e0b','#10b981','#ef4444','#06b6d4'],
      rows: INVENTORY,
      generatedAt: now.toLocaleString('en-MY', {
        day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit',
      }),
    }
  },

  computed: {
    allCategories() {
      return [...new Set(this.rows.map(r => r.category))].sort()
    },

    // Enrich each row with computed financial fields
    enrichedRows() {
      return this.rows.map(r => ({
        ...r,
        remaining:        Math.max(0, r.stock - r.sold),
        revenue:          parseFloat((r.price * r.sold).toFixed(2)),
        potentialRevenue: parseFloat((r.price * Math.max(0, r.stock - r.sold)).toFixed(2)),
      }))
    },

    filteredRows() {
      return this.enrichedRows.filter(r => {
        const matchSearch = !this.search ||
          r.name.toLowerCase().includes(this.search.toLowerCase()) ||
          r.category.toLowerCase().includes(this.search.toLowerCase())
        const matchCat = !this.categoryFilter || r.category === this.categoryFilter
        return matchSearch && matchCat
      })
    },

    sortedRows() {
      const dir = this.sortDir === 'asc' ? 1 : -1
      return [...this.filteredRows].sort((a, b) => {
        const av = a[this.sortBy]; const bv = b[this.sortBy]
        return typeof av === 'string' ? av.localeCompare(bv) * dir : (av - bv) * dir
      })
    },

    totals() {
      const r = this.sortedRows
      return {
        stock:            r.reduce((s, x) => s + x.stock, 0),
        sold:             r.reduce((s, x) => s + x.sold,  0),
        remaining:        r.reduce((s, x) => s + x.remaining, 0),
        revenue:          parseFloat(r.reduce((s, x) => s + x.revenue, 0).toFixed(2)),
        potentialRevenue: parseFloat(r.reduce((s, x) => s + x.potentialRevenue, 0).toFixed(2)),
      }
    },

    overviewSummary() {
      const f = this.filteredRows
      const totalStock = f.reduce((s, r) => s + r.stock, 0)
      const totalSold  = f.reduce((s, r) => s + r.sold,  0)
      const outOfStock = f.filter(r => r.stock === 0).length
      const sellThrough = (totalStock + totalSold) > 0
        ? Math.round((totalSold / (totalStock + totalSold)) * 100) : 0
      return [
        { label: 'Total Items',       value: f.length,                  color: '#6366f1' },
        { label: 'Total Stock Units', value: totalStock.toLocaleString(), color: '#0f172a' },
        { label: 'Total Units Sold',  value: totalSold.toLocaleString(),  color: '#10b981' },
        { label: 'Out of Stock',      value: outOfStock,                  color: '#ef4444' },
        { label: 'Sell-Through Rate', value: sellThrough + '%',           color: '#f59e0b' },
      ]
    },

    financialSummary() {
      const t = this.totals
      const combined = t.revenue + t.potentialRevenue
      const realisedPct = combined > 0 ? Math.round((t.revenue / combined) * 100) : 0
      return [
        {
          label: 'Total Revenue Earned',
          value: 'RM ' + t.revenue.toLocaleString('en-MY', { minimumFractionDigits: 2 }),
          sub:   'From qty sold × unit price',
          color: '#10b981',
        },
        {
          label: 'Total Potential Revenue',
          value: 'RM ' + t.potentialRevenue.toLocaleString('en-MY', { minimumFractionDigits: 2 }),
          sub:   'From remaining stock × unit price',
          color: '#6366f1',
        },
        {
          label: 'Combined (Sold + Remaining)',
          value: 'RM ' + combined.toLocaleString('en-MY', { minimumFractionDigits: 2 }),
          sub:   `${realisedPct}% already realised`,
          color: '#0f172a',
        },
      ]
    },

    categoryBreakdown() {
      const map = {}
      this.filteredRows.forEach(r => {
        if (!map[r.category]) {
          map[r.category] = { name: r.category, stock: 0, sold: 0, items: 0, revenue: 0, potentialRevenue: 0 }
        }
        map[r.category].stock            += r.stock
        map[r.category].sold             += r.sold
        map[r.category].items            += 1
        map[r.category].revenue          += r.revenue
        map[r.category].potentialRevenue += r.potentialRevenue
      })
      return Object.values(map).map(c => ({
        ...c,
        revenue:          parseFloat(c.revenue.toFixed(2)),
        potentialRevenue: parseFloat(c.potentialRevenue.toFixed(2)),
        soldPct: (c.stock + c.sold) > 0
          ? Math.round((c.sold / (c.stock + c.sold)) * 100) : 0,
      })).sort((a, b) => b.revenue - a.revenue)
    },

    barChartData() {
      const top = [...this.filteredRows].sort((a, b) => b.stock - a.stock).slice(0, 10)
      return {
        labels: top.map(r => r.name.length > 14 ? r.name.slice(0, 13) + '…' : r.name),
        stock:  top.map(r => r.stock),
        sold:   top.map(r => r.sold),
      }
    },

    revenueChartData() {
      const top = [...this.filteredRows].sort((a, b) => b.revenue - a.revenue).slice(0, 10)
      return {
        labels:    top.map(r => r.name.length > 14 ? r.name.slice(0, 13) + '…' : r.name),
        revenue:   top.map(r => r.revenue),
        potential: top.map(r => r.potentialRevenue),
      }
    },
  },

  watch: {
    selectedMonth()  { this.$nextTick(() => { this.rebuildBarChart(); this.rebuildRevenueChart() }) },
    selectedYear()   { this.$nextTick(() => { this.rebuildBarChart(); this.rebuildRevenueChart() }) },
    categoryFilter() { this.$nextTick(() => { this.rebuildBarChart(); this.rebuildRevenueChart() }) },
  },

  mounted() {
    this.$nextTick(() => {
      this.initBarChart()
      this.initRevenueChart()
    })
  },

  beforeUnmount() {
    this._barChart?.destroy()
    this._revenueChart?.destroy()
  },

  methods: {
    sort(col) {
      this.sortBy === col
        ? (this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc')
        : ((this.sortBy = col), (this.sortDir = ['name','category'].includes(col) ? 'asc' : 'desc'))
    },

    catColor(cat) { return CAT_COLORS[cat] || '#6366f1' },

    statusClass(row) {
      if (row.stock === 0)      return 'status-out'
      if (row.stock <= 5)       return 'status-low'
      if (row.sold > row.stock) return 'status-high'
      return 'status-ok'
    },
    statusText(row) {
      if (row.stock === 0)      return 'Out of Stock'
      if (row.stock <= 5)       return 'Low Stock'
      if (row.sold > row.stock) return 'High Turnover'
      return 'Adequate'
    },

    fmt(val) {
      return val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    fmtShort(val) {
      if (val >= 1000) return (val / 1000).toFixed(1) + 'k'
      return val.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    initBarChart() {
      const ctx = this.$refs.barChart?.getContext('2d')
      if (!ctx) return
      const d = this.barChartData
      this._barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [
            {
              label: 'Total Stock',
              data: d.stock,
              backgroundColor: 'rgba(99,102,241,0.15)',
              borderColor: '#6366f1',
              borderWidth: 1.5,
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Qty Sold',
              data: d.sold,
              backgroundColor: 'rgba(16,185,129,0.8)',
              borderColor: 'transparent',
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
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
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 11 }, stepSize: 20 }, beginAtZero: true },
          },
        },
      })
    },

    rebuildBarChart() {
      if (!this._barChart) return
      const d = this.barChartData
      this._barChart.data.labels = d.labels
      this._barChart.data.datasets[0].data = d.stock
      this._barChart.data.datasets[1].data = d.sold
      this._barChart.update()
    },

    initRevenueChart() {
      const ctx = this.$refs.revenueChart?.getContext('2d')
      if (!ctx) return
      const d = this.revenueChartData
      this._revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: d.labels,
          datasets: [
            {
              label: 'Revenue Earned (RM)',
              data: d.revenue,
              backgroundColor: 'rgba(16,185,129,0.8)',
              borderColor: 'transparent',
              borderRadius: 4,
              borderSkipped: false,
            },
            {
              label: 'Potential Revenue (RM)',
              data: d.potential,
              backgroundColor: 'rgba(99,102,241,0.15)',
              borderColor: '#6366f1',
              borderWidth: 1.5,
              borderRadius: 4,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true, position: 'top', align: 'end',
              labels: { boxWidth: 10, boxHeight: 10, borderRadius: 3, font: { family: 'DM Sans', size: 12 }, color: '#64748b', padding: 16 },
            },
            tooltip: {
              mode: 'index', intersect: false,
              callbacks: {
                label: ctx => ` ${ctx.dataset.label}: RM ${ctx.parsed.y.toFixed(2)}`,
              },
            },
          },
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

    rebuildRevenueChart() {
      if (!this._revenueChart) return
      const d = this.revenueChartData
      this._revenueChart.data.labels = d.labels
      this._revenueChart.data.datasets[0].data = d.revenue
      this._revenueChart.data.datasets[1].data = d.potential
      this._revenueChart.update()
    },

    handlePrint() {
      window.print()
    },
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex;
  min-height: 100vh;
  background: #eef0f5;
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
}

.report-main {
  flex: 1;
  padding: 28px 32px 60px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-x: hidden;
}

/* ── Toolbar ── */
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.bc-root    { color: #94a3b8; }
.bc-current { color: #1e293b; font-weight: 500; }
.breadcrumb svg { color: #cbd5e1; }

.toolbar-right { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }

.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-label {
  font-size: 11px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #dde1e9; border-radius: 8px;
  background: #fff; font-size: 13px;
  font-family: 'DM Sans', sans-serif; color: #334155;
  outline: none; cursor: pointer;
  transition: border-color .15s; min-width: 110px;
}
.filter-select:focus { border-color: #6366f1; }

.btn-print {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 18px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s; align-self: flex-end;
}
.btn-print:hover { background: #4f46e5; }

/* ── Report Document ── */
.report-doc {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,.06), 0 1px 3px rgba(0,0,0,.04);
  padding: 40px 44px;
  display: flex; flex-direction: column; gap: 28px;
}

/* Doc Header */
.doc-header { display: flex; justify-content: space-between; align-items: flex-start; }
.doc-header-left { display: flex; align-items: center; gap: 16px; }
.doc-logo {
  width: 46px; height: 46px; border-radius: 12px;
  background: #eef2ff; display: flex; align-items: center; justify-content: center;
  color: #6366f1; flex-shrink: 0;
}
.doc-store { font-size: 11.5px; color: #94a3b8; font-weight: 500; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .06em; }
.doc-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.doc-header-right { text-align: right; display: flex; flex-direction: column; gap: 5px; }
.doc-meta-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 10px; }
.doc-meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; min-width: 64px; text-align: right; }
.doc-meta-val   { font-size: 13px; color: #334155; font-weight: 500; }

.doc-divider { height: 1px; background: #f1f5f9; }

/* Summary blocks */
.summary-block { display: flex; flex-direction: column; gap: 10px; }
.summary-block-title {
  font-size: 11px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
}
.summary-strip {
  display: flex;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}
.sum-item {
  flex: 1; padding: 16px 20px;
  border-right: 1px solid #f1f5f9;
  transition: background .12s;
}
.sum-item:last-child { border-right: none; }
.sum-item:hover { background: #fafbfc; }
.sum-val  { font-size: 22px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 3px; }
.sum-label{ font-size: 11.5px; color: #94a3b8; font-weight: 500; }

.fin-strip { background: #fafbfc; }
.fin-item  { }
.fin-val   { font-size: 18px !important; font-family: 'DM Mono', monospace; }
.sum-sub   { font-size: 11px; color: #cbd5e1; margin-top: 4px; }

/* Section labels */
.section-label {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
  margin-bottom: 14px;
}
.section-label-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
}
.section-label-row .section-label { margin-bottom: 0; }

/* Charts */
.chart-area { height: 220px; position: relative; }

/* Search */
.search-wrap {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px; border: 1px solid #e2e8f0;
  border-radius: 7px; background: #f8fafc;
  transition: border-color .15s;
}
.search-wrap:focus-within { border-color: #6366f1; }
.search-wrap svg { color: #94a3b8; flex-shrink: 0; }
.search-input {
  border: none; background: transparent; outline: none;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  color: #1e293b; width: 170px;
}
.search-input::placeholder { color: #cbd5e1; }

/* Table */
.report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.report-table thead tr { border-bottom: 2px solid #f1f5f9; }
.report-table thead th {
  padding: 9px 10px; text-align: left;
  font-size: 10.5px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em; white-space: nowrap;
}
.report-table thead th.sortable { cursor: pointer; }
.report-table thead th.sortable:hover { color: #6366f1; }

.sort-arr { font-size: 10px; color: #dde1e9; margin-left: 3px; }
.sort-arr.asc, .sort-arr.desc { color: #6366f1; }

.col-no     { width: 32px; }
.col-num    { text-align: right !important; }
.col-status { width: 120px; }

.tr-data { transition: background .1s; }
.tr-data:hover td { background: #fafbff; }
.tr-zero { opacity: .65; }

.report-table tbody td {
  padding: 10px 10px; border-bottom: 1px solid #f8fafc;
  color: #334155; vertical-align: middle;
}
.report-table tbody tr:last-child td { border-bottom: none; }

.td-no        { color: #cbd5e1 !important; font-family: 'DM Mono', monospace; font-size: 11.5px; }
.td-name      { font-weight: 500; color: #1e293b; }
.td-mono      { font-family: 'DM Mono', monospace; font-size: 12.5px; text-align: right; color: #334155; }
.td-sold      { color: #10b981 !important; font-weight: 600; }
.td-remain    { color: #6366f1 !important; font-weight: 600; }
.td-revenue   { color: #10b981 !important; font-weight: 600; }
.td-potential { color: #6366f1 !important; font-weight: 500; }
.td-empty     { text-align: center; padding: 36px !important; color: #cbd5e1; font-size: 14px; }

.cat-pill {
  display: inline-block; padding: 3px 8px; border-radius: 5px;
  font-size: 11px; font-weight: 600;
}
.status-pill {
  display: inline-block; padding: 3px 9px; border-radius: 5px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.status-ok   { background: #f0fdf4; color: #15803d; }
.status-low  { background: #fffbeb; color: #b45309; }
.status-out  { background: #fef2f2; color: #dc2626; }
.status-high { background: #eef2ff; color: #4f46e5; }

.tr-total td {
  padding: 12px 10px; border-top: 2px solid #f1f5f9; font-weight: 700;
}
.td-total-label    { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.td-total-val      { font-family: 'DM Mono', monospace; color: #0f172a; font-size: 12.5px; }
.td-total-revenue  { font-family: 'DM Mono', monospace; color: #10b981; font-size: 12.5px; font-weight: 700; }
.td-total-potential{ font-family: 'DM Mono', monospace; color: #6366f1; font-size: 12.5px; font-weight: 700; }

/* Category breakdown */
.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.cat-card {
  border: 1px solid #f1f5f9; border-radius: 10px;
  padding: 14px 16px; background: #fafbfc;
  transition: box-shadow .15s;
}
.cat-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.06); }
.cat-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.cat-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cat-name { font-size: 13px; font-weight: 600; color: #1e293b; }
.cat-stats { display: flex; gap: 14px; margin-bottom: 10px; }
.cat-stat  { display: flex; flex-direction: column; gap: 2px; }
.cs-val    { font-size: 15px; font-weight: 700; color: #1e293b; font-family: 'DM Mono', monospace; }
.cs-val.sold-color { color: #10b981; }
.cs-lbl    { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }

.cat-fin-row   { display: flex; gap: 10px; margin-bottom: 10px; }
.cat-fin-item  { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.cf-label      { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
.cf-val        { font-size: 12px; font-weight: 700; font-family: 'DM Mono', monospace; }
.revenue-color  { color: #10b981; }
.potential-color{ color: #6366f1; }

.cat-progress { height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; margin-bottom: 5px; }
.cat-prog-fill { height: 100%; border-radius: 99px; transition: width .5s ease; }
.cat-pct-label { font-size: 11px; color: #94a3b8; }

/* Doc footer */
.doc-footer {
  display: flex; justify-content: space-between;
  padding-top: 8px; border-top: 1px solid #f1f5f9;
  font-size: 11.5px; color: #cbd5e1;
}

/* ─── PRINT STYLES ──────────────────────────────────────────── */
@media print {
  @page { size: A4; margin: 16mm 14mm; }

  .no-print { display: none !important; }

  .app-layout {
    display: block !important;
    background: #fff !important;
    min-height: unset !important;
  }
  .report-main { padding: 0 !important; gap: 0 !important; }
  .report-doc  {
    box-shadow: none !important; border-radius: 0 !important;
    padding: 0 !important; gap: 16pt !important;
  }

  .doc-title  { font-size: 16pt !important; }
  .doc-store  { font-size: 8pt !important; }
  .sum-val    { font-size: 14pt !important; }
  .fin-val    { font-size: 12pt !important; }
  .sum-label  { font-size: 8pt !important; }
  .sum-sub    { font-size: 7.5pt !important; }

  .chart-area { height: 140px !important; }

  .report-table           { font-size: 8.5pt !important; }
  .report-table thead th  { font-size: 7pt !important; padding: 5px 6px !important; }
  .report-table tbody td  { padding: 5px 6px !important; }
  .report-table tfoot td  { padding: 7px 6px !important; }

  .cat-grid {
    grid-template-columns: repeat(3, 1fr) !important;
    gap: 7pt !important;
  }
  .cat-card  { padding: 9px 11px !important; break-inside: avoid; }
  .cs-val    { font-size: 11pt !important; }
  .cf-val    { font-size: 9pt !important; }

  .tr-data        { break-inside: avoid; }
  .table-section  { break-inside: avoid; }
  .tr-data:hover td { background: transparent !important; }
  .doc-footer     { color: #999 !important; font-size: 7.5pt !important; }

  .status-pill, .cat-pill {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}

/* ── Responsive ── */
@media (max-width: 1200px) {
  .report-doc { padding: 28px; }
  .summary-strip { flex-wrap: wrap; }
  .sum-item { min-width: 130px; }
}
@media (max-width: 768px) {
  .report-main { padding: 16px 14px 40px; }
  .report-doc  { padding: 20px 16px; }
  .doc-header  { flex-direction: column; gap: 16px; }
  .doc-header-right { text-align: left; }
  .doc-meta-row { justify-content: flex-start; }
  .fin-strip   { flex-direction: column; }
}
</style>