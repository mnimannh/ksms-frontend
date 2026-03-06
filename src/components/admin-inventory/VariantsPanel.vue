<template>
  <div>
    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-card-value">{{ variants.length }}</span>
        <span class="stat-card-label">Total Variants</span>
      </div>
      <div class="stat-card amber">
        <span class="stat-card-value amber">{{ lowStockCount }}</span>
        <span class="stat-card-label">Low Stock</span>
      </div>
      <div class="stat-card red">
        <span class="stat-card-value red">{{ outOfStockCount }}</span>
        <span class="stat-card-label">Out of Stock</span>
      </div>
      <div class="stat-card green">
        <span class="stat-card-value green">{{ inStockCount }}</span>
        <span class="stat-card-label">In Stock</span>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-header">
        <span class="table-title">All Variants</span>
        <div style="display:flex;gap:10px;align-items:center;">
          <select class="filter-select" v-model="stockFilter">
            <option value="">All Stock</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
          <button class="btn-primary" style="font-size:13px; padding: 7px 14px;" @click="$emit('add')">
            <span>+</span> New Variant
          </button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Variant Name</th>
              <th>Product</th>
              <th>Barcode</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Images</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(variant, idx) in filteredVariants" :key="variant.id">
              <td class="row-num text-muted">{{ idx + 1 }}</td>
              <td>
                <span class="variant-name">{{ variant.variant_name }}</span>
              </td>
              <td>
                <span class="product-ref">{{ getProductName(variant.inventory_id) }}</span>
              </td>
              <td>
                <span class="barcode-chip">{{ variant.barcode }}</span>
              </td>
              <td class="price-cell">RM {{ parseFloat(variant.price).toFixed(2) }}</td>
              <td>
                <div class="qty-cell">
                  <span class="qty-num" :class="getQtyClass(variant)">{{ variant.quantity }}</span>
                  <span class="qty-threshold">/ {{ variant.threshold }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="getStatusBadge(variant)">{{ getStatusLabel(variant) }}</span>
              </td>
              <td>
                <button class="img-preview-btn" @click="$emit('view-images', variant)">
                  <span class="img-thumbs">
                    <span
                      v-for="n in 5" :key="n"
                      class="thumb-dot"
                      :class="{ filled: n <= (variant.images ? variant.images.length : 0) }"
                    ></span>
                  </span>
                  <span class="img-count">{{ variant.images ? variant.images.length : 0 }}/5</span>
                </button>
              </td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Edit" @click="$emit('edit', variant)">✎</button>
                  <button class="btn-icon danger" title="Delete" @click="$emit('delete', variant.id)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredVariants.length === 0" class="empty-state">
          <span class="empty-icon">◈</span>
          <span class="empty-title">No variants found</span>
          <span class="empty-desc">Add variants to your products or clear your filters</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VariantsPanel',
  props: {
    variants: Array,
    inventory: Array,
  },
  emits: ['edit', 'delete', 'view-images', 'add'],
  data() {
    return { stockFilter: '' }
  },
  computed: {
    lowStockCount() {
      return this.variants.filter(v => v.quantity > 0 && v.quantity <= v.threshold).length
    },
    outOfStockCount() {
      return this.variants.filter(v => v.quantity === 0).length
    },
    inStockCount() {
      return this.variants.filter(v => v.quantity > v.threshold).length
    },
    filteredVariants() {
      if (!this.stockFilter) return this.variants
      if (this.stockFilter === 'out') return this.variants.filter(v => v.quantity === 0)
      if (this.stockFilter === 'low') return this.variants.filter(v => v.quantity > 0 && v.quantity <= v.threshold)
      return this.variants.filter(v => v.quantity > v.threshold)
    }
  },
  methods: {
    getProductName(invId) {
      const p = this.inventory.find(i => i.id === invId)
      return p ? p.inventoryName : '—'
    },
    getStatusLabel(v) {
      if (v.quantity === 0) return 'Out of Stock'
      if (v.quantity <= v.threshold) return 'Low Stock'
      return 'In Stock'
    },
    getStatusBadge(v) {
      if (v.quantity === 0) return 'badge-red'
      if (v.quantity <= v.threshold) return 'badge-amber'
      return 'badge-green'
    },
    getQtyClass(v) {
      if (v.quantity === 0) return 'qty-red'
      if (v.quantity <= v.threshold) return 'qty-amber'
      return ''
    },
  }
}
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}
.stat-card {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px 20px;
}
.stat-card-value {
  display: block;
  font-family: 'Syne', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
}
.stat-card-value.amber { color: var(--amber); }
.stat-card-value.red { color: var(--red); }
.stat-card-value.green { color: var(--green); }
.stat-card-label {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
}
.table-title {
  font-family: 'Syne', sans-serif;
  font-size: 15px; font-weight: 600;
}
.filter-select {
  padding: 7px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif; font-size: 13px;
  background: #fff; color: var(--text-primary);
  outline: none; cursor: pointer;
}
.variant-name { font-weight: 500; font-size: 14px; }
.product-ref { font-size: 12px; color: var(--text-secondary); }
.barcode-chip {
  font-family: 'Courier New', monospace;
  font-size: 11px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 7px;
  color: var(--text-secondary);
  white-space: nowrap;
}
.price-cell { font-weight: 500; font-size: 14px; }
.qty-cell { display: flex; align-items: baseline; gap: 2px; }
.qty-num { font-weight: 600; font-size: 15px; }
.qty-num.qty-amber { color: var(--amber); }
.qty-num.qty-red { color: var(--red); }
.qty-threshold { font-size: 11px; color: var(--text-muted); }
.text-muted { color: var(--text-muted); font-size: 13px; }
.row-num { font-size: 12px; width: 36px; }

/* Image preview */
.img-preview-btn {
  background: none; border: 1px solid var(--border);
  border-radius: 6px;
  padding: 5px 9px;
  display: flex; align-items: center; gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
}
.img-preview-btn:hover { border-color: var(--accent); background: var(--bg); }
.img-thumbs { display: flex; gap: 3px; align-items: center; }
.thumb-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--border-strong);
  transition: background 0.15s;
}
.thumb-dot.filled { background: var(--text-primary); }
.img-count { font-size: 11px; color: var(--text-muted); font-weight: 500; }
</style>