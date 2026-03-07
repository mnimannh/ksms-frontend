<template>
  <div class="app-layout">
    <AdminSidebar class="no-print" />

    <main class="report-main">

      <!-- Toolbar -->
      <ReportToolbar
        v-model:selectedMonth="selectedMonth"
        v-model:selectedYear="selectedYear"
        v-model:categoryFilter="categoryFilter"
        :months="months"
        :years="years"
        :categories="allCategories"
        :generated="generated"
        @generate="generateReport"
        @print="handlePrint"
        class="no-print"
      />

      <!-- Empty state before first generate -->
      <div v-if="!generated" class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="2" y="7" width="20" height="14" rx="2"/>
            <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
            <line x1="12" y1="12" x2="12" y2="16"/>
            <line x1="10" y1="14" x2="14" y2="14"/>
          </svg>
        </div>
        <p class="empty-title">No report generated yet</p>
        <p class="empty-sub">Select a month, year and category above, then click <strong>Generate Report</strong>.</p>
      </div>

      <!-- Report Document -->
      <div v-else class="report-doc" id="report-document">

        <!-- Doc Header -->
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
              <span class="meta-label">Period</span>
              <span class="meta-val">{{ periodLabel }}</span>
            </div>
            <div class="doc-meta-row">
              <span class="meta-label">Category</span>
              <span class="meta-val">{{ categoryFilter || 'All Categories' }}</span>
            </div>
            <div class="doc-meta-row">
              <span class="meta-label">Generated</span>
              <span class="meta-val">{{ generatedAt }}</span>
            </div>
          </div>
        </div>

        <div class="doc-divider" />

        <!-- Summary -->
        <ReportSummary
          :overview="overviewSummary"
          :financials="financialSummary"
        />

        <div class="doc-divider" />

        <!-- Charts -->
        <ReportCharts
          :period-label="periodLabel"
          :rows="enrichedRows"
        />

        <!-- Table -->
        <ReportTable :rows="enrichedRows" />

        <!-- Category Breakdown + Footer -->
        <ReportCategories
          :breakdown="categoryBreakdown"
          :period-label="periodLabel"
          :generated-at="generatedAt"
        />

      </div>

    </main>
  </div>
</template>

<script>
import AdminSidebar       from '@/components/sidebar/AdminSidebar.vue'
import ReportToolbar      from '@/components/admin-inventoryreport/ReportToolbar.vue'
import ReportSummary      from '@/components/admin-inventoryreport/ReportSummary.vue'
import ReportCharts       from '@/components/admin-inventoryreport/ReportCharts.vue'
import ReportTable        from '@/components/admin-inventoryreport/ReportTable.vue'
import ReportCategories   from '@/components/admin-inventoryreport/ReportCategories.vue'

// ── Hardcoded data (replace with API call later) ──────────────────────────────
// price = variants.price (selling price to customer)
// stock = variants.quantity (current stock on hand)
// sold  = sum of order_items.quantity for this period
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

export default {
  name: 'AdminInventoryReport',
  components: { AdminSidebar, ReportToolbar, ReportSummary, ReportCharts, ReportTable, ReportCategories },

  data() {
    const now = new Date()
    const years = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) years.push(y)

    return {
      // Filter state (not yet applied until Generate is clicked)
      selectedMonth:  now.getMonth(),
      selectedYear:   now.getFullYear(),
      categoryFilter: '',

      // Applied snapshot (set on Generate click)
      appliedMonth:    null,
      appliedYear:     null,
      appliedCategory: null,

      generated:   false,
      generatedAt: '',

      months: [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December',
      ],
      years,
      rawInventory: INVENTORY,
    }
  },

  computed: {
    allCategories() {
      return [...new Set(this.rawInventory.map(r => r.category))].sort()
    },

    periodLabel() {
      if (this.appliedMonth === null) return ''
      return `${this.months[this.appliedMonth]} ${this.appliedYear}`
    },

    // Rows filtered by applied (generated) state, not live filter state
    filteredRows() {
      if (!this.generated) return []
      return this.rawInventory.filter(r =>
        !this.appliedCategory || r.category === this.appliedCategory
      )
    },

    // Enriched with computed financial fields
    // potentialRevenue = stock × price (stock is already current remaining qty)
    enrichedRows() {
      return this.filteredRows.map(r => ({
        ...r,
        remaining:        r.stock,
        revenue:          parseFloat((r.price * r.sold).toFixed(2)),
        potentialRevenue: parseFloat((r.price * r.stock).toFixed(2)),
      }))
    },

    totals() {
      const r = this.enrichedRows
      return {
        stock:            r.reduce((s, x) => s + x.stock, 0),
        sold:             r.reduce((s, x) => s + x.sold, 0),
        remaining:        r.reduce((s, x) => s + x.remaining, 0),
        revenue:          parseFloat(r.reduce((s, x) => s + x.revenue, 0).toFixed(2)),
        potentialRevenue: parseFloat(r.reduce((s, x) => s + x.potentialRevenue, 0).toFixed(2)),
      }
    },

    overviewSummary() {
      const r = this.enrichedRows
      const totalStock  = r.reduce((s, x) => s + x.stock, 0)
      const totalSold   = r.reduce((s, x) => s + x.sold, 0)
      const outOfStock  = r.filter(x => x.stock === 0).length
      const sellThrough = (totalStock + totalSold) > 0
        ? Math.round((totalSold / (totalStock + totalSold)) * 100) : 0

      return [
        { label: 'Total Items',       value: r.length,                   color: '#6366f1' },
        { label: 'Total Stock Units', value: totalStock.toLocaleString(), color: '#0f172a' },
        { label: 'Total Units Sold',  value: totalSold.toLocaleString(),  color: '#10b981' },
        { label: 'Out of Stock',      value: outOfStock,                  color: '#ef4444' },
        { label: 'Sell-Through Rate', value: sellThrough + '%',           color: '#f59e0b' },
      ]
    },

    financialSummary() {
      const t = this.totals
      const combined = parseFloat((t.revenue + t.potentialRevenue).toFixed(2))
      const realisedPct = combined > 0 ? Math.round((t.revenue / combined) * 100) : 0
      const fmtRM = v => 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })

      return [
        {
          label: 'Revenue Earned',
          value: fmtRM(t.revenue),
          sub:   'Selling price × qty sold',
          color: '#10b981',
        },
        {
          label: 'Potential Revenue',
          value: fmtRM(t.potentialRevenue),
          sub:   'Selling price × current stock',
          color: '#6366f1',
        },
        {
          label: 'Combined Value',
          value: fmtRM(combined),
          sub:   `${realisedPct}% already realised`,
          color: '#0f172a',
        },
      ]
    },

    categoryBreakdown() {
      const map = {}
      this.enrichedRows.forEach(r => {
        if (!map[r.category]) {
          map[r.category] = { name: r.category, stock: 0, sold: 0, remaining: 0, items: 0, revenue: 0, potentialRevenue: 0 }
        }
        map[r.category].stock            += r.stock
        map[r.category].sold             += r.sold
        map[r.category].remaining        += r.remaining
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
  },

  methods: {
    generateReport() {
      // Snapshot the selected filters as the applied state
      this.appliedMonth    = this.selectedMonth
      this.appliedYear     = this.selectedYear
      this.appliedCategory = this.categoryFilter
      this.generatedAt     = new Date().toLocaleString('en-MY', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
      this.generated = true
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

/* ── Empty state ── */
.empty-state {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 12px; padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px dashed #e2e8f0;
  text-align: center;
}
.empty-icon {
  width: 64px; height: 64px; border-radius: 16px;
  background: #eef2ff;
  display: flex; align-items: center; justify-content: center;
  color: #6366f1; margin-bottom: 4px;
}
.empty-title { font-size: 16px; font-weight: 600; color: #1e293b; }
.empty-sub   { font-size: 13.5px; color: #94a3b8; max-width: 340px; line-height: 1.6; }
.empty-sub strong { color: #6366f1; }

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
.doc-store { font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; letter-spacing: .06em; }
.doc-title { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.025em; }
.doc-header-right { display: flex; flex-direction: column; gap: 5px; text-align: right; }
.doc-meta-row { display: flex; align-items: baseline; justify-content: flex-end; gap: 10px; }
.meta-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; min-width: 64px; text-align: right; }
.meta-val   { font-size: 13px; color: #334155; font-weight: 500; }

.doc-divider { height: 1px; background: #f1f5f9; }

/* ── Print ── */
@media print {
  @page { size: A4; margin: 16mm 14mm; }

  .no-print { display: none !important; }

  .app-layout  { display: block !important; background: #fff !important; }
  .report-main { padding: 0 !important; gap: 0 !important; }

  .report-doc {
    box-shadow: none !important;
    border-radius: 0 !important;
    padding: 0 !important;
    gap: 16pt !important;
  }

  .doc-title { font-size: 16pt !important; }
  .doc-store { font-size: 8pt !important; }
  .meta-val  { font-size: 9pt !important; }
  .meta-label{ font-size: 8pt !important; }
}

/* ── Responsive ── */
@media (max-width: 1100px) {
  .report-doc { padding: 28px; }
}
@media (max-width: 768px) {
  .report-main { padding: 16px 14px 40px; }
  .report-doc  { padding: 20px 16px; }
  .doc-header  { flex-direction: column; gap: 16px; }
  .doc-header-right { text-align: left; }
  .doc-meta-row { justify-content: flex-start; }
}
</style>