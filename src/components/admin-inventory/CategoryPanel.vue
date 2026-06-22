<template>
  <div class="panel">
    <div class="panel-head">
      <div>
        <p class="panel-title">Categories</p>
        <p class="panel-sub">{{ categories.length }} total</p>
      </div>
      <button class="btn-add" @click="$emit('add')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add
      </button>
    </div>

    <div class="panel-search">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input v-model="search" placeholder="Search categories…" class="search-input" />
    </div>

    <div class="list-wrap">
      <div
        v-for="cat in filtered"
        :key="cat.id"
        class="list-row"
        :class="{ active: selectedId === cat.id }"
        @click="$emit('select', cat)"
      >
        <div class="row-icon">
          {{ cat.name.charAt(0).toUpperCase() }}
        </div>
        <div class="row-info">
          <span class="row-name">{{ cat.name }}</span>
          <span class="row-meta">{{ inventoryCountFor(cat.id) }} product{{ inventoryCountFor(cat.id) !== 1 ? 's' : '' }}</span>
        </div>
        <div class="row-arrow" v-if="selectedId === cat.id">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="row-actions" @click.stop>
          <button class="action-btn" @click="$emit('edit', cat)" title="Edit">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn danger" @click="$emit('delete', cat)" title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
          </button>
        </div>
      </div>

      <div class="list-empty" v-if="filtered.length === 0">
        <p>No categories found.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CategoryPanel',
  emits: ['select', 'add', 'edit', 'delete'],
  props: {
    categories:     { type: Array,  default: () => [] },
    selectedId:     { type: Number, default: null },
    inventoryCounts:{ type: Object, default: () => ({}) },
  },
  data() { return { search: '' } },
  computed: {
    filtered() {
      if (!this.search) return this.categories
      const q = this.search.toLowerCase()
      return this.categories.filter(c => c.name.toLowerCase().includes(q))
    },
  },
  methods: {
    inventoryCountFor(id) { return this.inventoryCounts[id] || 0 },
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
  padding: 16px 16px 12px;
  border-bottom: 1px solid #f1f5f9;
}
.panel-title { font-size: 13.5px; font-weight: 600; color: #0f172a; }
.panel-sub   { font-size: 11.5px; color: #64748b; margin-top: 1px; }

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
  margin: 12px 12px 6px; padding: 8px 12px;
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

.list-wrap { flex: 1; overflow-y: auto; padding: 6px 6px 12px; display: flex; flex-direction: column; gap: 3px; }

.list-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px; border-radius: 6px;
  cursor: pointer; transition: all 0.12s ease;
  position: relative;
  border-left: 3px solid transparent;
}
.list-row:hover      { background: #f8fafc; }
.list-row.active     { background: #f1f5f9; border-left-color: #0f172a; border-radius: 0 6px 6px 0; }

.row-icon {
  width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: #475569;
  background: #f1f5f9; border: 1px solid #e2e8f0;
}
.row-info  { flex: 1; min-width: 0; }
.row-name  { display: block; font-size: 13px; font-weight: 500; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.row-meta  { display: block; font-size: 11px; color: #64748b; margin-top: 2px; }
.row-arrow { color: #0f172a; flex-shrink: 0; }

.row-actions {
  display: none; gap: 4px; flex-shrink: 0;
}
.list-row:hover .row-actions { display: flex; }
.list-row.active .row-actions { display: flex; }

.action-btn {
  width: 24px; height: 24px; border-radius: 6px;
  border: 1px solid #e2e8f0; background: #ffffff;
  color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .12s;
}
.action-btn:hover { border-color: #0f172a; color: #0f172a; }
.action-btn.danger:hover { border-color: #dc2626; color: #dc2626; background: #fef2f2; }

.list-empty { padding: 28px 0; text-align: center; color: #cbd5e1; font-size: 13px; }
</style>