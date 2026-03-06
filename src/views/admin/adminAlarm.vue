<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <header class="page-header">
        <div class="header-title">
          <span class="header-eyebrow">Inventory</span>
          <h1>Low Stock Alerts</h1>
        </div>
        <div class="header-meta" v-if="unreadCount > 0">
          <span class="unread-badge">{{ unreadCount }} unread</span>
        </div>
      </header>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="time-filter">
            <button
              v-for="t in timeOptions"
              :key="t"
              :class="['time-btn', selectedTime === t ? 'active' : '']"
              @click="selectedTime = t"
            >
              {{ t }}
            </button>
          </div>

          <div class="dropdown">
            <button class="btn-filter">
              <span class="filter-label">Status</span>
              <span class="filter-value">{{ statusLabel }}</span>
              <svg class="arrow-icon" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
            <div class="dropdown-menu">
              <div @click="statusFilter = 'all'" class="dropdown-item" :class="{ active: statusFilter === 'all' }">All Status</div>
              <div @click="statusFilter = 'unread'" class="dropdown-item" :class="{ active: statusFilter === 'unread' }">Unread</div>
              <div @click="statusFilter = 'read'" class="dropdown-item" :class="{ active: statusFilter === 'read' }">Read</div>
            </div>
          </div>
        </div>

        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="search" type="text" placeholder="Search variant..." />
          </div>
        </div>
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
            <tr v-for="(alarm, index) in filteredAlarms" :key="alarm.id" class="table-row" :class="{ 'row-unread': !alarm.is_read }">
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
                  <span class="stock-dot"></span>{{ alarm.stock }}
                </span>
              </td>
              <td class="td-muted">{{ alarm.threshold }}</td>
              <td>
                <span class="status-pill" :class="alarm.is_read ? 'status-read' : 'status-unread'">
                  <span class="status-dot"></span>
                  {{ alarm.is_read ? 'Read' : 'Unread' }}
                </span>
              </td>
              <td class="td-muted">{{ formatDate(alarm.created_at) }}</td>
              <td>
                <button
                  v-if="!alarm.is_read"
                  class="btn-mark"
                  @click="markAsRead(alarm.id)"
                >
                  Mark read
                </button>
                <span v-else class="done-check">
                  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                    <path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </td>
            </tr>

            <tr v-if="filteredAlarms.length === 0">
              <td colspan="7" class="empty-state">No alerts found</td>
            </tr>
          </tbody>
        </table>
      </div>

<footer class="pagination">
  <span>Showing</span>
  <strong>{{ filteredAlarms.length }}</strong>
  <span>of</span>
  <strong>{{ alarms.length }}</strong>
  <span>alerts</span>
</footer>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'

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
        if (this.statusFilter === 'read') matchStatus = readValue === 1

        return matchSearch && matchTime && matchStatus
      })
    }
  },

  methods: {
    async fetchAlarms() {
      try {
        const res = await fetch('http://localhost:3000/api/alarm')
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        this.alarms = await res.json()
      } catch (err) {
        console.error('Failed to fetch alarms:', err)
      }
    },

    async markAsRead(id) {
      try {
        const res = await fetch(`http://localhost:3000/api/alarm/read/${id}`, { method: 'PATCH' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
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
    // this.fetchAlarms()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.admin-container {
  display: flex;
  font-family: 'DM Sans', sans-serif;
  background-color: #f7f8fa;
  min-height: 100vh;
  color: #1a1d23;
}

.main-content {
  flex: 1;
  padding: 36px 40px;
  max-width: 100%;
}

/* ── Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.header-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 4px;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #fff7ed;
  color: #c2410c;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1px solid #fed7aa;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Time Filter Pill Group */
.time-filter {
  display: flex;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  padding: 3px;
  gap: 2px;
}

.time-btn {
  font-family: 'DM Sans', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  padding: 5px 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
}

.time-btn:hover { background: #f3f4f6; color: #374151; }

.time-btn.active {
  background: #111827;
  color: #fff;
}

/* Dropdown */
.dropdown {
  position: relative;
  display: inline-block;
}

.btn-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 7px 14px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #374151;
  transition: border-color 0.18s;
}

.btn-filter:hover { border-color: #d1d5db; }

.filter-label {
  color: #9ca3af;
  font-size: 12px;
}

.filter-value {
  font-weight: 500;
  color: #111827;
}

.arrow-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #fff;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
  border: 1px solid #f0f0f0;
  border-radius: 10px;
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
  border-radius: 6px;
  transition: background 0.12s;
}

.dropdown-item:hover { background: #f9fafb; }
.dropdown-item.active { background: #f3f4f6; font-weight: 500; color: #111827; }

/* Search */
.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 7px 14px;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.search-box:focus-within {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
}

.search-icon { color: #9ca3af; flex-shrink: 0; }

.search-box input {
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1a1d23;
  width: 200px;
  background: transparent;
}

.search-box input::placeholder { color: #c4c9d4; }

/* ── Table ── */
.table-container {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.alarm-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.alarm-table thead tr {
  border-bottom: 1px solid #f0f0f0;
}

.alarm-table th {
  background: #fafafa;
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.alarm-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f9fafb;
  color: #374151;
  vertical-align: middle;
}

.table-row:last-child td { border-bottom: none; }
.table-row:hover td { background: #fafbfc; }

.row-unread td:first-child {
  border-left: 3px solid #f97316;
}

.td-num {
  color: #d1d5db;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  width: 40px;
}

.td-variant {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 500;
  color: #111827;
}

.variant-icon {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  flex-shrink: 0;
}

.td-muted {
  color: #9ca3af;
  font-size: 12.5px;
  font-family: 'DM Sans', sans-serif;
}

/* Stock Value */
.stock-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 500;
}

.stock-value .stock-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.stock-low { color: #dc2626; }
.stock-low .stock-dot { background: #ef4444; }
.stock-ok { color: #15803d; }
.stock-ok .stock-dot { background: #22c55e; }

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.status-read {
  background: #f0fdf4;
  color: #15803d;
}
.status-read .status-dot { background: #22c55e; }

.status-unread {
  background: #fff7ed;
  color: #c2410c;
}
.status-unread .status-dot { background: #f97316; }

/* Mark Button */
.btn-mark {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 5px 13px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-mark:hover {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

/* Done check */
.done-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #16a34a;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #c4c9d4;
  font-size: 13px;
}

/* Pagination */
.pagination {
  margin-top: 14px;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
    display: flex;
  gap: 4px;
}

.pagination strong { color: #374151; }
</style>