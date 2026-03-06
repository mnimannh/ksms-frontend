<template>
  <div>
    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-card-value">{{ inventory.length }}</span>
        <span class="stat-card-label">Total Products</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-value">{{ totalVariantCount }}</span>
        <span class="stat-card-label">Total Variants</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-value">{{ categories.length }}</span>
        <span class="stat-card-label">Categories</span>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-header">
        <span class="table-title">All Products</span>
        <div style="display:flex;gap:10px;align-items:center;">
          <select class="filter-select" v-model="selectedCategory">
            <option value="">All Categories</option>
            <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
          <button class="btn-primary" style="font-size:13px; padding: 7px 14px;" @click="$emit('add')">
            <span>+</span> New Product
          </button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Variants</th>
              <th>Threshold</th>
              <th>Last Updated</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in filteredInventory" :key="item.id">
              <td class="row-num text-muted">{{ idx + 1 }}</td>
              <td>
                <span class="product-name">{{ item.inventoryName }}</span>
              </td>
              <td>
                <span class="badge badge-neutral">{{ getCategoryName(item.category_id) }}</span>
              </td>
              <td class="text-muted desc-cell">{{ item.description || '—' }}</td>
              <td>
                <button class="variants-link" @click="$emit('view-variants', item)">
                  {{ getVariantCount(item.id) }} variants →
                </button>
              </td>
              <td class="text-muted">{{ item.default_threshold }}</td>
              <td class="text-muted">{{ formatDate(item.lastUpdated) }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Edit" @click="$emit('edit', item)">✎</button>
                  <button class="btn-icon danger" title="Delete" @click="$emit('delete', item.id)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filteredInventory.length === 0" class="empty-state">
          <span class="empty-icon">◫</span>
          <span class="empty-title">No products found</span>
          <span class="empty-desc">Add a product or clear your filters</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryPanel',
  props: {
    inventory: Array,
    categories: Array,
    variants: Array,
  },
  emits: ['edit', 'delete', 'view-variants', 'add'],
  data() {
    return { selectedCategory: '' }
  },
  computed: {
    filteredInventory() {
      if (!this.selectedCategory) return this.inventory
      return this.inventory.filter(i => i.category_id === this.selectedCategory)
    },
    totalVariantCount() {
      return this.variants.length
    }
  },
  methods: {
    getCategoryName(id) {
      const c = this.categories.find(c => c.id === id)
      return c ? c.name : '—'
    },
    getVariantCount(inventoryId) {
      return this.variants.filter(v => v.inventory_id === inventoryId).length
    },
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
    },
  }
}
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  background: #fff;
  color: var(--text-primary);
  outline: none;
  cursor: pointer;
}
.product-name { font-weight: 500; font-size: 14px; }
.desc-cell { font-size: 12px; max-width: 180px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-muted { color: var(--text-muted); font-size: 13px; }
.row-num { font-size: 12px; width: 36px; }
.variants-link {
  background: none; border: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.variants-link:hover { color: var(--accent); }
</style>