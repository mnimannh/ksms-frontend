<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="dashboard">

      <!-- ── TOP BAR ─────────────────────────────────────────── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-eyebrow">Inventory</p>
          <h1 class="topbar-title">Low Stock <span class="accent">Alerts</span></h1>
        </div>
        <div class="topbar-right" v-if="unreadCount > 0">
          <div class="alert-chip active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>{{ unreadCount }} Unread Alert{{ unreadCount !== 1 ? 's' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- ── TOOLBAR ────────────────────────────────────────── -->
      <div class="toolbar">
        <div class="toolbar-left">

          <div class="time-filter">
            <button
              v-for="t in timeOptions"
              :key="t"
              :class="['time-btn', selectedTime === t ? 'active' : '']"
              @click="selectedTime = t"
            >{{ t }}</button>
          </div>

          <div class="dropdown">
            <button class="btn-filter">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <span class="filter-label">Status:</span>
              <span class="filter-value">{{ statusLabel }}</span>
              <svg class="arrow-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="dropdown-menu">
              <div @click="statusFilter = 'all'"    class="dropdown-item" :class="{ active: statusFilter === 'all' }">All Status</div>
              <div @click="statusFilter = 'unread'" class="dropdown-item" :class="{ active: statusFilter === 'unread' }">Unread</div>
              <div @click="statusFilter = 'read'"   class="dropdown-item" :class="{ active: statusFilter === 'read' }">Read</div>
            </div>
          </div>

        </div>

        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="search" type="text" placeholder="Search variant…" />
          </div>
        </div>
      </div>

      <!-- ── TABLE PANEL ────────────────────────────────────── -->
      <div class="panel table-panel">

        <div class="card-header">
          <div>
            <p class="card-title">Stock Alerts</p>
            <p class="card-sub">Variants below reorder threshold</p>
          </div>
          <span class="badge red" v-if="unreadCount > 0">{{ unreadCount }} Unread</span>
          <span class="badge green" v-else>All Clear</span>
        </div>

        <div class="table-container">
          <table class="alarm-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Variant</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(alarm, index) in filteredAlarms"
                :key="alarm.id"
                class="table-row"
                :class="{ 'row-unread': !alarm.is_read }"
                :style="`animation-delay:${index * 40}ms`"
              >
                <td class="td-num">{{ index + 1 }}</td>

                <td class="td-variant">
                  <div class="variant-icon">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                      <rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/>
                      <path d="M4 8h8M8 4v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>
                  </div>
                  {{ alarm.variant }}
                </td>

                <td>
                  <span class="stock-value" :class="alarm.stock <= alarm.threshold ? 'stock-low' : 'stock-ok'">
                    <span class="stock-dot" />{{ alarm.stock }}
                  </span>
                </td>

                <td class="td-muted">{{ alarm.threshold }}</td>

                <td>
                  <span class="status-pill" :class="alarm.is_read ? 'status-read' : 'status-unread'">
                    <span class="status-dot" />
                    {{ alarm.is_read ? 'Read' : 'Unread' }}
                  </span>
                </td>

                <td class="td-muted">{{ formatDate(alarm.created_at) }}</td>

                <td>
                  <button
                    v-if="!alarm.is_read"
                    class="btn-mark"
                    @click="markAsRead(alarm.id)"
                  >Mark read</button>
                  <span v-else class="done-check">
                    <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                      <path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                </td>
              </tr>

              <tr v-if="filteredAlarms.length === 0">
                <td colspan="7" class="empty-state">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom:8px;opacity:.3">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                  <p>No alerts found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination">
          <span>Showing</span>
          <strong>{{ filteredAlarms.length }}</strong>
          <span>of</span>
          <strong>{{ alarms.length }}</strong>
          <span>alerts</span>
        </div>

      </div>

    </main>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import axios from 'axios'

export default {
  name: 'AdminAlarm',
  components: { AdminSidebar },

  data() {
    return {
      search: '',
      timeOptions: ['All', 'Today', 'Week', 'Month'],
      selectedTime: 'All',
      statusFilter: 'all',
      alarms: [
        {
          id: 2,
          variant: '500ml Can',
          stock: 100,
          threshold: 10,
          is_read: 1,
          created_at: '2026-03-04T17:18:02.000Z'
        },
        {
          id: 1,
          variant: '330ml Bottle',
          stock: 9,
          threshold: 10,
          is_read: 0,
          created_at: '2026-03-04T16:43:26.000Z'
        }
      ]
    }
  },

  computed: {
    statusLabel() {
      if (this.statusFilter === 'unread') return 'Unread'
      if (this.statusFilter === 'read') return 'Read'
      return 'All'
    },
    unreadCount() {
      return this.alarms.filter(a => !a.is_read).length
    },
    filteredAlarms() {
      return this.alarms.filter(a => {
        const matchSearch = a.variant.toLowerCase().includes(this.search.toLowerCase())

        const date = new Date(a.created_at)
        const now = new Date()
        let matchTime = true
        if (this.selectedTime === 'Today') {
          matchTime = date.toDateString() === now.toDateString()
        } else if (this.selectedTime === 'Week') {
          const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
          matchTime = diffDays <= 7
        } else if (this.selectedTime === 'Month') {
          matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        }

        let matchStatus = true
        const readValue = Number(a.is_read)
        if (this.statusFilter === 'unread') matchStatus = readValue === 0
        if (this.statusFilter === 'read')   matchStatus = readValue === 1

        return matchSearch && matchTime && matchStatus
      })
    }
  },

  methods: {
    async fetchAlarms() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/alarm`)
        this.alarms = res.data
      } catch (err) {
        console.error('Failed to fetch alarms:', err)
      }
    },

    async markAsRead(id) {
      try {
        await axios.patch(`${API_BASE_URL}/api/alarm/read/${id}`)
        const alarm = this.alarms.find(a => a.id === id)
        if (alarm) alarm.is_read = 1
      } catch (err) {
        console.error('Failed to mark alarm as read:', err)
      }
    },

    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    }
  },

  mounted() {
    this.fetchAlarms()
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
/* ── Reset & Base ──────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f6f7fb;
  font-family: 'DM Sans', sans-serif;
  color: #1e293b;
}

.dashboard {
  flex: 1;
  padding: 32px 36px 48px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Top Bar ───────────────────────────────────────────────────── */
.topbar {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.topbar-eyebrow {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 4px;
}
.topbar-title {
  font-size: 26px;
  font-weight: 600;
  letter-spacing: -.025em;
  color: #0f172a;
}
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 12px; }

.alert-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px; color: #64748b;
}
.alert-chip.active {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #dc2626;
  font-weight: 500;
}

/* ── Toolbar ───────────────────────────────────────────────────── */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar-left  { display: flex; align-items: center; gap: 10px; }
.toolbar-right { display: flex; align-items: center; gap: 10px; }

/* Time pill group */
.time-filter {
  display: flex;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 3px;
  gap: 2px;
}
.time-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  color: #64748b;
  background: transparent;
  border: none;
  padding: 5px 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all .15s;
}
.time-btn:hover  { background: #f1f5f9; color: #334155; }
.time-btn.active { background: #6366f1; color: #fff; }

/* Dropdown */
.dropdown { position: relative; display: inline-block; }
.btn-filter {
  display: flex; align-items: center; gap: 7px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 7px 14px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #334155;
  transition: border-color .15s;
}
.btn-filter:hover { border-color: #cbd5e1; }
.filter-label { color: #94a3b8; font-size: 12px; }
.filter-value { font-weight: 500; color: #0f172a; }
.arrow-icon   { color: #94a3b8; }

.dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #fff;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08), 0 1px 4px rgba(0,0,0,.04);
  border: 1px solid #f1f5f9;
  border-radius: 11px;
  z-index: 10;
  overflow: hidden;
  padding: 4px;
}
.dropdown:hover .dropdown-menu { display: block; }
.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  border-radius: 7px;
  transition: background .12s;
}
.dropdown-item:hover  { background: #f8fafc; }
.dropdown-item.active { background: #f1f5f9; font-weight: 500; color: #0f172a; }

/* Search */
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  padding: 7px 14px;
  transition: border-color .18s, box-shadow .18s;
}
.search-box:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}
.search-icon { color: #94a3b8; flex-shrink: 0; }
.search-box input {
  border: none; outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1e293b;
  width: 200px; background: transparent;
}
.search-box input::placeholder { color: #cbd5e1; }

/* ── Panel ─────────────────────────────────────────────────────── */
.panel {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

.card-header {
  display: flex; align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}
.card-title { font-size: 14.5px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }

.badge {
  display: inline-flex; align-items: center;
  padding: 4px 11px; border-radius: 6px;
  font-size: 12px; font-weight: 600; white-space: nowrap;
}
.badge.red   { background: #fef2f2; color: #dc2626; }
.badge.green { background: #f0fdf4; color: #15803d; }

/* ── Table ─────────────────────────────────────────────────────── */
.table-container {
  border: 1px solid #f1f5f9;
  border-radius: 11px;
  overflow: hidden;
}

.alarm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.alarm-table thead tr {
  border-bottom: 1px solid #f1f5f9;
}

.alarm-table th {
  background: #f8fafc;
  text-align: left;
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #94a3b8;
}

.alarm-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f8fafc;
  color: #374151;
  vertical-align: middle;
}

.table-row {
  animation: fadeUp .35s ease both;
}
.table-row:last-child td { border-bottom: none; }
.table-row:hover td      { background: #fafbfc; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.row-unread td:first-child {
  border-left: 3px solid #ef4444;
}

.td-num {
  color: #cbd5e1;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  width: 40px;
}

.td-variant {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 500;
  color: #0f172a;
}

.variant-icon {
  width: 28px; height: 28px;
  border-radius: 7px;
  background: #f1f5f9;
  display: flex; align-items: center; justify-content: center;
  color: #94a3b8;
  flex-shrink: 0;
}

.td-muted {
  color: #94a3b8;
  font-size: 12.5px;
  font-family: 'DM Mono', monospace;
}

/* Stock value */
.stock-value {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 13px; font-weight: 500;
}
.stock-value .stock-dot {
  width: 6px; height: 6px;
  border-radius: 50%; flex-shrink: 0;
}
.stock-low              { color: #dc2626; }
.stock-low  .stock-dot  { background: #ef4444; }
.stock-ok               { color: #15803d; }
.stock-ok   .stock-dot  { background: #22c55e; }

/* Status pill */
.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 5px;
  font-size: 11.5px; font-weight: 500;
}
.status-dot { width: 5px; height: 5px; border-radius: 50%; }

.status-read            { background: #f0fdf4; color: #15803d; }
.status-read .status-dot { background: #22c55e; }

.status-unread            { background: #fef2f2; color: #dc2626; }
.status-unread .status-dot { background: #ef4444; }

/* Mark button */
.btn-mark {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #374151;
  padding: 5px 13px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.btn-mark:hover {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

/* Done check */
.done-check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #15803d;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 48px 20px;
  color: #cbd5e1;
  font-size: 13px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 14px;
  font-size: 12px;
  color: #94a3b8;
}
.pagination strong { color: #374151; font-weight: 600; }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 700px) {
  .dashboard { padding: 18px 16px 36px; }
  .topbar-title { font-size: 20px; }
  .toolbar { flex-direction: column; align-items: flex-start; }
}
</style>