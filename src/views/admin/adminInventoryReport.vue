<template>
  <div class="app-layout">
    <AdminSidebar class="no-print" />

    <main class="report-main">

      <!-- Toolbar -->
      <ReportToolbar
        v-model:selectedMonth="selectedMonth"
        v-model:selectedYear="selectedYear"
        v-model:categoryFilter="categoryFilter"
        v-model:categoryId="categoryId"
        :months="months"
        :years="years"
        :categories="allCategories"
        :generated="generated"
        :loading="loading"
        @generate="generateReport"
        @print="handlePrint"
        class="no-print"
      />

      <!-- Error state -->
      <div v-if="error" class="error-state">
        <div class="error-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p class="error-title">Failed to generate report</p>
        <p class="error-sub">{{ error }}</p>
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="loading-state">
        <div class="loading-spinner" />
        <p class="loading-text">Generating report…</p>
      </div>

      <!-- Empty state before first generate -->
      <div v-else-if="!generated" class="empty-state">
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
              <p class="doc-store">KSMS</p>
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
          :profits="profitSummary"
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
import axios from 'axios'
import API_BASE_URL from '@/services/api'

import AdminSidebar     from '@/components/sidebar/AdminSidebar.vue'
import ReportToolbar    from '@/components/admin-inventoryreport/ReportToolbar.vue'
import ReportSummary    from '@/components/admin-inventoryreport/ReportSummary.vue'
import ReportCharts     from '@/components/admin-inventoryreport/ReportCharts.vue'
import ReportTable      from '@/components/admin-inventoryreport/ReportTable.vue'
import ReportCategories from '@/components/admin-inventoryreport/ReportCategories.vue'

export default {
  name: 'AdminInventoryReport',
  components: { AdminSidebar, ReportToolbar, ReportSummary, ReportCharts, ReportTable, ReportCategories },

  data() {
    const now = new Date()
    const years = []
    for (let y = now.getFullYear(); y >= now.getFullYear() - 4; y--) years.push(y)

    return {
      // Toolbar filter state (live, not applied until Generate is clicked)
      selectedMonth:  now.getMonth(),       // 0-based for months array index
      selectedYear:   now.getFullYear(),
      categoryFilter: '',                   // category name string (for display)
      categoryId:     '',                   // category id (sent to API)

      // Applied snapshot — set on Generate click, used for labels
      appliedMonth:    null,
      appliedYear:     null,
      appliedCategory: null,

      // UI state
      generated:   false,
      loading:     false,
      error:       null,
      generatedAt: '',

      // Static data
      months: [
        'January','February','March','April','May','June',
        'July','August','September','October','November','December',
      ],
      years,

      // API data
      allCategories: [],   // [{ id, name }] — loaded on mount
      apiRows:       [],   // enriched rows from API
      apiSummary:    null, // { overview, financials }
      apiBreakdown:  [],   // category breakdown from API
    }
  },

  computed: {
    periodLabel() {
      if (this.appliedMonth === null) return ''
      return `${this.months[this.appliedMonth]} ${this.appliedYear}`
    },

    // Use API rows directly — already enriched by the backend
    enrichedRows() {
      return this.apiRows
    },

    // ── Summary cards ──────────────────────────────────────────────────────────
    // Mirror the shape the ReportSummary component expects,
    // built from the backend summary payload.
    overviewSummary() {
      if (!this.apiSummary) return []
      const o = this.apiSummary.overview
      return [
        { label: 'Total Items',       value: o.totalItems,                      color: '#6366f1' },
        { label: 'Total Stock Units', value: o.totalStock.toLocaleString(),      color: '#0f172a' },
        { label: 'Total Units Sold',  value: o.totalSold.toLocaleString(),       color: '#10b981' },
        { label: 'Out of Stock',      value: o.outOfStock,                       color: '#ef4444' },
        { label: 'Sell-Through Rate', value: o.sellThroughPct + '%',             color: '#f59e0b' },
      ]
    },

    financialSummary() {
      if (!this.apiSummary) return []
      const f = this.apiSummary.financials
      const fmtRM = v => 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })
      return [
        { label: 'Revenue Earned',    value: fmtRM(f.revenue),          sub: 'Sell price × qty sold',     color: '#10b981' },
        { label: 'Potential Revenue', value: fmtRM(f.potentialRevenue), sub: 'Sell price × current stock', color: '#6366f1' },
        { label: 'Combined Value',    value: fmtRM(f.combined),         sub: `${f.realisedPct}% realised`, color: '#0f172a' },
      ]
    },

    profitSummary() {
      if (!this.apiSummary?.profits) return []
      const p = this.apiSummary.profits
      const fmtRM = v => 'RM ' + Number(v).toLocaleString('en-MY', { minimumFractionDigits: 2 })
      return [
        { label: 'Total COGS',       value: fmtRM(p.totalCogs),           sub: 'Cost price × qty sold',            color: '#ef4444' },
        { label: 'Gross Profit',     value: fmtRM(p.totalGrossProfit),     sub: 'Revenue − COGS',                   color: '#10b981' },
        { label: 'Profit Margin',    value: p.overallMarginPct + '%',      sub: 'Gross profit ÷ revenue',           color: '#6366f1' },
        { label: 'Stock at Cost',    value: fmtRM(p.totalStockValueCost),  sub: 'Cost price × current stock',       color: '#f59e0b' },
        { label: 'Best Margin',      value: p.bestMargin  ? p.bestMargin.marginPct  + '%' : '—', sub: p.bestMargin?.name  || '', color: '#10b981' },
        { label: 'Worst Margin',     value: p.worstMargin ? p.worstMargin.marginPct + '%' : '—', sub: p.worstMargin?.name || '', color: '#ef4444' },
      ]
    },

    // Already computed by backend, just pass through
    categoryBreakdown() {
      return this.apiBreakdown
    },
  },

  async mounted() {
    await this.fetchCategories()
  },

  methods: {
    // ── Load categories for toolbar dropdown ───────────────────────────────────
    async fetchCategories() {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/reports/inventory/categories`)
        // data.data = [{ id, name }]
        // Prepend an "All Categories" option so the toolbar can show it
        this.allCategories = [{ id: null, name: '' }, ...data.data]
      } catch (err) {
        console.error('[InventoryReport] fetchCategories error:', err)
        // Non-fatal — toolbar just shows no categories
      }
    },

    // ── Generate report ────────────────────────────────────────────────────────
    async generateReport() {
      this.loading = true
      this.error   = null
      this.generated = false

      // Snapshot applied filters for labels
      this.appliedMonth    = this.selectedMonth
      this.appliedYear     = this.selectedYear
      this.appliedCategory = this.categoryFilter

      try {
        // month sent to API is 1-based
        const params = {
          year:  this.selectedYear,
          month: this.selectedMonth + 1,
        }
        if (this.categoryId) params.categoryId = this.categoryId

        const { data } = await axios.get(`${API_BASE_URL}/api/reports/inventory`, { params })

        // Populate reactive data from API response
        this.apiRows     = data.data.rows
        this.apiSummary  = data.data.summary
        this.apiBreakdown = data.data.categoryBreakdown

        // Format generatedAt from ISO string returned by API
        this.generatedAt = new Date(data.meta.generatedAt).toLocaleString('en-MY', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })

        this.generated = true
      } catch (err) {
        console.error('[InventoryReport] generateReport error:', err)
        this.error = err.response?.data?.message || 'Something went wrong. Please try again.'
      } finally {
        this.loading = false
      }
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

/* ── Loading state ── */
.loading-state {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 16px; padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}
.loading-spinner {
  width: 36px; height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.loading-text { font-size: 14px; color: #94a3b8; font-weight: 500; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Error state ── */
.error-state {
  flex: 1;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 10px; padding: 80px 20px;
  background: #fff;
  border-radius: 16px;
  border: 1px dashed #fecaca;
  text-align: center;
}
.error-icon {
  width: 56px; height: 56px; border-radius: 14px;
  background: #fef2f2;
  display: flex; align-items: center; justify-content: center;
  color: #ef4444; margin-bottom: 4px;
}
.error-title { font-size: 15px; font-weight: 600; color: #1e293b; }
.error-sub   { font-size: 13px; color: #94a3b8; max-width: 360px; line-height: 1.6; }

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
@media (max-width: 1100px) { .report-doc { padding: 28px; } }
@media (max-width: 768px) {
  .report-main { padding: 16px 14px 40px; }
  .report-doc  { padding: 20px 16px; }
  .doc-header  { flex-direction: column; gap: 16px; }
  .doc-header-right { text-align: left; }
  .doc-meta-row { justify-content: flex-start; }
}
</style>