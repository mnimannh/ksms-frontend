<template>
  <div class="table-section">

    <div class="section-header">
      <p class="section-title">Inventory Breakdown</p>
      <div class="search-wrap no-print">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input v-model="search" placeholder="Search name or category…" class="search-input" />
      </div>
    </div>

    <div class="table-wrap">
      <table class="report-table">
        <thead>
          <tr>
            <th class="col-no">#</th>
            <th class="sortable" @click="sort('name')">
              Inventory Name <span class="arr" :class="sortBy==='name' ? sortDir : ''">↕</span>
            </th>
            <th class="sortable" @click="sort('category')">
              Category <span class="arr" :class="sortBy==='category' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('price')">
              Unit Price <span class="arr" :class="sortBy==='price' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('stock')">
              Stock <span class="arr" :class="sortBy==='stock' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('sold')">
              Qty Sold <span class="arr" :class="sortBy==='sold' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num">Remaining</th>
            <th class="col-num sortable" @click="sort('revenue')">
              Revenue (RM) <span class="arr" :class="sortBy==='revenue' ? sortDir : ''">↕</span>
            </th>
            <th class="col-num sortable" @click="sort('potentialRevenue')">
              Potential Rev. <span class="arr" :class="sortBy==='potentialRevenue' ? sortDir : ''">↕</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in sortedRows"
            :key="row.id"
            class="tr-row"
            :class="{ 'tr-zero': row.stock === 0 }"
          >
            <td class="col-no td-muted">{{ i + 1 }}</td>
            <td class="td-name">{{ row.name }}</td>
            <td>
              <span class="cat-pill" :style="`background:${catColor(row.category)}22; color:${catColor(row.category)}`">
                {{ row.category }}
              </span>
            </td>
            <td class="col-num td-mono">{{ fmt(row.price) }}</td>
            <td class="col-num td-mono">{{ row.stock }}</td>
            <td class="col-num td-mono td-green">{{ row.sold }}</td>
            <td class="col-num td-mono td-indigo">{{ row.remaining }}</td>
            <td class="col-num td-mono td-green fw-bold">{{ fmt(row.revenue) }}</td>
            <td class="col-num td-mono td-indigo">{{ fmt(row.potentialRevenue) }}</td>
          </tr>
          <tr v-if="sortedRows.length === 0">
            <td colspan="9" class="td-empty">No records match your search.</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="tr-total">
            <td colspan="4" class="td-total-lbl">Totals</td>
            <td class="col-num td-mono td-bold">{{ totals.stock }}</td>
            <td class="col-num td-mono td-bold td-green">{{ totals.sold }}</td>
            <td class="col-num td-mono td-bold td-indigo">{{ totals.remaining }}</td>
            <td class="col-num td-mono td-bold td-green">{{ fmt(totals.revenue) }}</td>
            <td class="col-num td-mono td-bold td-indigo">{{ fmt(totals.potentialRevenue) }}</td>
          </tr>
        </tfoot>
      </table>
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
      search:  '',
      sortBy:  'name',
      sortDir: 'asc',
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

    totals() {
      const r = this.sortedRows
      return {
        stock:            r.reduce((s, x) => s + x.stock, 0),
        sold:             r.reduce((s, x) => s + x.sold, 0),
        remaining:        r.reduce((s, x) => s + x.remaining, 0),
        revenue:          parseFloat(r.reduce((s, x) => s + x.revenue, 0).toFixed(2)),
        potentialRevenue: parseFloat(r.reduce((s, x) => s + x.potentialRevenue, 0).toFixed(2)),
      }
    },
  },

  methods: {
    sort(col) {
      this.sortBy === col
        ? (this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc')
        : ((this.sortBy = col), (this.sortDir = ['name', 'category'].includes(col) ? 'asc' : 'desc'))
    },

    catColor(cat) { return CAT_COLORS[cat] || '#6366f1' },

    fmt(val) {
      return Number(val).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
  },
}
</script>

<style scoped>
.table-section { display: flex; flex-direction: column; gap: 14px; }

.section-header {
  display: flex; align-items: center; justify-content: space-between;
}
.section-title {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
}

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
  color: #1e293b; width: 200px;
}
.search-input::placeholder { color: #cbd5e1; }

.table-wrap { overflow-x: auto; }

.report-table { width: 100%; border-collapse: collapse; font-size: 13px; }

.report-table thead tr { border-bottom: 2px solid #f1f5f9; }
.report-table thead th {
  padding: 9px 10px; text-align: left;
  font-size: 10.5px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em;
  white-space: nowrap;
}
.report-table thead th.sortable { cursor: pointer; user-select: none; }
.report-table thead th.sortable:hover { color: #6366f1; }

.arr { font-size: 10px; color: #dde1e9; margin-left: 3px; }
.arr.asc, .arr.desc { color: #6366f1; }

.col-no     { width: 32px; }
.col-num    { text-align: right !important; }
.col-status { width: 120px; }

.tr-row { transition: background .1s; }
.tr-row:hover td { background: #fafbff; }
.tr-zero { opacity: .6; }

.report-table tbody td {
  padding: 10px 10px;
  border-bottom: 1px solid #f8fafc;
  color: #334155; vertical-align: middle;
}
.report-table tbody tr:last-child td { border-bottom: none; }

.td-muted  { color: #cbd5e1 !important; font-family: 'DM Mono', monospace; font-size: 11.5px; }
.td-name   { font-weight: 500; color: #1e293b; }
.td-mono   { font-family: 'DM Mono', monospace; font-size: 12.5px; }
.td-green  { color: #10b981 !important; }
.td-indigo { color: #6366f1 !important; }
.fw-bold   { font-weight: 700; }
.td-empty  { text-align: center; padding: 36px !important; color: #cbd5e1; font-size: 14px; }

.cat-pill {
  display: inline-block; padding: 3px 8px; border-radius: 5px;
  font-size: 11px; font-weight: 600;
}
.status-pill {
  display: inline-block; padding: 3px 9px; border-radius: 5px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.st-ok   { background: #f0fdf4; color: #15803d; }
.st-low  { background: #fffbeb; color: #b45309; }
.st-out  { background: #fef2f2; color: #dc2626; }
.st-high { background: #eef2ff; color: #4f46e5; }

.tr-total td {
  padding: 11px 10px;
  border-top: 2px solid #f1f5f9;
}
.td-total-lbl { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: .05em; }
.td-bold      { font-weight: 700; color: #0f172a; }

@media print {
  .report-table           { font-size: 8.5pt !important; }
  .report-table thead th  { font-size: 7pt !important; padding: 5px 6px !important; }
  .report-table tbody td  { padding: 5px 6px !important; }
  .report-table tfoot td  { padding: 7px 6px !important; }
  .tr-row:hover td        { background: transparent !important; }
  .status-pill, .cat-pill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}

@media print {
  .no-print {
    display: none !important;
  }
}
</style>