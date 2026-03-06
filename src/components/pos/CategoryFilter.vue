<template>
  <div class="filter-section">

    <!-- Top row: label + toggle -->
    <div class="filter-header">
      <div class="filter-label-row">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span class="filter-label">Category</span>
        <span class="selected-name" v-if="selectedCategory && selectedCategory.id !== 0">
          · {{ selectedCategory.name }}
        </span>
      </div>

      <button
        class="toggle-btn"
        @click="expanded = !expanded"
        :class="{ expanded }"
        v-if="categories.length > visibleCount + 1"
      >
        <span>{{ expanded ? 'Show less' : `+${hiddenCount} more` }}</span>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2"
          :style="expanded ? 'transform:rotate(180deg)' : ''"
          style="transition:transform .2s ease; flex-shrink:0"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
    </div>

    <!-- Pills grid -->
    <div class="pills-wrap" :class="{ expanded }">
      <button
        v-for="cat in visibleCategories"
        :key="cat.id"
        class="pill"
        :class="{ active: selectedId === cat.id }"
        @click="$emit('filter', cat.id)"
      >
        {{ cat.name }}
        <span class="check-icon" v-if="selectedId === cat.id">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </span>
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps(['categories', 'selectedId']);
defineEmits(['filter']);

// How many pills visible before collapse
const visibleCount = 9;
const expanded = ref(false);

const selectedCategory = computed(() =>
  props.categories.find(c => c.id === props.selectedId)
);

const hiddenCount = computed(() =>
  Math.max(0, props.categories.length - visibleCount - 1)
);

const visibleCategories = computed(() => {
  if (expanded.value || props.categories.length <= visibleCount + 1)
    return props.categories;
  return props.categories.slice(0, visibleCount + 1); // +1 includes "All"
});
</script>

<style scoped>
/* ── Section wrapper ──────────────────────────────────────────── */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: #f8f9fb;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
}

/* ── Header row ───────────────────────────────────────────────── */
.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.filter-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #94a3b8;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: #94a3b8;
}

.selected-name {
  font-size: 11px;
  font-weight: 500;
  color: #6366f1;
}

/* Toggle button */
.toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all .15s ease;
  white-space: nowrap;
}
.toggle-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}
.toggle-btn.expanded {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #4f46e5;
}

/* ── Pills grid ───────────────────────────────────────────────── */
.pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

/* ── Individual pill ──────────────────────────────────────────── */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px;
  font-weight: 400;
  color: #64748b;
  cursor: pointer;
  white-space: nowrap;
  transition: all .15s ease;
  outline: none;
  line-height: 1;
}

.pill:hover:not(.active) {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.pill:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.pill.active {
  background: #0f172a;
  border-color: #0f172a;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(15,23,42,.2);
}

.check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: rgba(255,255,255,.2);
  flex-shrink: 0;
}
</style>