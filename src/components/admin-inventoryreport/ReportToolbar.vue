<template>
  <div class="toolbar no-print">
    <div class="breadcrumb">
      <span class="bc-root">Reports</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      <span class="bc-current">Inventory Report</span>
    </div>

    <div class="toolbar-right">
      <div class="filter-group">
        <label class="filter-label">Month</label>
        <select :value="selectedMonth" @change="$emit('update:selectedMonth', +$event.target.value)" class="filter-select">
          <option v-for="(m, i) in months" :key="i" :value="i">{{ m }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Year</label>
        <select :value="selectedYear" @change="$emit('update:selectedYear', +$event.target.value)" class="filter-select">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Category</label>
        <!-- bound to categoryId (number) so selected option always highlights correctly -->
        <select :value="categoryId" @change="onCategoryChange($event.target.value)" class="filter-select">
          <option :value="null">All</option>
          <option
            v-for="c in categoriesWithoutBlank"
            :key="c.id"
            :value="c.id"
          >{{ c.name }}</option>
        </select>
      </div>

      <div class="btn-group">
        <button class="btn-generate" @click="$emit('generate')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
          </svg>
          Generate Report
        </button>
        <button class="btn-print" @click="$emit('print')" :disabled="!generated">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print / PDF
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportToolbar',
  emits: ['update:selectedMonth', 'update:selectedYear', 'update:categoryFilter', 'update:categoryId', 'generate', 'print'],
  props: {
    selectedMonth:  { type: Number,  required: true },
    selectedYear:   { type: Number,  required: true },
    categoryFilter: { type: String,  default: '' },   // category name — for report header label
    categoryId:     { default: null },                // category id   — for API call
    months:         { type: Array,   required: true },
    years:          { type: Array,   required: true },
    categories:     { type: Array,   required: true }, // [{ id, name }]
    generated:      { type: Boolean, default: false },
  },

  computed: {
    categoriesWithoutBlank() {
      return this.categories.filter(c => c.id !== null && c.name !== '')
    },
  },

  methods: {
    onCategoryChange(val) {
      const id    = val === '' || val === 'null' ? null : parseInt(val, 10)
      const found = this.categories.find(c => c.id === id)
      const name  = found ? found.name : ''

      this.$emit('update:categoryFilter', name)  // name string → report header
      this.$emit('update:categoryId',     id)    // numeric id  → API param
    },
  },
}
</script>

<style scoped>
.toolbar {
  display: flex; align-items: center;
  justify-content: space-between;
  flex-wrap: wrap; gap: 14px;
}
.breadcrumb { display: flex; align-items: center; gap: 6px; font-size: 13px; }
.bc-root    { color: #94a3b8; }
.bc-current { color: #1e293b; font-weight: 500; }
.breadcrumb svg { color: #cbd5e1; }

.toolbar-right { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; }

.filter-group { display: flex; flex-direction: column; gap: 4px; }
.filter-label {
  font-size: 11px; font-weight: 600; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .06em;
}
.filter-select {
  padding: 8px 12px;
  border: 1px solid #dde1e9; border-radius: 8px;
  background: #fff; font-size: 13px;
  font-family: 'DM Sans', sans-serif; color: #334155;
  outline: none; cursor: pointer;
  transition: border-color .15s; min-width: 130px;
}
.filter-select:focus { border-color: #6366f1; }

.btn-group { display: flex; gap: 8px; align-self: flex-end; }

.btn-generate {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-generate:hover { background: #4f46e5; }

.btn-print {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px;
  border: 1px solid #dde1e9; border-radius: 8px;
  background: #fff; color: #475569;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 500;
  cursor: pointer; transition: all .15s;
}
.btn-print:hover:not(:disabled) { border-color: #6366f1; color: #6366f1; }
.btn-print:disabled { opacity: .4; cursor: not-allowed; }
</style>