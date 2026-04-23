<template>
  <div class="cat-section">

    <p class="section-title">By Category</p>

    <div class="cat-grid">
      <div class="cat-card" v-for="(c, i) in breakdown" :key="c.name">
        <div class="cat-top">
          <span class="cat-dot" :style="`background:${colors[i % colors.length]}`" />
          <span class="cat-name">{{ c.name }}</span>
        </div>

        <div class="cat-stats">
          <div class="stat">
            <span class="stat-val">{{ c.items }}</span>
            <span class="stat-lbl">Items</span>
          </div>
          <div class="stat">
            <span class="stat-val">{{ c.stock }}</span>
            <span class="stat-lbl">Stock</span>
          </div>
          <div class="stat">
            <span class="stat-val green">{{ c.sold }}</span>
            <span class="stat-lbl">Sold</span>
          </div>
          <div class="stat">
            <span class="stat-val indigo">{{ c.remaining }}</span>
            <span class="stat-lbl">Remaining</span>
          </div>
        </div>

        <div class="cat-financials">
          <div class="fin-row">
            <span class="fin-lbl">Revenue</span>
            <span class="fin-val green">RM {{ fmt(c.revenue) }}</span>
          </div>
          <div class="fin-row">
            <span class="fin-lbl">COGS</span>
            <span class="fin-val red">RM {{ fmt(c.cogs) }}</span>
          </div>
          <div class="fin-row">
            <span class="fin-lbl">Gross Profit</span>
            <span class="fin-val" :class="c.grossProfit >= 0 ? 'green' : 'red'">RM {{ fmt(c.grossProfit) }}</span>
          </div>
          <div class="fin-row">
            <span class="fin-lbl">Margin</span>
            <span class="fin-val" :class="c.marginPct >= 20 ? 'indigo' : c.marginPct >= 0 ? 'amber' : 'red'">{{ c.marginPct }}%</span>
          </div>
        </div>

        <div class="cat-bar-wrap">
          <div class="cat-bar">
            <div
              class="cat-bar-fill"
              :style="`width:${c.soldPct}%; background:${colors[i % colors.length]}`"
            />
          </div>
          <span class="bar-pct">{{ c.soldPct }}% sell-through</span>
        </div>
      </div>
    </div>

    <!-- Doc Footer -->
    <div class="doc-footer">
      <span>KSMS Inventory Report · {{ periodLabel }}</span>
      <span>Generated {{ generatedAt }}</span>
    </div>

  </div>
</template>

<script>
export default {
  name: 'ReportCategories',
  props: {
    breakdown:   { type: Array,  required: true },
    periodLabel: { type: String, required: true },
    generatedAt: { type: String, required: true },
  },

  data() {
    return {
      colors: ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'],
    }
  },

  methods: {
    fmt(val) {
      return Number(val).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
  },
}
</script>

<style scoped>
.cat-section { display: flex; flex-direction: column; gap: 14px; }

.section-title {
  font-size: 12px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 12px;
}

.cat-card {
  border: 1px solid #f1f5f9; border-radius: 10px;
  padding: 16px 18px; background: #fafbfc;
  display: flex; flex-direction: column; gap: 12px;
  transition: box-shadow .15s;
}
.cat-card:hover { box-shadow: 0 3px 10px rgba(0,0,0,.06); }

.cat-top { display: flex; align-items: center; gap: 8px; }
.cat-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cat-name { font-size: 13px; font-weight: 600; color: #1e293b; }

.cat-stats { display: flex; gap: 12px; }
.stat      { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.stat-val  { font-size: 15px; font-weight: 700; color: #1e293b; font-family: 'DM Mono', monospace; }
.stat-val.green  { color: #10b981; }
.stat-val.indigo { color: #6366f1; }
.stat-lbl  { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }

.cat-financials { display: flex; flex-direction: column; gap: 5px; padding: 10px 12px; background: #fff; border-radius: 7px; border: 1px solid #f1f5f9; }
.fin-row   { display: flex; justify-content: space-between; align-items: center; }
.fin-lbl   { font-size: 11px; color: #94a3b8; font-weight: 500; }
.fin-val   { font-size: 12.5px; font-weight: 700; font-family: 'DM Mono', monospace; }
.fin-val.green  { color: #10b981; }
.fin-val.indigo { color: #6366f1; }
.fin-val.red    { color: #ef4444; }
.fin-val.amber  { color: #b45309; }

.cat-bar-wrap { display: flex; flex-direction: column; gap: 4px; }
.cat-bar  { height: 4px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.cat-bar-fill { height: 100%; border-radius: 99px; transition: width .5s ease; }
.bar-pct  { font-size: 10.5px; color: #94a3b8; }

/* Doc Footer */
.doc-footer {
  display: flex; justify-content: space-between;
  padding-top: 16px; margin-top: 4px;
  border-top: 1px solid #f1f5f9;
  font-size: 11.5px; color: #cbd5e1;
}

@media print {
  .cat-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 8pt !important; }
  .cat-card { padding: 10px 12px !important; break-inside: avoid; }
  .stat-val { font-size: 11pt !important; }
  .fin-val  { font-size: 9pt !important; }
  .doc-footer { font-size: 8pt !important; color: #999 !important; }
  .cat-bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}
</style>