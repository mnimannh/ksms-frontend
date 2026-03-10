<template>
  <div class="controls-row">

    <!-- Search -->
    <div class="search-wrap">
      <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        :value="searchQuery"
        @input="$emit('update:searchQuery', $event.target.value)"
        type="text"
        placeholder="Search staff..."
        class="search-input"
      />
    </div>

    <!-- Filter Tabs -->
    <div class="filter-group">
      <button
        v-for="f in filters"
        :key="f.value"
        class="filter-btn"
        :class="{ active: activeFilter === f.value }"
        @click="$emit('update:activeFilter', f.value)"
      >
        {{ f.label }}
        <span class="filter-count" v-if="f.count !== undefined">{{ f.count }}</span>
      </button>
    </div>

    <!-- Period Selector + Staff Selector -->
    <div class="period-wrap">

      <!-- Staff Selector -->
      <div class="sel-wrap">
        <svg class="sel-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        <select
          :value="selectedStaffId"
          @change="$emit('update:selectedStaffId', $event.target.value === 'all' ? 'all' : +$event.target.value)"
          class="sel sel-with-icon"
        >
          <option value="all">All Staff</option>
          <option
            v-for="s in staffOptions"
            :key="s.userID"
            :value="s.userID"
          >
            {{ s.name }}
          </option>
        </select>
      </div>

      <!-- Month -->
      <select :value="selectedMonth" @change="$emit('update:selectedMonth', +$event.target.value)" class="sel">
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>

      <!-- Year -->
      <select :value="selectedYear" @change="$emit('update:selectedYear', +$event.target.value)" class="sel">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

    </div>

    <!-- Generate All -->
    <button class="btn-gen-all" @click="$emit('generate-all')" :disabled="isGeneratingAll || pendingCount === 0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
      {{ isGeneratingAll ? 'Generating…' : `Generate All (${pendingCount})` }}
    </button>

  </div>
</template>

<script>
export default {
  name: 'PayrollControls',
  emits: [
    'update:searchQuery',
    'update:activeFilter',
    'update:selectedMonth',
    'update:selectedYear',
    'update:selectedStaffId',
    'generate-all',
  ],
  props: {
    searchQuery:     { type: String,  default: '' },
    activeFilter:    { type: String,  default: 'all' },
    selectedMonth:   { type: Number,  required: true },
    selectedYear:    { type: Number,  required: true },
    selectedStaffId: { type: String,  default: 'all' },
    staffOptions:    { type: Array,   default: () => [] },
    pendingCount:    { type: Number,  default: 0 },
    isGeneratingAll: { type: Boolean, default: false },
    months:          { type: Array,   required: true },
    years:           { type: Array,   required: true },
    filterCounts:    { type: Object,  default: () => ({}) },
  },
  computed: {
    filters() {
      return [
        { value: 'all',       label: 'All',       count: this.filterCounts.all },
        { value: 'pending',   label: 'Pending',   count: this.filterCounts.pending },
        { value: 'generated', label: 'Generated', count: this.filterCounts.generated },
        { value: 'received',  label: 'Received',  count: this.filterCounts.received },
      ]
    },
  },
}
</script>

<style scoped>
.controls-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 180px;
  max-width: 240px;
}
.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 8px 12px 8px 32px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #1e293b;
  background: #fff;
  outline: none;
  transition: border-color .15s;
}
.search-input:focus { border-color: #6366f1; }

.filter-group { display: flex; gap: 5px; }
.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 13px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #64748b;
  cursor: pointer;
  transition: all .15s;
}
.filter-btn:hover { border-color: #6366f1; color: #6366f1; }
.filter-btn.active { background: #6366f1; border-color: #6366f1; color: #fff; font-weight: 500; }
.filter-count {
  background: rgba(255,255,255,0.25);
  border-radius: 4px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}
.filter-btn:not(.active) .filter-count {
  background: #f1f5f9;
  color: #475569;
}

.period-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.sel-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.sel-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #6366f1;
  pointer-events: none;
  z-index: 1;
}

.sel {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #1e293b;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: border-color .15s;
  appearance: auto;
}
.sel:focus { border-color: #6366f1; }

.sel-with-icon {
  padding-left: 30px;
  border-color: #c7d2fe;
  color: #4338ca;
  font-weight: 500;
  background: #eef2ff;
  min-width: 160px;
}
.sel-with-icon:focus { border-color: #6366f1; }

.btn-gen-all {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 16px;
  background: #0f172a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background .15s, opacity .15s;
}
.btn-gen-all:hover:not(:disabled) { background: #1e293b; }
.btn-gen-all:disabled { opacity: .45; cursor: not-allowed; }

@media(max-width:700px){
  .controls-row { flex-direction: column; align-items: stretch; }
  .search-wrap  { max-width: 100%; }
  .period-wrap  { margin-left: 0; flex-wrap: wrap; }
}
</style>