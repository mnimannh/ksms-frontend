<template>
  <div class="table-section">

    <div class="section-header">
      <p class="section-title">Inventory Breakdown</p>
      <div class="header-right no-print">
        <div class="search-wrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input v-model="search" placeholder="Search name or category…" class="search-input" @input="page = 1" />
        </div>
        <button class="btn-csv" @click="exportCsv" title="Export to CSV">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
      </div>
    </div>

    <!-- Large dataset warning -->
    <div v-if="rows.length > 200" class="large-warn no-print">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span><strong>{{ rows.length }} items</strong> — printing this table may produce many pages. Use <strong>Export CSV</strong> instead for large datasets.</span>
    </div>

    <div class="table-wrap">
      <table class="report-table">
        <thead>
          <tr>
            <th class="col-no">#</th>
            <th class="sortable" @click="sort('name')">
              Item <span class="arr" :class="sortBy==='name' ? sortDir : ''">↕</span>
            </th>
            <th class="sortable" @click="sort('category')">
              Category <span class="arr" :class="sortBy==='category' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('costPrice')">
              Cost (RM) <span class="arr" :class="sortBy==='costPrice' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('price')">
              Sell (RM) <span class="arr" :class="sortBy==='price' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('stock')">
              Stock <span class="arr" :class="sortBy==='stock' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('sold')">
              Sold <span class="arr" :class="sortBy==='sold' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('revenue')">
              Revenue <span class="arr" :class="sortBy==='revenue' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('cogs')">
              COGS <span class="arr" :class="sortBy==='cogs' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('grossProfit')">
              Gross Profit <span class="arr" :class="sortBy==='grossProfit' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('marginPct')">
              Margin % <span class="arr" :class="sortBy==='marginPct' ? sortDir : ''">↕</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in displayRows"
            :key="row.variant_id"
            class="tr-row"
            :class="{ 'tr-zero': row.stock === 0, 'tr-loss': row.grossProfit < 0 }"
          >
            <td class="col-no td-muted">{{ rowOffset + i + 1 }}</td>
            <td class="td-name">{{ row.name }}</td>
            <td>
              <span class="cat-pill" :style="`background:${catColor(row.category)}22; color:${catColor(row.category)}`">
                {{ row.category }}
              </span>
            </td>
            <td class="col-num td-mono td-muted-val">{{ fmt(row.costPrice) }}</td>
            <td class="col-num td-mono">{{ fmt(row.price) }}</td>
            <td class="col-num td-mono">{{ row.stock }}</td>
            <td class="col-num td-mono td-green">{{ row.sold }}</td>
            <td class="col-num td-mono td-green fw-bold">{{ fmt(row.revenue) }}</td>
            <td class="col-num td-mono td-red">{{ fmt(row.cogs) }}</td>
            <td class="col-num td-mono fw-bold" :class="row.grossProfit >= 0 ? 'td-profit' : 'td-loss'">
              {{ fmt(row.grossProfit) }}
            </td>
            <td class="col-num">
              <span class="margin-pill" :class="marginClass(row.marginPct)">
                {{ row.sold > 0 ? row.marginPct + '%' : '—' }}
              </span>
            </td>
          </tr>
          <tr v-if="sortedRows.length === 0">
            <td colspan="11" class="td-empty">No records match your search.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="tr-total">
            <td colspan="5" class="td-total-lbl">Totals ({{ sortedRows.length }} items)</td>
            <td class="col-num td-mono td-bold">{{ totals.stock }}</td>
            <td class="col-num td-mono td-bold td-green">{{ totals.sold }}</td>
            <td class="col-num td-mono td-bold td-green">{{ fmt(totals.revenue) }}</td>
            <td class="col-num td-mono td-bold td-red">{{ fmt(totals.cogs) }}</td>
            <td class="col-num td-mono td-bold" :class="totals.grossProfit >= 0 ? 'td-profit' : 'td-loss'">{{ fmt(totals.grossProfit) }}</td>
            <td class="col-num td-mono td-bold">{{ totals.overallMargin }}%</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Pagination -->
    <div class="pagination no-print" v-if="totalPages > 1">
      <button class="pg-btn" @click="page = 1" :disabled="page === 1">«</button>
      <button class="pg-btn" @click="page--"   :disabled="page === 1">‹</button>
      <span class="pg-info">Page <strong>{{ page }}</strong> of <strong>{{ totalPages }}</strong> · {{ sortedRows.length }} items</span>
      <button class="pg-btn" @click="page++"           :disabled="page === totalPages">›</button>
      <button class="pg-btn" @click="page = totalPages" :disabled="page === totalPages">»</button>
      <select class="pg-size" v-model.number="pageSize" @change="page = 1">
        <option :value="25">25 / page</option>
        <option :value="50">50 / page</option>
        <option :value="100">100 / page</option>
      </select>
    </div>

  </div>
</template>

<script>
const CAT_COLORS = {
  'Beverages':  '#6366f1',
  'Dry Goods':  '#f59e0b',
  'Condiments': '#10b981',
  'Cleaning':   '#ef4444',
  'Frozen':     '#06b6d4',
}

export default {
  name: 'ReportTable',
  props: {
    rows: { type: Array, required: true },
  },

  data() {
    return {
      search:     '',
      sortBy:     'grossProfit',
      sortDir:    'desc',
      page:       1,
      pageSize:   50,
      isPrinting: false,
    }
  },

  computed: {
    filtered() {
      if (!this.search) return this.rows
      const q = this.search.toLowerCase()
      return this.rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
      )
    },

    sortedRows() {
      const dir = this.sortDir === 'asc' ? 1 : -1
      return [...this.filtered].sort((a, b) => {
        const av = a[this.sortBy]; const bv = b[this.sortBy]
        return typeof av === 'string' ? av.localeCompare(bv) * dir : (av - bv) * dir
      })
    },

    totalPages() {
      return Math.max(1, Math.ceil(this.sortedRows.length / this.pageSize))
    },

    rowOffset() {
      return this.isPrinting ? 0 : (this.page - 1) * this.pageSize
    },

    displayRows() {
      if (this.isPrinting) return this.sortedRows
      const start = (this.page - 1) * this.pageSize
      return this.sortedRows.slice(start, start + this.pageSize)
    },

    totals() {
      const r = this.sortedRows
      const revenue     = parseFloat(r.reduce((s, x) => s + x.revenue,     0).toFixed(2))
      const cogs        = parseFloat(r.reduce((s, x) => s + x.cogs,        0).toFixed(2))
      const grossProfit = parseFloat(r.reduce((s, x) => s + x.grossProfit, 0).toFixed(2))
      return {
        stock:         r.reduce((s, x) => s + x.stock, 0),
        sold:          r.reduce((s, x) => s + x.sold,  0),
        revenue,
        cogs,
        grossProfit,
        overallMargin: revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0,
      }
    },
  },

  watch: {
    rows()   { this.page = 1 },
    search() { this.page = 1 },
  },

  mounted() {
    this._beforePrint = () => { this.isPrinting = true }
    this._afterPrint  = () => { this.isPrinting = false }
    window.addEventListener('beforeprint', this._beforePrint)
    window.addEventListener('afterprint',  this._afterPrint)
  },

  beforeUnmount() {
    window.removeEventListener('beforeprint', this._beforePrint)
    window.removeEventListener('afterprint',  this._afterPrint)
  },

  methods: {
    sort(col) {
      this.page = 1
      this.sortBy === col
        ? (this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc')
        : ((this.sortBy = col), (this.sortDir = ['name', 'category'].includes(col) ? 'asc' : 'desc'))
    },

    catColor(cat) { return CAT_COLORS[cat] || '#6366f1' },

    fmt(val) {
      return Number(val).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },

    marginClass(pct) {
      if (pct < 0)  return 'mg-loss'
      if (pct < 10) return 'mg-low'
      if (pct < 30) return 'mg-ok'
      return 'mg-good'
    },

    exportCsv() {
      const esc = v => `"${String(v).replace(/"/g, '""')}"`
      const headers = ['#', 'Item', 'Category', 'Cost (RM)', 'Sell (RM)', 'Stock', 'Sold', 'Revenue (RM)', 'COGS (RM)', 'Gross Profit (RM)', 'Margin %']
      const lines = this.sortedRows.map((r, i) => [
        i + 1,
        esc(r.name),
        esc(r.category),
        r.costPrice.toFixed(2),
        r.price.toFixed(2),
        r.stock,
        r.sold,
        r.revenue.toFixed(2),
        r.cogs.toFixed(2),
        r.grossProfit.toFixed(2),
        r.sold > 0 ? r.marginPct : '',
      ].join(','))

      const csv  = [headers.join(','), ...lines].join('\r\n')
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `inventory-report-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
  },
}
</script>

<style scoped>
.table-section { display: flex; flex-direction: column; gap: 14px; }

.section-header {
  display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;
}
.section-title {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
}
.header-right { display: flex; align-items: center; gap: 8px; }

.search-wrap {
  display: flex; align-items: center; gap: 7px;
  padding: 7px 12px; border: 1px solid #e2e8f0;
  border-radius: 7px; background: #f8fafc; transition: border-color .15s;
}
.search-wrap:focus-within { border-color: #6366f1; }
.search-wrap svg { color: #94a3b8; flex-shrink: 0; }
.search-input {
  border: none; background: transparent; outline: none;
  font-size: 13px; font-family: 'DM Sans', sans-serif;
  color: #1e293b; width: 200px;
}
.search-input::placeholder { color: #cbd5e1; }

.table-wrap { overflow-x: auto; }
.report-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.report-table thead tr { border-bottom: 2px solid #f1f5f9; }
.report-table thead th {
  padding: 9px 10px; text-align: left;
  font-size: 10.5px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em; white-space: nowrap;
}
.report-table thead th.sortable { cursor: pointer; user-select: none; }
.report-table thead th.sortable:hover { color: #6366f1; }

.arr { font-size: 10px; color: #dde1e9; margin-left: 3px; }
.arr.asc, .arr.desc { color: #6366f1; }

.col-no  { width: 32px; }
.col-num { text-align: right !important; }

.tr-row { transition: background .1s; }
.tr-row:hover td { background: #fafbff; }
.tr-zero { opacity: .55; }
.tr-loss td { background: #fff8f8 !important; }

.report-table tbody td {
  padding: 10px 10px; border-bottom: 1px solid #f8fafc;
  color: #334155; vertical-align: middle;
}
.report-table tbody tr:last-child td { border-bottom: none; }

.td-muted     { color: #cbd5e1 !important; font-family: 'DM Mono', monospace; font-size: 11.5px; }
.td-muted-val { color: #94a3b8 !important; }
.td-name      { font-weight: 500; color: #1e293b; min-width: 140px; }
.td-mono      { font-family: 'DM Mono', monospace; font-size: 12.5px; }
.td-green     { color: #10b981 !important; }
.td-red       { color: #ef4444 !important; }
.td-profit    { color: #10b981 !important; }
.td-loss      { color: #ef4444 !important; }
.fw-bold      { font-weight: 700; }
.td-empty     { text-align: center; padding: 36px !important; color: #cbd5e1; font-size: 14px; }

.cat-pill {
  display: inline-block; padding: 3px 8px; border-radius: 5px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}

/* Margin pill */
.margin-pill {
  display: inline-block; padding: 3px 8px; border-radius: 5px;
  font-size: 11px; font-weight: 700; white-space: nowrap; font-family: 'DM Mono', monospace;
}
.mg-loss { background: #fef2f2; color: #dc2626; }
.mg-low  { background: #fffbeb; color: #b45309; }
.mg-ok   { background: #f0fdf4; color: #15803d; }
.mg-good { background: #eff6ff; color: #1d4ed8; }

/* Totals row */
.tr-total td { padding: 11px 10px; border-top: 2px solid #f1f5f9; }
.td-total-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.td-bold      { font-weight: 700; color: #0f172a; }

/* Pagination */
.pagination {
  display: flex; align-items: center; gap: 6px; justify-content: flex-end;
  padding-top: 4px; flex-wrap: wrap;
}
.pg-btn {
  width: 30px; height: 30px; border-radius: 7px; border: 1px solid #e2e8f0;
  background: #f8fafc; color: #475569; font-size: 13px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.pg-btn:hover:not(:disabled) { background: #6366f1; border-color: #6366f1; color: #fff; }
.pg-btn:disabled { opacity: .4; cursor: not-allowed; }
.pg-info { font-size: 12.5px; color: #64748b; padding: 0 6px; }
.pg-size {
  margin-left: 8px; font-family: 'DM Sans', sans-serif; font-size: 12px;
  border: 1px solid #e2e8f0; border-radius: 7px; padding: 5px 8px;
  background: #f8fafc; color: #475569; cursor: pointer; outline: none;
}

/* Large dataset warning */
.large-warn {
  display: flex; align-items: center; gap: 10px;
  background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;
  padding: 10px 14px; font-size: 12.5px; color: #92400e; line-height: 1.5;
}
.large-warn svg { flex-shrink: 0; color: #f59e0b; }

/* Export CSV button */
.btn-csv {
  display: inline-flex; align-items: center; gap: 6px;
  background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d;
  padding: 7px 12px; border-radius: 7px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 500;
  transition: all .15s; white-space: nowrap;
}
.btn-csv:hover { background: #22c55e; border-color: #22c55e; color: #fff; }

@media print {
  .report-table           { font-size: 8pt !important; }
  .report-table thead     { display: table-header-group; }
  .report-table thead th  { font-size: 7pt !important; padding: 5px 6px !important; background: #fafafa !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .report-table tbody td  { padding: 4px 6px !important; }
  .report-table tfoot td  { padding: 6px 6px !important; }
  .tr-row:hover td        { background: transparent !important; }
  .margin-pill, .cat-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .no-print               { display: none !important; }
  .table-wrap             { overflow: visible !important; }
}
</style>
