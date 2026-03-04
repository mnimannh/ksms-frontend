<template>
  <div class="admin-layout">
    <AdminSidebar />

    <main class="main-content">
      <!-- Header -->
      <div class="page-header">
        <h1>Low Stock Alerts</h1>
      </div>

      <!-- Filters -->
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
          placeholder="Search variant..."
        />
      </div>

      <!-- Table -->
      <div class="table-card">
<table>
  <thead>
    <tr>
      <th>VARIANT</th>
      <th>STOCK</th>
      <th>THRESHOLD</th>
      <th>STATUS</th>
      <th>CREATED</th>
      <th>ACTION</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="alarm in filteredAlarms" :key="alarm.id">
      <td>{{ alarm.variant }}</td>
      <td>
        <span :class="['stock', alarm.stock <= alarm.threshold ? 'low-stock' : '']">
          {{ alarm.stock }}
        </span>
      </td>
      <td>{{ alarm.threshold }}</td>
      <td>
        <span :class="['badge', alarm.is_read ? 'read' : 'unread']">
          {{ alarm.is_read ? 'Read' : 'Unread' }}
        </span>
      </td>
      <td>{{ formatDate(alarm.created_at) }}</td>
      <td>
        <button
          v-if="!alarm.is_read"
          class="btn-mark"
          @click="markAsRead(alarm.id)"
        >
          Mark
        </button>
        <span v-else class="done">✔</span>
      </td>
    </tr>

    <tr v-if="filteredAlarms.length === 0">
      <td colspan="6" class="no-data">No alerts found</td>
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
      timeOptions: ['All', 'Today', 'Week', 'Month'],
      selectedTime: 'All',
      statusFilter: 'all',
      alarms: [] // dynamic data from API
    }
  },

computed: {
  filteredAlarms() {
    return this.alarms.filter(a => {
      // search
      const matchSearch = a.variant.toLowerCase().includes(this.search.toLowerCase())

      // time
      const date = new Date(a.created_at)
      const now = new Date()
      let matchTime = true
      if (this.selectedTime === 'Today') {
        matchTime = date.toDateString() === now.toDateString()
      } else if (this.selectedTime === 'Week') {
        const diffDays = (now.getTime() - date.getTime()) / (1000*60*60*24)
        matchTime = diffDays <= 7
      } else if (this.selectedTime === 'Month') {
        matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      } else if (this.selectedTime === 'All') {
        matchTime = true
      }

      // status
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
      return new Date(dateStr).toLocaleString()
    }
  },

  mounted() {
    this.fetchAlarms()
  }
}
</script>