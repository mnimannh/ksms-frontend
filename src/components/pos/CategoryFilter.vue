<template>
  <div class="filter-section">

    <!-- Top row: label + controls -->
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

      <div class="header-actions">
        <!-- Count badge -->
        <span class="count-badge" v-if="categories.length > MANY_THRESHOLD">
          {{ categories.length }} categories
        </span>

        <!-- Toggle btn: only shown when NOT in "many" mode -->
        <button
          v-if="!isManyMode && categories.length > visibleCount + 1"
          class="toggle-btn"
          @click="expanded = !expanded"
          :class="{ expanded }"
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
    </div>

    <!-- ── MANY MODE: search + scrollable list ───────────────── -->
    <template v-if="isManyMode">

      <!-- Search input -->
      <div class="search-wrap">
        <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          ref="searchInput"
          v-model="query"
          class="search-input"
          placeholder="Search categories…"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />
        <button v-if="query" class="clear-btn" @click="query = ''" title="Clear">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Scrollable pill list -->
      <div class="scroll-pills-wrap" ref="scrollWrap">
        <template v-if="filteredCategories.length">
          <button
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="pill"
            :class="{ active: selectedId === cat.id }"
            @click="$emit('filter', cat.id)"
          >
            <!-- Highlight matching text -->
            <span v-html="highlight(cat.name)" />
            <span class="check-icon" v-if="selectedId === cat.id">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </button>
        </template>
        <div v-else class="no-results">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          No categories match "<strong>{{ query }}</strong>"
        </div>
      </div>

      <!-- Result count -->
      <div class="result-count" v-if="query">
        {{ filteredCategories.length }} of {{ categories.length }} shown
      </div>

    </template>

    <!-- ── FEW MODE: original pill grid with expand/collapse ── -->
    <template v-else>
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
    </template>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps(['categories', 'selectedId']);
defineEmits(['filter']);

// ── Thresholds ──────────────────────────────────────────────────
const MANY_THRESHOLD = 20;   // Switch to search mode above this
const visibleCount   = 9;    // Visible pills before "show more"

// ── State ───────────────────────────────────────────────────────
const expanded    = ref(false);
const query       = ref('');
const searchInput = ref(null);
const scrollWrap  = ref(null);

// ── Computed ────────────────────────────────────────────────────
const isManyMode = computed(() =>
  props.categories.length > MANY_THRESHOLD
);

const selectedCategory = computed(() =>
  props.categories.find(c => c.id === props.selectedId)
);

const hiddenCount = computed(() =>
  Math.max(0, props.categories.length - visibleCount - 1)
);

const visibleCategories = computed(() => {
  if (expanded.value || props.categories.length <= visibleCount + 1)
    return props.categories;
  return props.categories.slice(0, visibleCount + 1);
});

const filteredCategories = computed(() => {
  if (!query.value.trim()) return props.categories;
  const q = query.value.toLowerCase();
  return props.categories.filter(c => c.name.toLowerCase().includes(q));
});

// Reset scroll on search
watch(query, () => {
  if (scrollWrap.value) scrollWrap.value.scrollTop = 0;
});

// Highlight matched query text inside pill name
function highlight(name) {
  if (!query.value.trim()) return name;
  const escaped = query.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return name.replace(
    new RegExp(`(${escaped})`, 'gi'),
    '<mark>$1</mark>'
  );
}
</script>

<style scoped>
/* ── Section wrapper ──────────────────────────────────────────── */
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 14px;
  background: #f8fafc;
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.count-badge {
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  background: #e2e8f0;
  border-radius: 20px;
  padding: 2px 8px;
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
  font-family: inherit;
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
  border-color: #6366f1;
  color: #4f46e5;
}

/* ── Search input ─────────────────────────────────────────────── */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: #94a3b8;
  pointer-events: none;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  padding: 7px 32px 7px 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-family: inherit;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: border-color .15s, box-shadow .15s;
}

.search-input::placeholder { color: #94a3b8; }

.search-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.clear-btn {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: #e2e8f0;
  color: #64748b;
  cursor: pointer;
  transition: all .15s;
}
.clear-btn:hover {
  background: #cbd5e1;
  color: #1e293b;
}

/* ── Scrollable pills container ───────────────────────────────── */
.scroll-pills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  max-height: 160px;
  overflow-y: auto;
  padding-right: 4px;

  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.scroll-pills-wrap::-webkit-scrollbar {
  width: 4px;
}
.scroll-pills-wrap::-webkit-scrollbar-track {
  background: transparent;
}
.scroll-pills-wrap::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.scroll-pills-wrap::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* ── Result count hint ────────────────────────────────────────── */
.result-count {
  font-size: 11px;
  color: #94a3b8;
  text-align: right;
  margin-top: -4px;
}

/* ── No results ───────────────────────────────────────────────── */
.no-results {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 4px;
  font-size: 12.5px;
  color: #94a3b8;
  width: 100%;
}

/* ── Original pills grid (few mode) ──────────────────────────── */
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
  font-family: inherit;
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
  background: #eef2ff;
  border-color: #a5b4fc;
  color: #4f46e5;
}

.pill:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

.pill.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(99,102,241,.3);
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

/* Highlight matched text in search */
:deep(mark) {
  background: #fef08a;
  color: #1e293b;
  border-radius: 2px;
  padding: 0 1px;
}
</style>
