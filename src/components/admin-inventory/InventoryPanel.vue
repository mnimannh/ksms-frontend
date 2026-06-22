<template>
  <div class="panel">
    <div class="panel-head">
      <div>
        <p class="panel-title">
          <span class="cat-badge">{{ categoryName }}</span>
        </p>
        <p class="panel-sub">{{ items.length }} product{{ items.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn-add" @click="$emit('add')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add
      </button>
    </div>

    <div class="panel-search">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="search" placeholder="Search products…" class="search-input" />
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table class="inv-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Product Name</th>
            <th class="col-num">Threshold</th>
            <th class="col-num">Variants</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in filtered"
            :key="item.id"
            class="table-row"
            :class="{ active: selectedId === item.id }"
            @click="$emit('select', item)"
          >
            <td class="td-no">{{ i + 1 }}</td>
            <td class="td-name">
              <span class="item-name">{{ item.inventoryName }}</span>
              <span class="item-desc" v-if="item.description">{{ item.description }}</span>
            </td>
            <td class="col-num td-mono">{{ item.default_threshold }}</td>
            <td class="col-num">
              <span class="variant-link">
                {{ variantCountFor(item.id) }} variant{{ variantCountFor(item.id) !== 1 ? 's' : '' }} →
              </span>
            </td>
            <td class="col-actions" @click.stop>
              <div class="action-group">
                <button class="action-btn" @click="$emit('edit', item)" title="Edit">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn danger" @click="$emit('delete', item)" title="Delete">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filtered.length === 0">
            <td colspan="5" class="td-empty">No products found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InventoryPanel',
  emits: ['select', 'add', 'edit', 'delete'],
  props: {
    items:          { type: Array,  default: () => [] },
    selectedId:     { type: Number, default: null },
    categoryName:   { type: String, default: '' },
    catColor:       { type: String, default: '#6366f1' },
    variantCounts:  { type: Object, default: () => ({}) },
  },
  data() { return { search: '' } },
  computed: {
    filtered() {
      if (!this.search) return this.items
      const q = this.search.toLowerCase()
      return this.items.filter(i => i.inventoryName.toLowerCase().includes(q))
    },
  },
  methods: {
    variantCountFor(id) { return this.variantCounts[id] || 0 },
  },
}
</script>

<style scoped>
.panel {
  display: flex; flex-direction: column;
  background: #ffffff; border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  overflow: hidden; height: 100%;
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 16px 12px; border-bottom: 1px solid #f1f5f9;
}
.panel-title { font-size: 13.5px; font-weight: 600; color: #0f172a; display: flex; align-items: center; gap: 8px; }
.panel-sub   { font-size: 11.5px; color: #64748b; margin-top: 4px; }

.cat-badge {
  display: inline-flex; align-items: center;
  padding: 3px 8px; border-radius: 4px;
  font-size: 12px; font-weight: 500;
  border: 1px solid #cbd5e1; background: #f8fafc; color: #334155;
}

.btn-add {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border: none; border-radius: 6px;
  background: #16a34a; color: #ffffff;
  font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 500;
  cursor: pointer; transition: background .12s;
}
.btn-add:hover { background: #15803d; }

.panel-search {
  display: flex; align-items: center; gap: 8px;
  margin: 12px 14px 6px; padding: 8px 12px;
  background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;
  transition: border-color 0.12s;
}
.panel-search:focus-within {
  border-color: #0f172a;
}
.panel-search svg { color: #64748b; flex-shrink: 0; }
.search-input {
  border: none; background: transparent; outline: none;
  font-size: 12.5px; font-family: 'Inter', sans-serif; color: #334155; width: 100%;
}
.search-input::placeholder { color: #94a3b8; }

.table-wrap { flex: 1; overflow-y: auto; }

.inv-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.inv-table thead th {
  padding: 9px 14px; text-align: left;
  font-size: 10.5px; font-weight: 600; color: #64748b;
  text-transform: uppercase; letter-spacing: .05em;
  border-bottom: 1px solid #e2e8f0; white-space: nowrap;
  background: #ffffff;
  position: sticky; top: 0; z-index: 1;
}
.col-num     { text-align: right !important; }
.col-actions { width: 80px; text-align: center !important; }

.table-row {
  cursor: pointer; transition: background .1s;
  border-bottom: 1px solid #f1f5f9;
}
.table-row:hover  { background: #f8fafc; }
.table-row.active { background: #f1f5f9; }
.table-row:last-child { border-bottom: none; }

.inv-table tbody td { padding: 11px 14px; vertical-align: middle; }
.td-no   { color: #cbd5e1; font-family: 'JetBrains Mono', monospace; font-size: 11px; width: 32px; }
.item-name { display: block; font-weight: 500; color: #0f172a; }
.item-desc { display: block; font-size: 11px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.td-mono   { font-family: 'JetBrains Mono', monospace; font-size: 12px; text-align: right; color: #334155; }
.variant-link { font-size: 12.5px; color: #0f172a; font-weight: 500; }
.variant-link:hover { text-decoration: underline; }
.td-empty  { text-align: center; padding: 32px !important; color: #cbd5e1; font-size: 13px; }

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