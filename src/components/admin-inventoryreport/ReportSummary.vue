<template>
  <div class="summary-section">

    <!-- Overview -->
    <div class="summary-block">
      <p class="block-title">Overview</p>
      <div class="summary-strip">
        <div class="sum-item" v-for="s in overview" :key="s.label">
          <p class="sum-val" :style="`color:${s.color}`">{{ s.value }}</p>
          <p class="sum-label">{{ s.label }}</p>
        </div>
      </div>
    </div>

    <!-- Financials -->
    <div class="summary-block">
      <p class="block-title">Revenue</p>
      <div class="summary-strip fin-strip">
        <div class="sum-item" v-for="s in financials" :key="s.label">
          <p class="sum-val fin-val" :style="`color:${s.color}`">{{ s.value }}</p>
          <p class="sum-label">{{ s.label }}</p>
          <p class="sum-sub" v-if="s.sub">{{ s.sub }}</p>
        </div>
      </div>
    </div>

    <!-- Profit & Margin -->
    <div class="summary-block" v-if="profits.length">
      <p class="block-title">Profit & Margin</p>
      <div class="summary-strip profit-strip">
        <div class="sum-item" v-for="s in profits" :key="s.label">
          <p class="sum-val fin-val" :style="`color:${s.color}`">{{ s.value }}</p>
          <p class="sum-label">{{ s.label }}</p>
          <p class="sum-sub" v-if="s.sub">{{ s.sub }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'ReportSummary',
  props: {
    overview:   { type: Array, required: true },
    financials: { type: Array, required: true },
    profits:    { type: Array, default: () => [] },
  },
}
</script>

<style scoped>
.summary-section { display: flex; flex-direction: column; gap: 16px; }

.summary-block { display: flex; flex-direction: column; gap: 8px; }
.block-title {
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
}
.sum-item:last-child { border-right: none; }

.sum-val   { font-size: 21px; font-weight: 700; letter-spacing: -.03em; margin-bottom: 3px; }
.sum-label { font-size: 11.5px; color: #94a3b8; font-weight: 500; }
.sum-sub   { font-size: 11px; color: #64748b; margin-top: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.fin-strip    { background: #fafbfc; }
.profit-strip { background: #fdfcff; }
.fin-val      { font-size: 17px !important; font-family: 'DM Mono', monospace; }

@media (max-width: 900px) {
  .summary-strip { flex-wrap: wrap; }
  .sum-item { min-width: 130px; border-bottom: 1px solid #f1f5f9; }
}
</style>
