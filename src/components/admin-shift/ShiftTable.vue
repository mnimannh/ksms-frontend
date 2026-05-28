<template>
  <div class="staff-table-section">
    <div class="panel-head">
      <span class="panel-title">ALL ASSIGNED SHIFTS</span>
      <div class="head-controls">

        <!-- NEW: Month Navigation -->
        <div class="month-nav">
          <button class="month-btn" @click="prevMonth" title="Previous Month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="month-label">{{ displayMonthYear }}</span>
          <button class="month-btn" @click="nextMonth" title="Next Month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        <label class="date-pill" :class="{ active: dateFilter }">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span class="date-pill-text">{{ dateFilter ? formatDisplayDate(dateFilter) : 'Filter by date' }}</span>
          <input type="date" class="date-hidden" v-model="dateFilter" />
          <button v-if="dateFilter" class="date-clear" @click.prevent="dateFilter = ''">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </label>

        <div class="dropdown-wrapper" ref="dropdownRef">
          <div 
            class="date-pill" 
            :class="{ active: userFilter || isDropdownOpen }" 
            @click="isDropdownOpen = !isDropdownOpen"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <span class="date-pill-text">{{ userFilter ? userFilter : 'Filter by staff' }}</span>
            <button v-if="userFilter" class="date-clear" @click.prevent.stop="userFilter = ''">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <transition name="dropdown-fade">
            <div class="custom-dropdown-panel" v-if="isDropdownOpen">
              <div 
                class="dropdown-item" 
                :class="{ selected: userFilter === '' }"
                @click="selectUser('')"
              >
                All Staff
              </div>
              <div 
                v-for="user in uniqueStaff" 
                :key="user" 
                class="dropdown-item"
                :class="{ selected: userFilter === user }"
                @click="selectUser(user)"
              >
                {{ user }}
              </div>
            </div>
          </transition>
        </div>

        <div class="search-wrap">
          <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="search-input"
            :value="searchQuery"
            @input="onSearchInput"
            placeholder="Search staff or shift…"
          />
        </div>
      </div>
    </div>

    <div class="table-wrap">
      <table class="shift-table">
        <thead>
          <tr>
            <th class="th-num">#</th>
            <th>Staff</th>
            <th>Shift Type</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Assigned By</th>
            <th>Check In</th>
            <th>Check Out</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedRows" :key="row.id" class="table-row">
            <td class="td-num">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td>
              <div class="staff-cell">
                {{ row.staffName }}
              </div>
            </td>
            <td>
              <span class="type-pill" :class="row.shiftType.toLowerCase()">
                {{ row.shiftType }}
              </span>
            </td>
            <td class="mono">{{ formatShortDate(row.startTime) }}</td>
            <td class="mono">{{ formatTime(row.startTime) }}</td>
            <td class="mono">{{ formatTime(row.endTime) }}</td>
            <td class="muted">{{ row.assignedBy }}</td>
            <td class="mono" v-html="row.checkIn ? formatTime(row.checkIn) : '<span class=\'dash\'>—</span>'"></td>
            <td class="mono" v-html="row.checkOut ? formatTime(row.checkOut) : '<span class=\'dash\'>—</span>'"></td>
            <td>
              <span class="status-pill" :class="'pill-' + (row.attendanceStatus || 'pending').toLowerCase()">
                {{ row.attendanceStatus || 'Pending' }}
              </span>
            </td>
            <td>
              <div class="action-btns">
                <button class="act-btn edit" @click="$emit('edit-shift', row)" title="Edit">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="act-btn view" @click="$emit('view-log', row.id)" title="View Log">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <button class="act-btn delete" @click="openConfirm(row.id)" title="Delete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredRows.length === 0">
            <td colspan="11" class="empty-td">No shifts found for this month/filter.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredRows.length > 0" class="pagination-panel">
      <div class="pagination-info">
        Showing <span>{{ startItemIndex }}</span> to <span>{{ endItemIndex }}</span> of <span>{{ filteredRows.length }}</span> entries
      </div>
      <div class="pagination-controls">
        <button 
          class="page-btn" 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        
        <button 
          v-for="page in totalPages" 
          :key="page" 
          class="page-btn num-btn"
          :class="{ active: page === currentPage }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>

        <button 
          class="page-btn" 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="modal">
      <div v-if="confirmDialog.show" class="modal-backdrop" @click.self="cancelConfirm">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">

          <div class="modal-icon-wrap">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>

          <h2 id="modal-title" class="modal-title">Delete Shift</h2>
          <p class="modal-body">This shift will be permanently removed and cannot be recovered. Are you sure you want to continue?</p>

          <div class="modal-actions">
            <button class="btn-cancel" @click="cancelConfirm">Cancel</button>
            <button class="btn-delete" @click="confirmDelete">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Delete shift
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'ShiftTable',
  props: {
    rows:        { type: Array,  required: true },
    searchQuery: { type: String, default: ''    },
  },
  emits: ['update:searchQuery', 'edit-shift', 'view-log', 'delete-shift'],
  data() {
    const today = new Date();
    return {
      confirmDialog: { show: false, shiftId: null },
      dateFilter: '',
      userFilter: '',
      isDropdownOpen: false,
      currentPage: 1,
      itemsPerPage: 10,
      
      // Initialize with current month and year
      selectedMonth: today.getMonth(),
      selectedYear: today.getFullYear(),
    };
  },
  watch: {
    dateFilter(newVal) {
      this.currentPage = 1;
      // Automatically jump to the month of the selected date
      if (newVal) {
        const d = new Date(newVal);
        this.selectedMonth = d.getMonth();
        this.selectedYear = d.getFullYear();
      }
    },
    userFilter() {
      this.currentPage = 1;
    }
  },
  computed: {
    displayMonthYear() {
      const d = new Date(this.selectedYear, this.selectedMonth, 1);
      return d.toLocaleDateString('en-MY', { month: 'short', year: 'numeric' });
    },
    uniqueStaff() {
      const staffSet = new Set(this.rows.map(row => row.staffName).filter(Boolean));
      return Array.from(staffSet).sort();
    },
    filteredRows() {
      return this.rows.filter(row => {
        // 1. Month and Year check
        let matchesMonth = true;
        if (row.startTime) {
          const rowDate = new Date(row.startTime);
          matchesMonth = rowDate.getMonth() === this.selectedMonth && 
                         rowDate.getFullYear() === this.selectedYear;
        }

        // 2. Specific Date Filter
        let matchesDate = true;
        if (this.dateFilter) {
          const rowDateStr = row.startTime ? row.startTime.slice(0, 10) : '';
          matchesDate = rowDateStr === this.dateFilter;
        }

        // 3. User Filter
        let matchesUser = true;
        if (this.userFilter) {
          matchesUser = row.staffName === this.userFilter;
        }

        return matchesMonth && matchesDate && matchesUser;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredRows.length / this.itemsPerPage) || 1;
    },
    paginatedRows() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredRows.slice(start, end);
    },
    startItemIndex() {
      if (this.filteredRows.length === 0) return 0;
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    endItemIndex() {
      const projectedEnd = this.currentPage * this.itemsPerPage;
      return projectedEnd > this.filteredRows.length ? this.filteredRows.length : projectedEnd;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  },
  methods: {
    prevMonth() {
      if (this.selectedMonth === 0) {
        this.selectedMonth = 11;
        this.selectedYear--;
      } else {
        this.selectedMonth--;
      }
      this.currentPage = 1;
    },
    nextMonth() {
      if (this.selectedMonth === 11) {
        this.selectedMonth = 0;
        this.selectedYear++;
      } else {
        this.selectedMonth++;
      }
      this.currentPage = 1;
    },
    selectUser(user) {
      this.userFilter = user;
      this.isDropdownOpen = false;
    },
    handleClickOutside(event) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(event.target)) {
        this.isDropdownOpen = false;
      }
    },
    onSearchInput(event) {
      this.currentPage = 1;
      this.$emit('update:searchQuery', event.target.value);
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    formatTime(val) {
      if (!val) return '—';
      return new Date(val).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
    },
    formatShortDate(val) {
      if (!val) return '—';
      return new Date(val).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
    },
    formatDisplayDate(dateStr) {
      if (!dateStr) return '';
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
    },
    openConfirm(id) {
      this.confirmDialog = { show: true, shiftId: id };
    },
    confirmDelete() {
      this.$emit('delete-shift', this.confirmDialog.shiftId);
      this.confirmDialog = { show: false, shiftId: null };
    },
    cancelConfirm() {
      this.confirmDialog = { show: false, shiftId: null };
    },
  },
};
</script>

<style scoped>
.staff-table-section {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  overflow: visible;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f1f5f9;
}
.panel-title {
  font-family: 'DM Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.15em;
  color: #94a3b8;
  font-weight: 600;
}
.head-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── NEW: Month Navigation Styles ── */
.month-nav {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}
.month-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.month-btn:hover {
  background: #e2e8f0;
  color: #0f172a;
}
.month-label {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 600;
  color: #334155;
  min-width: 76px;
  text-align: center;
  user-select: none;
}

/* ── Date and Dropdown pill styles ── */
.date-pill {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #64748b;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
  user-select: none;
}
.date-pill:hover {
  border-color: #a5b4fc;
  background: #eef2ff;
  color: #4f46e5;
}
.date-pill.active {
  border-color: #6366f1;
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 600;
}
.date-pill svg { flex-shrink: 0; }
.date-pill-text { line-height: 1; }

.date-hidden {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  cursor: pointer;
  border: none;
  background: transparent;
}
.date-hidden::-webkit-calendar-picker-indicator {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.date-clear {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: none;
  background: #c7d2fe;
  color: #4f46e5;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
  transition: background 0.12s;
}
.date-clear:hover { background: #a5b4fc; }

/* ── CUSTOM DROPDOWN UI STYLES ── */
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.custom-dropdown-panel {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  min-width: 210px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 4px 12px -2px rgba(15, 23, 42, 0.05);
  padding: 6px;
  z-index: 100;
  max-height: 260px;
  overflow-y: auto;
}

/* Custom scrollbar styling for the drop panel */
.custom-dropdown-panel::-webkit-scrollbar {
  width: 6px;
}
.custom-dropdown-panel::-webkit-scrollbar-track {
  background: transparent;
}
.custom-dropdown-panel::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.dropdown-item {
  padding: 8px 12px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  color: #334155;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.1s ease, color 0.1s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.dropdown-item.selected {
  background: #eef2ff;
  color: #4f46e5;
  font-weight: 600;
}

/* Dropdown Animation Transitions */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Search ── */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 9px;
  color: #94a3b8;
  pointer-events: none;
}
.search-input {
  padding-left: 28px !important;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  border: 1px solid #f1f5f9;
  border-radius: 7px;
  padding: 7px 12px;
  color: #0f172a;
  background: #f8fafc;
  outline: none;
  width: 200px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

.table-wrap { overflow-x: auto; }
.shift-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
.shift-table thead tr { border-bottom: 2px solid #f1f5f9; }
.shift-table th {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #94a3b8;
  padding: 10px 14px;
  text-align: left;
  white-space: nowrap;
}
.shift-table td {
  padding: 11px 14px;
  color: #334155;
  border-bottom: 1px solid #f8fafc;
  font-size: 0.78rem;
  vertical-align: middle;
}
.table-row:hover td { background: #f8fafc; }
.mono  { font-family: 'DM Mono', monospace; font-size: 0.72rem; }
.muted { color: #94a3b8; }
.th-num { width: 36px; text-align: center; }
.td-num { font-family: 'DM Mono', monospace; font-size: 0.7rem; color: #cbd5e1; text-align: center; }

.staff-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #0f172a;
}

.type-pill {
  font-family: 'DM Mono', monospace;
  font-size: 0.65rem;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 4px;
  white-space: nowrap;
}
.type-pill.morning { background: #fef3c7; color: #92400e; }
.type-pill.evening { background: #dbeafe; color: #1e40af; }

.status-pill {
  font-family: 'DM Mono', monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  white-space: nowrap;
}
.pill-completed { background: #dcfce7; color: #16a34a; }
.pill-late      { background: #fef3c7; color: #d97706; }
.pill-missed    { background: #fee2e2; color: #dc2626; }
.pill-pending   { background: #f1f5f9; color: #64748b; }

.action-btns { display: flex; gap: 6px; }
.act-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1.5px solid;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  flex-shrink: 0;
}
.act-btn.edit   { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
.act-btn.view   { background: #f0fdf4; border-color: #bbf7d0; color: #16a34a; }
.act-btn.delete { background: #fef2f2; border-color: #fecaca; color: #dc2626; }
.act-btn.edit:hover   { background: #2563eb; border-color: #2563eb; color: #fff; }
.act-btn.view:hover   { background: #16a34a; border-color: #16a34a; color: #fff; }
.act-btn.delete:hover { background: #dc2626; border-color: #dc2626; color: #fff; }

.empty-td {
  text-align: center;
  color: #cbd5e1;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  padding: 32px;
}

/* ── Pagination Panel ── */
.pagination-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-top: 1px solid #f1f5f9;
  background: #fff;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}
.pagination-info {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  color: #64748b;
}
.pagination-info span {
  font-weight: 600;
  color: #0f172a;
}
.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: #cbd5e1;
  color: #0f172a;
  background: #f8fafc;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.num-btn {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  font-weight: 500;
}
.num-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
  font-weight: 600;
}

/* ── Delete Confirmation Modal ─────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 16px;
}

.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 32px 28px 24px;
  width: 100%;
  max-width: 380px;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18), 0 4px 16px rgba(15, 23, 42, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
}

.modal-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: #fff1f2;
  border: 1px solid #fecdd3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #e11d48;
  margin-bottom: 20px;
}

.modal-title {
  font-size: 1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
  letter-spacing: -0.02em;
}

.modal-body {
  font-size: 0.82rem;
  color: #64748b;
  line-height: 1.65;
  margin-bottom: 24px;
  max-width: 280px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  width: 100%;
}

.btn-cancel {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #334155;
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.14s, border-color 0.14s;
}

.btn-cancel:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-delete {
  flex: 1;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background: #e11d48;
  border: 1.5px solid #e11d48;
  border-radius: 9px;
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition: background 0.14s, transform 0.1s, box-shadow 0.14s;
}

.btn-delete:hover {
  background: #be123c;
  border-color: #be123c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(225, 29, 72, 0.3);
}

.btn-delete:active {
  transform: translateY(0);
  box-shadow: none;
}

/* ── Modal transition ── */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.95) translateY(8px);
  opacity: 0;
}
</style>