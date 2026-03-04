<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="main-content">
      <!-- Header -->
      <div class="page-header">
        <h1>Low Stock Alerts</h1>
      </div>

      <!-- 🔥 Filters -->
      <div class="filters">
        <!-- Time Filter -->
        <div class="filter-group">
          <button
            v-for="t in timeOptions"
            :key="t"
            :class="['filter-btn', selectedTime === t ? 'active' : '']"
            @click="selectedTime = t"
          >
            {{ t }}
          </button>
        </div>

        <!-- Status Filter -->
        <select v-model="statusFilter">
          <option value="all">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>

        <!-- Search -->
        <input
          v-model="search"
          type="text"
          placeholder="Search product or variant..."
        />
      </div>

      <!-- Table -->
      <div class="table-card">
        <table>
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>VARIANT</th>
              <th>STOCK</th>
              <th>THRESHOLD</th>
              <th>STATUS</th>
              <th>CREATED</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="alert in filteredAlerts" :key="alert.id">
              <td>{{ alert.product }}</td>
              <td>{{ alert.variant }}</td>

              <!-- Stock -->
              <td>
                <span
                  :class="[
                    'stock',
                    alert.stock <= alert.threshold ? 'low-stock' : ''
                  ]"
                >
                  {{ alert.stock }}
                </span>
              </td>

              <td>{{ alert.threshold }}</td>

              <!-- Status -->
              <td>
                <span
                  :class="['badge', alert.is_read ? 'read' : 'unread']"
                >
                  {{ alert.is_read ? 'Read' : 'Unread' }}
                </span>
              </td>

              <td>{{ formatDate(alert.created_at) }}</td>

              <td>
                <button
                  v-if="!alert.is_read"
                  class="btn-mark"
                  @click="markAsRead(alert.id)"
                >
                  Mark
                </button>
                <span v-else class="done">✔</span>
              </td>
            </tr>

            <tr v-if="filteredAlerts.length === 0">
              <td colspan="7" class="no-data">
                No alerts found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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

      // Filters
      timeOptions: ['All', 'Today', 'Week', 'Month'],
      selectedTime: 'All',
      statusFilter: 'all',

      // 🔥 Hardcoded alerts
      alerts: [
        {
          id: 1,
          product: 'Chocolate Gift Box',
          variant: 'Large Pack',
          stock: 1,
          threshold: 5,
          is_read: 0,
          created_at: '2026-03-04T10:30:00'
        },
        {
          id: 2,
          product: 'Bonsai LED Lamp',
          variant: 'Warm Light',
          stock: 3,
          threshold: 4,
          is_read: 0,
          created_at: '2026-03-03T09:10:00'
        },
        {
          id: 3,
          product: 'Cozy Cups',
          variant: 'Set of 2',
          stock: 6,
          threshold: 5,
          is_read: 1,
          created_at: '2026-02-28T18:22:00'
        }
      ]
    }
  },

  computed: {
    filteredAlerts() {
      return this.alerts.filter(a => {
        // 🔍 Search
        const matchSearch =
          a.product.toLowerCase().includes(this.search.toLowerCase()) ||
          a.variant.toLowerCase().includes(this.search.toLowerCase())

        // 📅 Time Filter
        const date = new Date(a.created_at)
        const now = new Date()

        let matchTime = true
        if (this.selectedTime === 'Today') {
          matchTime = date.toDateString() === now.toDateString()
        } else if (this.selectedTime === 'Week') {
          const diff = (now - date) / (1000 * 60 * 60 * 24)
          matchTime = diff <= 7
        } else if (this.selectedTime === 'Month') {
          matchTime =
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        }

        // 📌 Status Filter
        let matchStatus = true
        if (this.statusFilter === 'unread') matchStatus = a.is_read === 0
        if (this.statusFilter === 'read') matchStatus = a.is_read === 1

        return matchSearch && matchTime && matchStatus
      })
    }
  },

  methods: {
    markAsRead(id) {
      const alert = this.alerts.find(a => a.id === id)
      if (alert) alert.is_read = 1
    },

    formatDate(dateStr) {
      const d = new Date(dateStr)
      return d.toLocaleString()
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
}

.main-content {
  flex: 1;
  padding: 25px;
  background: #f4f6f9;
  min-height: 100vh;
}

/* Header */
.page-header {
  margin-bottom: 20px;
}

/* Filters */
.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 5px;
}

.filter-btn {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.filter-btn.active {
  background: #007bff;
  color: white;
}

select,
input {
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* Table */
.table-card {
  background: white;
  border-radius: 8px;
  border: 1px solid #ddd;
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f1f3f5;
}

th,
td {
  padding: 12px;
}

tr {
  border-bottom: 1px solid #eee;
}

/* Stock highlight */
.low-stock {
  color: red;
  font-weight: bold;
}

/* Status */
.badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.unread {
  background: #ffe5e5;
  color: red;
}

.read {
  background: #e6f7ee;
  color: green;
}

/* Button */
.btn-mark {
  background: #007bff;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 4px;
}

.done {
  color: green;
}

/* Empty */
.no-data {
  text-align: center;
  padding: 20px;
  color: #777;
}
</style>