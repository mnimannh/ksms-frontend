<template>
  <div class="panel">
    <div class="panel-head">
      <div>
        <p class="panel-title">
          Variants
          <span class="inv-badge">{{ inventoryName }}</span>
        </p>
        <p class="panel-sub">{{ variants.length }} variant{{ variants.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="head-right">
        <select v-model="stockFilter" class="filter-select">
          <option value="">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        <button class="btn-add" @click="$emit('add')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Variant
        </button>
      </div>
    </div>

    <div class="table-wrap">
      <table class="var-table">
        <thead>
          <tr>
            <th class="col-no">#</th>
            <th>Variant Name</th>
            <th>Product</th>
            <th>Barcode</th>
            <th class="col-num">Price</th>
            <th class="col-num">Quantity</th>
            <th>Status</th>
            <th>Images</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(v, i) in filtered"
            :key="v.id"
            class="table-row"
            :class="{ 'row-out': v.quantity === 0 }"
          >
            <td class="col-no td-muted">{{ i + 1 }}</td>
            <td class="td-name">{{ v.variant_name }}</td>
            <td class="td-product">{{ inventoryName }}</td>
            <td>
              <button class="barcode-chip" @click="$emit('viewBarcode', v)" :title="`View barcode: ${v.barcode}`">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4"/>
                  <line x1="7" y1="12" x2="7" y2="12"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="17" y1="12" x2="17" y2="12"/>
                </svg>
                {{ v.barcode }}
              </button>
            </td>
            <td class="col-num td-mono">RM {{ fmt(v.price) }}</td>
            <td class="col-num">
              <span class="qty-wrap">
                <span class="qty-val" :class="{ 'qty-low': v.quantity > 0 && v.quantity <= v.threshold, 'qty-out': v.quantity === 0 }">{{ v.quantity }}</span>
                <span class="qty-threshold">/ {{ v.threshold }}</span>
              </span>
            </td>
            <td>
              <span class="status-indicator" :class="statusClass(v)">
                <span class="status-dot"></span>
                <span class="status-text">{{ statusText(v) }}</span>
              </span>
              <span v-if="v.stock_tracking_type === 'load_cell'" class="lc-badge" title="Tracked by load cell">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="7" width="20" height="10" rx="2"/><line x1="12" y1="7" x2="12" y2="3"/></svg>
              </span>
            </td>
            <td>
              <button class="images-btn" @click.stop="$emit('manageImages', v)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="images-icon"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <span class="img-count">{{ imageCountFor(v.id) }}/5</span>
              </button>
            </td>
            <td class="col-actions">
              <div class="action-group">
                <button class="action-btn" @click="$emit('edit', v)" title="Edit">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn danger" @click="$emit('delete', v)" title="Delete">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="9" class="td-empty">No variants found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantTable',
  emits: ['add', 'edit', 'delete', 'viewBarcode', 'manageImages'],
  props: {
    variants:      { type: Array,  default: () => [] },
    inventoryName: { type: String, default: '' },
    imageCounts:   { type: Object, default: () => ({}) },
  },
  data() { return { stockFilter: '' } },
  computed: {
    filtered() {
      if (!this.stockFilter) return this.variants
      return this.variants.filter(v => {
        if (this.stockFilter === 'out') return v.quantity === 0
        if (this.stockFilter === 'low') return v.quantity > 0 && v.quantity <= v.threshold
        if (this.stockFilter === 'in')  return v.quantity > v.threshold
        return true
      })
    },
  },
  methods: {
    statusClass(v) {
      if (v.quantity === 0)                      return 'st-out'
      if (v.quantity <= v.threshold)             return 'st-low'
      return 'st-ok'
    },
    statusText(v) {
      if (v.quantity === 0)          return 'Out of Stock'
      if (v.quantity <= v.threshold) return 'Low Stock'
      return 'In Stock'
    },
    imageCountFor(id) { return this.imageCounts[id] || 0 },
    fmt(val) {
      return Number(val).toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
  },
}
</script>

<style scoped>
.panel {
  display: flex; flex-direction: column;
  background: #ffffff; border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px; border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap; gap: 10px;
}
.panel-title {
  font-size: 13.5px; font-weight: 600; color: #0f172a;
  display: flex; align-items: center; gap: 8px;
}
.inv-badge {
  font-size: 11px; font-weight: 500;
  padding: 2px 8px; border-radius: 4px;
  background: #f1f5f9; color: #475569;
  border: 1px solid #cbd5e1;
}
.panel-sub { font-size: 11.5px; color: #64748b; margin-top: 4px; }

.head-right { display: flex; align-items: center; gap: 8px; }
.filter-select {
  padding: 6px 10px; border: 1px solid #e2e8f0; border-radius: 6px;
  background: #ffffff; font-size: 12px;
  font-family: 'Inter', sans-serif; color: #475569;
  outline: none; cursor: pointer; transition: border-color 0.12s;
}
.filter-select:focus { border-color: #0f172a; }

.btn-add {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border: none; border-radius: 6px;
  background: #16a34a; color: #ffffff;
  font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;
  cursor: pointer; transition: background .12s;
}
.btn-add:hover { background: #15803d; }

.table-wrap { overflow-x: auto; }

.var-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.var-table thead th {
  padding: 9px 14px; text-align: left;
  font-size: 10.5px; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid #e2e8f0; white-space: nowrap;
  background: #ffffff; position: sticky; top: 0; z-index: 1;
}
.col-no     { width: 36px; }
.col-num    { text-align: right !important; }
.col-actions{ width: 80px; text-align: center !important; }

.table-row { border-bottom: 1px solid #f1f5f9; transition: background .1s; }
.table-row:hover { background: #fafbff; }
.table-row.row-out { opacity: .7; }
.table-row:last-child { border-bottom: none; }

.var-table tbody td { padding: 12px 14px; vertical-align: middle; }
.td-muted   { color: #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 11px; }
.td-name    { font-weight: 500; color: #0f172a; }
.td-product { color: #64748b; font-size: 12px; }
.td-mono    { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.td-empty   { text-align: center; padding: 40px !important; color: #cbd5e1; font-size: 13px; }

/* Barcode chip */
.barcode-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 8px; border-radius: 4px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #334155;
  cursor: pointer; transition: all .12s; white-space: nowrap;
}
.barcode-chip:hover { border-color: #0f172a; color: #0f172a; background: #f1f5f9; }

/* Qty */
.qty-wrap     { display: inline-flex; align-items: baseline; gap: 2px; }
.qty-val      { font-family: 'JetBrains Mono', monospace; font-size: 12.5px; font-weight: 500; color: #334155; }
.qty-val.qty-low { color: #b45309; }
.qty-val.qty-out { color: #dc2626; }
.qty-threshold { font-size: 10.5px; color: #94a3b8; }

/* Status Indicators */
.status-indicator {
  display: inline-flex; align-items: center; gap: 6px;
}
.status-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #cbd5e1; display: inline-block;
}
.status-text {
  font-size: 12px; font-weight: 500; color: #475569;
}
.st-ok .status-dot  { background: #10b981; }
.st-low .status-dot { background: #f59e0b; }
.st-out .status-dot { background: #ef4444; }

.st-ok .status-text  { color: #15803d; }
.st-low .status-text { color: #b45309; }
.st-out .status-text { color: #b91c1c; }

.lc-badge {
  display: inline-flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 4px;
  background: #eef2ff; border: 1px solid #c7d2fe;
  color: #6366f1; margin-left: 6px; vertical-align: middle;
}

/* Images button */
.images-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 8px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #ffffff;
  color: #475569; cursor: pointer; transition: all .12s;
}
.images-btn:hover { border-color: #cbd5e1; background: #f8fafc; color: #0f172a; }
.images-icon { color: #64748b; flex-shrink: 0; }
.img-count { font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 500; }

/* Actions */
.action-group { display: flex; justify-content: center; gap: 4px; }
.action-btn {
  width: 24px; height: 24px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #ffffff;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.action-btn:hover { border-color: #0f172a; color: #0f172a; }
.action-btn.danger:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }
</style>