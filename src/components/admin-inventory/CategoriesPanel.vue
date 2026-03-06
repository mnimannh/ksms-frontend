<template>
  <div>
    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-card-value">{{ categories.length }}</span>
        <span class="stat-card-label">Total Categories</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-value">{{ inventory.length }}</span>
        <span class="stat-card-label">Total Products</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-value">{{ categories.filter(c => getProductCount(c.id) > 0).length }}</span>
        <span class="stat-card-label">Active Categories</span>
      </div>
    </div>

    <!-- Table Card -->
    <div class="card" style="padding: 0; overflow: hidden;">
      <div class="table-header">
        <span class="table-title">All Categories</span>
        <button class="btn-primary" style="font-size:13px; padding: 7px 14px;" @click="$emit('add')">
          <span>+</span> New Category
        </button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Products</th>
              <th>Created</th>
              <th style="text-align:right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(cat, idx) in categories" :key="cat.id">
              <td class="text-muted row-num">{{ idx + 1 }}</td>
              <td>
                <div class="cat-name-cell">
                  <span class="cat-dot" :style="{ background: dotColor(idx) }"></span>
                  <span class="fw-medium">{{ cat.name }}</span>
                </div>
              </td>
              <td>
                <span class="badge" :class="getProductCount(cat.id) > 0 ? 'badge-neutral' : 'badge-red'">
                  {{ getProductCount(cat.id) }} products
                </span>
              </td>
              <td class="text-muted">{{ formatDate(cat.created_at) }}</td>
              <td>
                <div class="actions">
                  <button class="btn-icon" title="Edit" @click="$emit('edit', cat)">✎</button>
                  <button class="btn-icon danger" title="Delete" @click="$emit('delete', cat.id)">✕</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="categories.length === 0" class="empty-state">
          <span class="empty-icon">⊞</span>
          <span class="empty-title">No categories yet</span>
          <span class="empty-desc">Create your first category to get started</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoriesPanel',
  props: {
    categories: Array,
    inventory: Array,
  },
  emits: ['edit', 'delete', 'add'],
  methods: {
    getProductCount(catId) {
      return this.inventory.filter(i => i.category_id === catId).length
    },
    formatDate(d) {
      if (!d) return '—'
      return new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    dotColor(idx) {
      const colors = ['#1C1917','#16A34A','#D97706','#7C3AED','#0369A1','#DC2626']
      return colors[idx % colors.length]
    }
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
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.stat-card-value {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.03em;
}
.stat-card-label {
  display: block;
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.table-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
}
.table-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 14.5px; font-weight: 600;
  color: #0f172a;
}
.cat-name-cell {
  display: flex; align-items: center; gap: 10px;
}
.cat-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.fw-medium { font-weight: 500; color: #1e293b; }
.text-muted { color: #94a3b8; font-size: 13px; }
.row-num { font-size: 12px; color: #94a3b8; width: 36px; }
</style>