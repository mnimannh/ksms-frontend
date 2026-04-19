<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="page">

      <!-- ── TOP BAR ── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ today }}</p>
          <h1 class="topbar-title">Alerts & <span class="accent">Insights</span></h1>
        </div>
        <div class="topbar-right">
          <div class="tab-group">
            <button :class="['tab-btn', activeTab === 'alarms' ? 'active' : '']" @click="activeTab = 'alarms'">
              Low Stock Alerts
              <span v-if="unreadCount > 0" class="tab-badge tab-badge--red">{{ unreadCount }}</span>
            </button>
            <button :class="['tab-btn', activeTab === 'insights' ? 'active' : '']" @click="activeTab = 'insights'">
              Operational Insights
              <span v-if="insightUnreadCount > 0" class="tab-badge tab-badge--indigo">{{ insightUnreadCount }}</span>
            </button>
          </div>
          <div class="live-dot"><span class="pulse" />Live</div>
        </div>
      </div>

      <!-- ── SUMMARY CARDS ── -->
      <div class="summary-row">
        <div class="summary-card">
          <div class="summary-icon" style="background:#fef2f2; color:#ef4444">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ unreadCount }}</p>
            <p class="summary-label">Unread Stock Alerts</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#eef2ff; color:#6366f1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ insightUnreadCount }}</p>
            <p class="summary-label">Unread Insights</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#f0fdf4; color:#10b981">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ alarms.filter(a => a.is_read).length }}</p>
            <p class="summary-label">Resolved Alerts</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="summary-icon" style="background:#fffbeb; color:#f59e0b">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ insights.length }}</p>
            <p class="summary-label">Total Insights</p>
          </div>
        </div>
      </div>

      <!-- ── PANEL ── -->
      <div class="panel">
        <div class="card-header">
          <div>
            <p class="card-title">{{ activeTab === 'alarms' ? 'Low Stock Alerts' : 'Operational Insights' }}</p>
            <p class="card-sub">{{ activeTab === 'alarms' ? 'Variants currently below restock threshold' : 'Rule-based analysis of your inventory performance' }}</p>
          </div>
          <div class="toolbar-right">
            <div class="time-filter">
              <button v-for="t in timeOptions" :key="t" :class="['time-btn', selectedTime === t ? 'active' : '']" @click="selectedTime = t">{{ t }}</button>
            </div>
            <div class="dropdown" v-if="activeTab === 'alarms'">
              <button class="btn-filter">
                <span class="filter-label">Status</span>
                <span class="filter-value">{{ statusLabel }}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <div class="dropdown-menu">
                <div @click="statusFilter = 'all'" class="dropdown-item" :class="{ active: statusFilter === 'all' }">All</div>
                <div @click="statusFilter = 'unread'" class="dropdown-item" :class="{ active: statusFilter === 'unread' }">Unread</div>
                <div @click="statusFilter = 'read'" class="dropdown-item" :class="{ active: statusFilter === 'read' }">Read</div>
              </div>
            </div>
            <div class="search-box">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <input v-model="search" type="text" placeholder="Search..." />
            </div>
          </div>
        </div>

        <!-- Low Stock Table -->
        <div v-if="activeTab === 'alarms'" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Category</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Stock</th>
                <th>Threshold</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(alarm, i) in filteredAlarms" :key="alarm.id" class="table-row" :class="{ 'row-unread': !alarm.is_read }">
                <td class="td-num">{{ i + 1 }}</td>
                <td class="td-muted">{{ alarm.category_name }}</td>
                <td class="td-product">{{ alarm.product_name }}</td>
                <td>
                  <div class="cell-item">
                    <div class="item-icon" style="background:#eef2ff; color:#6366f1">
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="14" rx="3" stroke="currentColor" stroke-width="1.5"/><path d="M4 8h8M8 4v8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                    </div>
                    <span class="item-name">{{ alarm.variant }}</span>
                  </div>
                </td>
                <td>
                  <span class="stock-val" :class="alarm.stock <= alarm.threshold ? 'stock-low' : 'stock-ok'">
                    <span class="stock-dot"></span>{{ alarm.stock }}
                  </span>
                </td>
                <td class="td-muted">{{ alarm.threshold }}</td>
                <td>
                  <span class="badge" :class="alarm.is_read ? 'badge-green' : 'badge-red'">
                    <span class="badge-dot"></span>{{ alarm.is_read ? 'Read' : 'Unread' }}
                  </span>
                </td>
                <td class="td-muted">{{ formatDate(alarm.created_at) }}</td>
                <td>
                  <button v-if="!alarm.is_read" class="btn-action" @click="markAsRead(alarm.id)">Mark read</button>
                  <span v-else class="done-check">
                    <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                </td>
              </tr>
              <tr v-if="filteredAlarms.length === 0">
                <td colspan="9" class="empty-state">No alerts found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Insights Table -->
        <div v-if="activeTab === 'insights'" class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Rule</th>
                <th>Category</th>
                <th>Product</th>
                <th>Variant</th>
                <th>Message</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Detected</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(ins, i) in filteredInsights" :key="ins.id" class="table-row" :class="{ 'row-unread': !ins.is_read }">
                <td class="td-num">{{ i + 1 }}</td>
                <td>
                  <div class="rule-chip" :class="`rule-chip--${ins.rule_id.replace('-','').toLowerCase()}`">
                    <span class="rule-sym">{{ ruleIcon(ins.rule_id) }}</span>
                    {{ ruleLabel(ins.rule_id) }}
                  </div>
                </td>
                <td class="td-muted">{{ ins.category_name }}</td>
                <td class="td-product">{{ ins.product_name }}</td>
                <td class="td-muted">{{ ins.variant_name }}</td>
                <td class="td-msg">{{ ins.message }}</td>
                <td>
                  <span class="badge" :class="{
                    'badge-red':    ins.severity === 'critical',
                    'badge-amber':  ins.severity === 'warning',
                    'badge-blue':   ins.severity === 'info'
                  }">
                    <span class="badge-dot"></span>{{ ins.severity }}
                  </span>
                </td>
                <td>
                  <span class="badge" :class="ins.is_read ? 'badge-green' : 'badge-red'">
                    <span class="badge-dot"></span>{{ ins.is_read ? 'Read' : 'Unread' }}
                  </span>
                </td>
                <td class="td-muted">{{ formatDate(ins.created_at) }}</td>
                <td>
                  <button v-if="!ins.is_read" class="btn-action" @click="markInsightAsRead(ins.id)">Mark read</button>
                  <span v-else class="done-check">
                    <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><path d="M1.5 5.5L5 9L11.5 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  </span>
                </td>
              </tr>
              <tr v-if="filteredInsights.length === 0">
                <td colspan="10" class="empty-state">No insights detected</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span>Showing <strong>{{ activeTab === 'alarms' ? filteredAlarms.length : filteredInsights.length }}</strong> of <strong>{{ activeTab === 'alarms' ? alarms.length : insights.length }}</strong> {{ activeTab === 'alarms' ? 'alerts' : 'insights' }}</span>
        </div>
      </div>

      <!-- Toast -->
      <transition name="toast">
        <div v-if="toast.show" class="toast">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {{ toast.message }}
        </div>
      </transition>

    </main>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import axios from 'axios'

const RULE_META = {
  'INV-002': { label: 'Slow-Moving Stock', icon: '↓' },
  'INV-003': { label: 'Fast-Moving Item',  icon: '↑' },
  'INV-004': { label: 'Revenue Drop',      icon: '!' },
  'INV-005': { label: 'Restock Ignored',   icon: '⊘' },
  'INV-006': { label: 'Never Sold',        icon: '○' },
}

export default {
  name: 'AdminAlarm',
  components: { AdminSidebar },

  data() {
    const now = new Date()
    return {
      today: now.toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      activeTab: 'alarms',
      insights: [],
      toast: { show: false, message: '' },
      search: '',
      timeOptions: ['All', 'Today', 'Week', 'Month'],
      selectedTime: 'All',
      statusFilter: 'all',
      alarms: [],
    }
  },

  computed: {
    statusLabel() {
      if (this.statusFilter === 'unread') return 'Unread'
      if (this.statusFilter === 'read') return 'Read'
      return 'All'
    },
    unreadCount() { return this.alarms.filter(a => !a.is_read).length },
    insightUnreadCount() { return this.insights.filter(i => !i.is_read).length },

    filteredAlarms() {
      return this.alarms.filter(a => {
        const q = this.search.toLowerCase()
        const matchSearch = (a.variant || '').toLowerCase().includes(q) || (a.product_name || '').toLowerCase().includes(q) || (a.category_name || '').toLowerCase().includes(q)
        const date = new Date(a.created_at); const now = new Date()
        let matchTime = true
        if (this.selectedTime === 'Today') matchTime = date.toDateString() === now.toDateString()
        else if (this.selectedTime === 'Week') matchTime = (now - date) / 86400000 <= 7
        else if (this.selectedTime === 'Month') matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        const rv = Number(a.is_read)
        let matchStatus = true
        if (this.statusFilter === 'unread') matchStatus = rv === 0
        if (this.statusFilter === 'read') matchStatus = rv === 1
        return matchSearch && matchTime && matchStatus
      })
    },

    filteredInsights() {
      return this.insights.filter(i => {
        const q = this.search.toLowerCase()
        const matchSearch = (i.variant_name || '').toLowerCase().includes(q) || (i.message || '').toLowerCase().includes(q)
        const date = new Date(i.created_at); const now = new Date()
        let matchTime = true
        if (this.selectedTime === 'Today') matchTime = date.toDateString() === now.toDateString()
        else if (this.selectedTime === 'Week') matchTime = (now - date) / 86400000 <= 7
        else if (this.selectedTime === 'Month') matchTime = date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        return matchSearch && matchTime
      })
    },
  },

  methods: {
    ruleLabel(id) { return RULE_META[id]?.label ?? id },
    ruleIcon(id)  { return RULE_META[id]?.icon  ?? '•' },

    async fetchAlarms() {
      try { this.alarms = (await axios.get(`${API_BASE_URL}/api/alarm`)).data }
      catch (e) { console.error(e) }
    },

    async fetchInsights() {
      try {
        const { data } = await axios.post(`${API_BASE_URL}/api/analytics/run`)
        if (data.newInsights > 0) {
          this.toast = { show: true, message: `${data.newInsights} new insight(s) detected` }
          setTimeout(() => { this.toast.show = false }, 4000)
        }
        this.insights = (await axios.get(`${API_BASE_URL}/api/analytics/insights`)).data
      } catch (e) { console.error(e) }
    },

    async markAsRead(id) {
      try {
        await axios.patch(`${API_BASE_URL}/api/alarm/read/${id}`)
        const a = this.alarms.find(a => a.id === id); if (a) a.is_read = 1
      } catch (e) { console.error(e) }
    },

    async markInsightAsRead(id) {
      try {
        await axios.patch(`${API_BASE_URL}/api/analytics/insights/read/${id}`)
        const i = this.insights.find(i => i.id === id); if (i) i.is_read = 1
      } catch (e) { console.error(e) }
    },

    formatDate(d) {
      return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    },
  },

  mounted() {
    this.fetchAlarms()
    this.fetchInsights()
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base (mobile) ───────────────────────────────────────────── */
.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b;
}

.page {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px; overflow-x: hidden;
}

/* Topbar — stacked on mobile */
.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.live-dot {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #10b981; font-weight: 500;
}
.pulse {
  width: 8px; height: 8px; background: #10b981;
  border-radius: 50%; display: block; animation: pulse 1.8s ease infinite;
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}

/* Tab group — full width on mobile */
.tab-group {
  display: flex; width: 100%;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 10px; padding: 3px; gap: 2px;
}
.tab-btn {
  flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 8px 10px; border-radius: 7px; border: none;
  background: transparent; font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500; cursor: pointer;
  color: #64748b; transition: all .15s;
}
.tab-btn:hover { background: #f8fafc; color: #334155; }
.tab-btn.active { background: #6366f1; color: #fff; }

.tab-badge {
  font-size: 10px; font-weight: 700;
  border-radius: 20px; padding: 1px 6px; line-height: 1.6;
}
.tab-badge--red    { background: #fef2f2; color: #dc2626; }
.tab-badge--indigo { background: #eef2ff; color: #4338ca; }
.tab-btn.active .tab-badge--red    { background: rgba(239,68,68,.25); color: #fca5a5; }
.tab-btn.active .tab-badge--indigo { background: rgba(255,255,255,.2); color: #fff; }

/* Summary — 2 cols on mobile */
.summary-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.summary-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04); animation: fadeUp .35s ease both;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.summary-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.summary-val   { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; margin-bottom: 3px; }
.summary-label { font-size: 11px; color: #94a3b8; }

/* Panel */
.panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04); overflow: hidden;
}

/* Card header — stacked on mobile */
.card-header {
  display: flex; flex-direction: column; gap: 12px;
  padding: 16px 16px 12px; border-bottom: 1px solid #f8fafc;
}
.card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }

.toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Time filter */
.time-filter {
  display: flex; background: #f8fafc;
  border: 1px solid #f1f5f9; border-radius: 8px; padding: 3px; gap: 2px;
}
.time-btn {
  font-family: 'DM Sans', sans-serif; font-size: 11.5px; font-weight: 500;
  color: #64748b; background: transparent; border: none;
  padding: 4px 9px; border-radius: 5px; cursor: pointer; transition: all .15s;
}
.time-btn:hover { background: #fff; color: #334155; }
.time-btn.active { background: #fff; color: #0f172a; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,.07); }

/* Dropdown */
.dropdown { position: relative; }
.btn-filter {
  display: flex; align-items: center; gap: 7px;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px; padding: 7px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #334151; transition: border-color .15s;
}
.btn-filter:hover { border-color: #e2e8f0; }
.filter-label { color: #94a3b8; font-size: 11.5px; }
.filter-value { font-weight: 500; color: #0f172a; }
.dropdown-menu {
  display: none; position: absolute; top: calc(100% + 6px); right: 0;
  background: #fff; min-width: 130px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08); border: 1px solid #f0f0f0;
  border-radius: 10px; z-index: 10; padding: 4px;
}
.dropdown:hover .dropdown-menu { display: block; }
.dropdown-item { padding: 8px 12px; cursor: pointer; font-size: 13px; color: #374151; border-radius: 6px; transition: background .12s; }
.dropdown-item:hover { background: #f8fafc; }
.dropdown-item.active { background: #f1f5f9; font-weight: 500; color: #0f172a; }

/* Search — full width on mobile */
.search-box {
  display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px; padding: 7px 11px;
  color: #94a3b8; transition: border-color .18s, box-shadow .18s;
}
.search-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }
.search-box input {
  border: none; outline: none; font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1e293b; width: 100%; background: transparent;
}
.search-box input::placeholder { color: #c4c9d4; }

/* Table */
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 640px; }
.data-table thead tr { border-bottom: 1px solid #f1f5f9; }
.data-table th {
  background: #fafafa; text-align: left;
  padding: 10px 14px; font-size: 10.5px; font-weight: 600;
  letter-spacing: .07em; text-transform: uppercase; color: #94a3b8; white-space: nowrap;
}
.data-table td { padding: 12px 14px; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
.table-row:last-child td { border-bottom: none; }
.table-row:hover td { background: #fafbfc; }
.row-unread td:first-child { border-left: 3px solid #6366f1; }

.td-num { color: #cbd5e1; font-family: 'DM Mono', monospace; font-size: 12px; width: 36px; }
.td-muted { color: #94a3b8; font-size: 12.5px; white-space: nowrap; }
.td-product { font-weight: 500; color: #1e293b; white-space: nowrap; }
.td-msg { max-width: 220px; font-size: 12px; color: #64748b; line-height: 1.55; }

.cell-item { display: flex; align-items: center; gap: 9px; }
.item-icon {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.item-name { font-weight: 500; color: #1e293b; }

.stock-val { display: inline-flex; align-items: center; gap: 6px; font-family: 'DM Mono', monospace; font-size: 13px; font-weight: 500; }
.stock-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.stock-low { color: #dc2626; } .stock-low .stock-dot { background: #ef4444; }
.stock-ok  { color: #15803d; } .stock-ok  .stock-dot { background: #22c55e; }

.rule-chip {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 7px;
  font-size: 12px; font-weight: 600; white-space: nowrap; border: 1px solid transparent;
}
.rule-sym { font-family: 'DM Mono', monospace; font-size: 12px; line-height: 1; }
.rule-chip--inv002 { background: #fffbeb; color: #92400e; border-color: #fde68a; }
.rule-chip--inv003 { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
.rule-chip--inv004 { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
.rule-chip--inv005 { background: #fff7ed; color: #c2410c; border-color: #fed7aa; }
.rule-chip--inv006 { background: #f5f3ff; color: #5b21b6; border-color: #ddd6fe; }

.badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 6px;
  font-size: 11.5px; font-weight: 500; text-transform: capitalize; white-space: nowrap;
}
.badge-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.badge-green { background: #f0fdf4; color: #15803d; } .badge-green .badge-dot { background: #22c55e; }
.badge-red   { background: #fef2f2; color: #dc2626; } .badge-red   .badge-dot { background: #ef4444; }
.badge-amber { background: #fffbeb; color: #b45309; } .badge-amber .badge-dot { background: #f59e0b; }
.badge-blue  { background: #eff6ff; color: #1d4ed8; } .badge-blue  .badge-dot { background: #3b82f6; }

.btn-action {
  background: transparent; border: 1px solid #e2e8f0;
  color: #475569; padding: 5px 11px; border-radius: 7px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-action:hover { background: #6366f1; border-color: #6366f1; color: #fff; }

.done-check {
  display: inline-flex; align-items: center; justify-content: center;
  width: 26px; height: 26px; border-radius: 50%; background: #f0fdf4; color: #16a34a;
}

.table-footer { padding: 12px 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f8fafc; }
.table-footer strong { color: #475569; }
.empty-state { text-align: center; padding: 48px; color: #cbd5e1; font-size: 13px; }

/* Toast — full width on mobile */
.toast {
  position: fixed; bottom: 16px; left: 16px; right: 16px;
  display: flex; align-items: center; gap: 10px;
  background: #1e293b; color: #fff;
  padding: 13px 16px; border-radius: 12px;
  font-size: 13px; font-weight: 500;
  box-shadow: 0 8px 24px rgba(0,0,0,.18); z-index: 999;
}
.toast-enter-active, .toast-leave-active { transition: all .25s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Tablet (≥ 600px) ─────────────────────────────────────── */
@media (min-width: 600px) {
  .page { padding: 24px 24px 44px; gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  .topbar-title { font-size: 24px; }
  .tab-group { width: auto; }
  .tab-btn { flex: none; font-size: 13px; padding: 7px 14px; }
  .summary-row { gap: 12px; }
  .summary-card { padding: 16px 18px; gap: 14px; }
  .summary-icon { width: 42px; height: 42px; border-radius: 11px; }
  .summary-val { font-size: 24px; }
  .summary-label { font-size: 12px; }
  .card-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 18px 20px 14px; }
  .search-box { flex: none; }
  .search-box input { width: 160px; }
  .table-footer { padding: 12px 20px; }
  .toast { left: auto; right: 20px; width: auto; }
}

/* ── Desktop (≥ 900px) ────────────────────────────────────── */
@media (min-width: 900px) {
  .page { padding: 32px 36px 48px; gap: 20px; }
  .topbar-title { font-size: 26px; }
  .summary-row { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .summary-card { padding: 18px 20px; }
  .summary-val { font-size: 26px; }
  .card-header { padding: 20px 22px 16px; }
  .search-box input { width: 180px; }
  .td-msg { max-width: 260px; }
  .table-footer { padding: 12px 22px; }
  .toast { bottom: 28px; right: 28px; }
}
</style>
