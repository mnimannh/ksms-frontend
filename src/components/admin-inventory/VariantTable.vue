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
              <span class="status-pill" :class="statusClass(v)">{{ statusText(v) }}</span>
            </td>
            <td>
              <button class="images-btn" @click.stop="$emit('manageImages', v)">
                <span class="img-dots">
                  <span
                    v-for="n in 5" :key="n"
                    class="img-dot"
                    :class="{ filled: n <= imageCountFor(v.id) }"
                  />
                </span>
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
  background: #fff; border-radius: 14px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  overflow: hidden;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px 14px; border-bottom: 1px solid #f1f5f9;
  flex-wrap: wrap; gap: 10px;
}
.panel-title {
  font-size: 14px; font-weight: 700; color: #0f172a;
  display: flex; align-items: center; gap: 8px;
}
.inv-badge {
  font-size: 12px; font-weight: 600;
  padding: 2px 9px; border-radius: 5px;
  background: #eef2ff; color: #6366f1;
}
.panel-sub { font-size: 12px; color: #94a3b8; margin-top: 4px; }

.head-right { display: flex; align-items: center; gap: 8px; }
.filter-select {
  padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 12.5px;
  font-family: 'DM Sans', sans-serif; color: #475569;
  outline: none; cursor: pointer;
}
.filter-select:focus { border-color: #6366f1; }

.btn-add {
  display: flex; align-items: center; gap: 5px;
  padding: 7px 14px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 12.5px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-add:hover { background: #4f46e5; }

.table-wrap { overflow-x: auto; }

.var-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.var-table thead th {
  padding: 9px 14px; text-align: left;
  font-size: 10.5px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em;
  border-bottom: 1px solid #f1f5f9; white-space: nowrap;
  background: #fff; position: sticky; top: 0; z-index: 1;
}
.col-no     { width: 36px; }
.col-num    { text-align: right !important; }
.col-actions{ width: 80px; text-align: center !important; }

.table-row { border-bottom: 1px solid #f8fafc; transition: background .1s; }
.table-row:hover { background: #fafbff; }
.table-row.row-out { opacity: .7; }
.table-row:last-child { border-bottom: none; }

.var-table tbody td { padding: 12px 14px; vertical-align: middle; }
.td-muted   { color: #cbd5e1; font-family: 'DM Mono', monospace; font-size: 11.5px; }
.td-name    { font-weight: 500; color: #1e293b; }
.td-product { color: #64748b; font-size: 12.5px; }
.td-mono    { font-family: 'DM Mono', monospace; font-size: 12.5px; }
.td-empty   { text-align: center; padding: 40px !important; color: #cbd5e1; font-size: 14px; }

/* Barcode chip */
.barcode-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  font-family: 'DM Mono', monospace; font-size: 11.5px; color: #334155;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.barcode-chip:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }

/* Qty */
.qty-wrap     { display: inline-flex; align-items: baseline; gap: 2px; }
.qty-val      { font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 600; color: #1e293b; }
.qty-val.qty-low { color: #f59e0b; }
.qty-val.qty-out { color: #ef4444; }
.qty-threshold { font-size: 11px; color: #94a3b8; }

/* Status */
.status-pill {
  display: inline-block; padding: 3px 9px; border-radius: 5px;
  font-size: 11px; font-weight: 600; white-space: nowrap;
}
.st-ok  { background: #f0fdf4; color: #15803d; }
.st-low { background: #fffbeb; color: #b45309; }
.st-out { background: #fef2f2; color: #dc2626; }

/* Images button */
.images-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 4px 9px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  cursor: pointer; transition: all .15s;
}
.images-btn:hover { border-color: #6366f1; background: #eef2ff; }
.img-dots  { display: flex; align-items: center; gap: 3px; }
.img-dot   {
  width: 7px; height: 7px; border-radius: 50%;
  background: #e2e8f0; transition: background .12s;
}
.img-dot.filled { background: #6366f1; }
.img-count { font-size: 11.5px; font-family: 'DM Mono', monospace; color: #64748b; }

/* Actions */
.action-group { display: flex; justify-content: center; gap: 4px; }
.action-btn {
  width: 26px; height: 26px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #fff;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.action-btn:hover { border-color: #6366f1; color: #6366f1; }
.action-btn.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }
</style>