<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="dashboard">

      <!-- ── TOP BAR ─────────────────────────────────────────── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ today }}</p>
          <h1 class="topbar-title">Good {{ greeting }}, <span class="accent">Admin</span></h1>
        </div>
        <div class="topbar-right">
          <div class="alert-chip" :class="{ active: unreadAlerts > 0 }" @click="scrollTo('alerts')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span>{{ unreadAlerts }} Low Stock Alert{{ unreadAlerts !== 1 ? 's' : '' }}</span>
          </div>
          <div class="live-dot"><span class="pulse" />Live</div>
        </div>
      </div>

      <!-- ── KPI CARDS ──────────────────────────────────────── -->
      <div class="kpi-grid">
        <div class="kpi-card" v-for="(k, i) in kpis" :key="k.label" :style="`animation-delay:${i*60}ms`">
          <div class="kpi-top">
            <div class="kpi-icon" :style="`background:${k.bg}; color:${k.color}`" v-html="k.icon" />
            <span class="kpi-trend" :class="k.up ? 'up' : 'down'">
              {{ k.up ? '↑' : '↓' }} {{ k.trend }}
            </span>
          </div>
          <p class="kpi-val">{{ k.value }}</p>
          <p class="kpi-label">{{ k.label }}</p>
          <div class="kpi-bar"><div class="kpi-fill" :style="`width:${k.pct}%; background:${k.color}`" /></div>
        </div>
      </div>

      <!-- ── CHARTS ROW ─────────────────────────────────────── -->
      <div class="charts-row">

        <!-- Orders over 7 days -->
        <div class="chart-card wide">
          <div class="card-header">
            <div>
              <p class="card-title">Order Volume</p>
              <p class="card-sub">Last 7 days</p>
            </div>
            <div class="legend-group">
              <span class="legend-dot" style="background:#6366f1" />Orders
            </div>
          </div>
          <div class="chart-wrap">
            <canvas ref="ordersChart" />
          </div>
        </div>

        <!-- Inventory by category donut -->
        <div class="chart-card narrow">
          <div class="card-header">
            <div>
              <p class="card-title">Stock by Category</p>
              <p class="card-sub">Current units</p>
            </div>
          </div>
          <div class="chart-wrap donut-wrap">
            <canvas ref="categoryChart" />
          </div>
          <div class="donut-legend">
            <div v-for="(c, i) in categoryData" :key="c.label" class="donut-legend-row">
              <span class="donut-dot" :style="`background:${donutColors[i]}`" />
              <span class="donut-lbl">{{ c.label }}</span>
              <span class="donut-val">{{ c.value }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ── SECOND ROW ─────────────────────────────────────── -->
      <div class="mid-row">

        <!-- Staff on shift today -->
        <div class="panel staff-panel">
          <div class="card-header">
            <div>
              <p class="card-title">Staff On Shift Today</p>
              <p class="card-sub">{{ todayDate }}</p>
            </div>
            <span class="badge blue">{{ staffOnShift.length }} Active</span>
          </div>
          <div class="staff-list">
            <div v-for="s in staffOnShift" :key="s.id" class="staff-row">
              <div class="s-avatar" :style="`background:${s.color}`">{{ s.initials }}</div>
              <div class="s-info">
                <span class="s-name">{{ s.name }}</span>
                <span class="s-shift">{{ s.shift }} · {{ s.time }}</span>
              </div>
              <span class="s-status" :class="s.statusClass">{{ s.statusLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Payroll summary -->
        <div class="panel payroll-panel">
          <div class="card-header">
            <div>
              <p class="card-title">Payroll Status</p>
              <p class="card-sub">{{ currentMonth }}</p>
            </div>
          </div>
          <div class="payroll-donut-wrap">
            <canvas ref="payrollChart" style="max-height:130px" />
          </div>
          <div class="payroll-stats">
            <div class="ps-item" v-for="p in payrollStats" :key="p.label">
              <span class="ps-dot" :style="`background:${p.color}`" />
              <span class="ps-label">{{ p.label }}</span>
              <span class="ps-val">{{ p.value }}</span>
            </div>
          </div>
        </div>

        <!-- Recent orders -->
        <div class="panel orders-panel">
          <div class="card-header">
            <div>
              <p class="card-title">Recent Orders</p>
              <p class="card-sub">Latest transactions</p>
            </div>
          </div>
          <div class="orders-list">
            <div v-for="o in recentOrders" :key="o.id" class="order-row">
              <div class="order-id">#{{ o.id }}</div>
              <div class="order-info">
                <span class="order-items">{{ o.items }} item{{ o.items > 1 ? 's' : '' }}</span>
                <span class="order-time">{{ o.time }}</span>
              </div>
              <span class="order-total">{{ o.total }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ── LOW STOCK ALERTS ───────────────────────────────── -->
      <div class="panel alerts-panel" id="alerts">
        <div class="card-header">
          <div>
            <p class="card-title">Low Stock Alerts</p>
            <p class="card-sub">Variants below threshold</p>
          </div>
          <span class="badge red">{{ unreadAlerts }} Unread</span>
        </div>
        <div class="alerts-grid">
          <div
            v-for="a in lowStockAlerts"
            :key="a.id"
            class="alert-card"
            :class="{ critical: a.qty === 0 }"
          >
            <div class="alert-top">
              <span class="alert-cat">{{ a.category }}</span>
              <span class="alert-read" v-if="!a.is_read">NEW</span>
            </div>
            <p class="alert-name">{{ a.product }}</p>
            <p class="alert-variant">{{ a.variant }}</p>
            <div class="alert-meter">
              <div class="meter-bar">
                <div class="meter-fill" :style="`width:${Math.min((a.qty/a.threshold)*100,100)}%; background:${a.qty===0?'#ef4444':a.qty<5?'#f59e0b':'#6366f1'}`" />
              </div>
              <span class="meter-label">{{ a.qty }} / {{ a.threshold }} units</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── RECENT ACTIVITY ────────────────────────────────── -->
      <div class="panel activity-panel">
        <div class="card-header">
          <p class="card-title">Recent Activity</p>
          <p class="card-sub">System log</p>
        </div>
        <div class="activity-list">
          <div v-for="(a, i) in activityLog" :key="i" class="activity-row" :style="`animation-delay:${i*40}ms`">
            <div class="act-icon" :style="`background:${a.bg}; color:${a.color}`" v-html="a.icon" />
            <div class="act-body">
              <span class="act-text">{{ a.text }}</span>
              <span class="act-time">{{ a.time }}</span>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/adminSidebar.vue'
import {
  Chart, LineController, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, DoughnutController, ArcElement, Legend,
} from 'chart.js'

Chart.register(
  LineController, LineElement, PointElement, LinearScale,
  CategoryScale, Filler, Tooltip, DoughnutController, ArcElement, Legend,
)

export default {
  name: 'AdminDashboard',
  components: { AdminSidebar },

  data() {
    const now = new Date()
    const hours = now.getHours()
    const greeting = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening'
    const todayStr = now.toLocaleDateString('en-MY', { weekday:'long', year:'numeric', month:'long', day:'numeric' })
    const monthStr = now.toLocaleDateString('en-MY', { month:'long', year:'numeric' })

    return {
      today: todayStr,
      todayDate: now.toLocaleDateString('en-MY', { day:'numeric', month:'short', year:'numeric' }),
      greeting,
      currentMonth: monthStr,

      donutColors: ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4'],

      // ── KPI Cards ──────────────────────────────────────────
      kpis: [
        {
          label: 'Total Products', value: '48', trend: '4 this week', up: true, pct: 72,
          color: '#6366f1', bg: '#eef2ff',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
        },
        {
          label: 'Orders Today', value: '23', trend: '8 vs yesterday', up: true, pct: 60,
          color: '#10b981', bg: '#f0fdf4',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`,
        },
        {
          label: 'Low Stock Items', value: '7', trend: '2 critical', up: false, pct: 35,
          color: '#ef4444', bg: '#fef2f2',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        },
        {
          label: 'Active Staff', value: '6', trend: '1 on leave', up: false, pct: 85,
          color: '#f59e0b', bg: '#fffbeb',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
        },
        {
          label: 'Payroll Generated', value: '4/7', trend: '3 pending', up: false, pct: 57,
          color: '#06b6d4', bg: '#ecfeff',
          icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>`,
        },
      ],

      // ── Category Chart Data ─────────────────────────────────
      categoryData: [
        { label: 'Beverages',  value: 320 },
        { label: 'Dry Goods',  value: 215 },
        { label: 'Cleaning',   value: 88  },
        { label: 'Frozen',     value: 142 },
        { label: 'Condiments', value: 67  },
      ],

      // ── Payroll Stats ───────────────────────────────────────
      payrollStats: [
        { label: 'Generated', value: 4, color: '#6366f1' },
        { label: 'Received',  value: 2, color: '#10b981' },
        { label: 'Pending',   value: 3, color: '#f59e0b' },
      ],

      // ── Staff On Shift ──────────────────────────────────────
      staffOnShift: [
        { id:1, name:'Ahmad Razif',  initials:'AR', color:'#3b82f6', shift:'Morning', time:'08:00–16:00', statusLabel:'On Time',  statusClass:'on-time' },
        { id:2, name:'Nurul Izzah',  initials:'NI', color:'#8b5cf6', shift:'Morning', time:'08:00–16:00', statusLabel:'On Time',  statusClass:'on-time' },
        { id:3, name:'Mohd Faris',   initials:'MF', color:'#10b981', shift:'Evening', time:'16:00–00:00', statusLabel:'Late',     statusClass:'late'    },
        { id:4, name:'Siti Hajar',   initials:'SH', color:'#f59e0b', shift:'Morning', time:'08:00–16:00', statusLabel:'On Time',  statusClass:'on-time' },
        { id:5, name:'Eko Prasetyo', initials:'EP', color:'#ef4444', shift:'Evening', time:'20:00–04:00', statusLabel:'Pending',  statusClass:'pending' },
        { id:6, name:'Lim Wei Ling', initials:'LW', color:'#06b6d4', shift:'Morning', time:'08:00–16:00', statusLabel:'On Time',  statusClass:'on-time' },
      ],

      // ── Recent Orders ───────────────────────────────────────
      recentOrders: [
        { id: 1042, items: 3, time: '2 min ago',   total: 'RM 47.90' },
        { id: 1041, items: 1, time: '18 min ago',  total: 'RM 12.50' },
        { id: 1040, items: 5, time: '34 min ago',  total: 'RM 108.00' },
        { id: 1039, items: 2, time: '1 hr ago',    total: 'RM 23.40' },
        { id: 1038, items: 4, time: '2 hrs ago',   total: 'RM 65.00' },
      ],

      // ── Low Stock Alerts ────────────────────────────────────
      lowStockAlerts: [
        { id:1, product:'Milo Tin',       variant:'1kg',   category:'Beverages', qty:2,  threshold:10, is_read:false },
        { id:2, product:'Cooking Oil',    variant:'5L',    category:'Condiments',qty:0,  threshold:8,  is_read:false },
        { id:3, product:'Latex Gloves',   variant:'M',     category:'Cleaning',  qty:4,  threshold:20, is_read:true  },
        { id:4, product:'Rice',           variant:'10kg',  category:'Dry Goods', qty:3,  threshold:15, is_read:false },
        { id:5, product:'Frozen Chicken', variant:'Whole', category:'Frozen',    qty:1,  threshold:10, is_read:false },
        { id:6, product:'Sugar',          variant:'1kg',   category:'Dry Goods', qty:6,  threshold:12, is_read:true  },
        { id:7, product:'Dishwash Liquid',variant:'500ml', category:'Cleaning',  qty:0,  threshold:6,  is_read:false },
      ],

      // ── Activity Log ────────────────────────────────────────
      activityLog: [
        {
          text: 'Payroll generated for Nurul Izzah (172h)',
          time: '5 min ago',
          bg: '#eef2ff', color: '#6366f1',
          icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
        },
        {
          text: 'Low stock alert: Cooking Oil 5L — 0 units',
          time: '22 min ago',
          bg: '#fef2f2', color: '#ef4444',
          icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
        },
        {
          text: 'Order #1042 placed — 3 items',
          time: '2 min ago',
          bg: '#f0fdf4', color: '#10b981',
          icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>`,
        },
        {
          text: 'Ahmad Razif checked in — Morning shift',
          time: '1 hr ago',
          bg: '#fffbeb', color: '#f59e0b',
          icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0113 0"/></svg>`,
        },
        {
          text: 'Inventory updated: Rice 10kg — restocked to 15',
          time: '3 hrs ago',
          bg: '#ecfeff', color: '#06b6d4',
          icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
        },
        {
          text: 'New staff registered: Eko Prasetyo',
          time: 'Yesterday',
          bg: '#f5f3ff', color: '#8b5cf6',
          icon: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
        },
      ],
    }
  },

  computed: {
    unreadAlerts() {
      return this.lowStockAlerts.filter(a => !a.is_read).length
    },
  },

  mounted() {
    this.$nextTick(() => {
      this.initOrdersChart()
      this.initCategoryChart()
      this.initPayrollChart()
    })
  },

  beforeUnmount() {
    if (this._ordersChart)   this._ordersChart.destroy()
    if (this._categoryChart) this._categoryChart.destroy()
    if (this._payrollChart)  this._payrollChart.destroy()
  },

  methods: {
    scrollTo(id) {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    },

    initOrdersChart() {
      const ctx = this.$refs.ordersChart?.getContext('2d')
      if (!ctx) return
      const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
      const data   = [14, 19, 11, 26, 18, 23, 17]

      const gradient = ctx.createLinearGradient(0, 0, 0, 200)
      gradient.addColorStop(0, 'rgba(99,102,241,0.25)')
      gradient.addColorStop(1, 'rgba(99,102,241,0)')

      this._ordersChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: 'Orders',
            data,
            borderColor: '#6366f1',
            borderWidth: 2.5,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4,
            fill: true,
            backgroundColor: gradient,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 }, stepSize: 5 },
              beginAtZero: true,
            },
          },
        },
      })
    },

    initCategoryChart() {
      const ctx = this.$refs.categoryChart?.getContext('2d')
      if (!ctx) return
      this._categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.categoryData.map(c => c.label),
          datasets: [{
            data: this.categoryData.map(c => c.value),
            backgroundColor: this.donutColors,
            borderWidth: 0,
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.label}: ${ctx.parsed} units`,
              },
            },
          },
        },
      })
    },

    initPayrollChart() {
      const ctx = this.$refs.payrollChart?.getContext('2d')
      if (!ctx) return
      this._payrollChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: this.payrollStats.map(p => p.label),
          datasets: [{
            data: this.payrollStats.map(p => p.value),
            backgroundColor: this.payrollStats.map(p => p.color),
            borderWidth: 0,
            hoverOffset: 4,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: { legend: { display: false } },
        },
      })
    },
  },
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
.topbar-date { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 26px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; gap: 12px; }

.alert-chip {
  display: flex; align-items: center; gap: 7px;
  padding: 8px 14px;
  border-radius: 9px;
  border: 1px solid #e2e8f0;
  background: #fff;
  font-size: 13px; color: #64748b;
  cursor: pointer;
  transition: all .15s;
}
.alert-chip:hover { border-color: #ef4444; color: #ef4444; }
.alert-chip.active { background: #fef2f2; border-color: #fca5a5; color: #dc2626; font-weight: 500; }

.live-dot {
  display: flex; align-items: center; gap: 6px;
  font-size: 12.5px; color: #10b981; font-weight: 500;
}
.pulse {
  width: 8px; height: 8px;
  background: #10b981; border-radius: 50%;
  display: block;
  animation: pulse 1.8s ease infinite;
}
@keyframes pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
}

/* ── KPI Grid ─────────────────────────────────────────────────── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.kpi-card {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 18px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  animation: fadeUp .35s ease both;
  transition: box-shadow .15s;
}
.kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
@keyframes fadeUp {
  from { opacity:0; transform:translateY(8px); }
  to   { opacity:1; transform:translateY(0); }
}
.kpi-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.kpi-icon {
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}
.kpi-trend { font-size: 11.5px; font-weight: 500; padding: 3px 8px; border-radius: 5px; }
.kpi-trend.up   { background: #f0fdf4; color: #15803d; }
.kpi-trend.down { background: #fef2f2; color: #dc2626; }
.kpi-val { font-size: 28px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; margin-bottom: 2px; }
.kpi-label { font-size: 12.5px; color: #64748b; margin-bottom: 12px; }
.kpi-bar { height: 3px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
.kpi-fill { height: 100%; border-radius: 99px; transition: width .6s ease; }

/* ── Charts Row ───────────────────────────────────────────────── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
}
.chart-card {
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

.legend-group { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: #64748b; }
.legend-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

.chart-wrap { position: relative; height: 180px; }
.donut-wrap { height: 150px; }

.donut-legend { margin-top: 14px; display: flex; flex-direction: column; gap: 7px; }
.donut-legend-row { display: flex; align-items: center; gap: 9px; font-size: 13px; }
.donut-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.donut-lbl { flex: 1; color: #475569; }
.donut-val { font-weight: 600; color: #1e293b; }

/* ── Mid Row ──────────────────────────────────────────────────── */
.mid-row {
  display: grid;
  grid-template-columns: 1fr 260px 280px;
  gap: 16px;
}
.panel {
  background: #fff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px 22px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}

/* Staff list */
.staff-list { display: flex; flex-direction: column; gap: 10px; }
.staff-row {
  display: flex; align-items: center; gap: 11px;
  padding: 10px 12px;
  background: #f8fafc; border-radius: 9px;
  transition: background .1s;
}
.staff-row:hover { background: #f1f5f9; }
.s-avatar {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11.5px; font-weight: 600; color: #fff;
}
.s-name  { display: block; font-size: 13.5px; font-weight: 500; color: #1e293b; }
.s-shift { display: block; font-size: 11.5px; color: #94a3b8; margin-top: 1px; }
.s-status {
  margin-left: auto; padding: 3px 9px; border-radius: 5px;
  font-size: 11.5px; font-weight: 600; white-space: nowrap;
}
.s-status.on-time { background: #f0fdf4; color: #15803d; }
.s-status.late    { background: #fffbeb; color: #b45309; }
.s-status.pending { background: #f8fafc; color: #64748b; }

/* Payroll panel */
.payroll-donut-wrap { height: 130px; position: relative; }
.payroll-stats { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.ps-item { display: flex; align-items: center; gap: 9px; font-size: 13px; }
.ps-dot   { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.ps-label { flex: 1; color: #475569; }
.ps-val   { font-weight: 600; color: #1e293b; }

/* Orders panel */
.orders-list { display: flex; flex-direction: column; gap: 6px; }
.order-row {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 11px; background: #f8fafc; border-radius: 8px;
}
.order-id { font-family: 'DM Mono', monospace; font-size: 12px; color: #94a3b8; width: 44px; flex-shrink: 0; }
.order-items { display: block; font-size: 13px; font-weight: 500; color: #1e293b; }
.order-time  { display: block; font-size: 11.5px; color: #94a3b8; margin-top: 1px; }
.order-total { margin-left: auto; font-size: 13.5px; font-weight: 600; color: #0f172a; white-space: nowrap; }

/* Badges */
.badge {
  display: inline-flex; align-items: center;
  padding: 4px 11px; border-radius: 6px;
  font-size: 12px; font-weight: 600; white-space: nowrap;
}
.badge.blue { background: #eff6ff; color: #1d4ed8; }
.badge.red  { background: #fef2f2; color: #dc2626; }

/* ── Low Stock Alerts ─────────────────────────────────────────── */
.alerts-panel { }
.alerts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
.alert-card {
  border: 1px solid #f1f5f9;
  border-radius: 11px;
  padding: 14px 16px;
  background: #fafafa;
  transition: box-shadow .15s;
}
.alert-card:hover { box-shadow: 0 3px 12px rgba(0,0,0,.07); }
.alert-card.critical { border-color: #fca5a5; background: #fff5f5; }
.alert-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.alert-cat { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
.alert-read { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; background: #fef2f2; color: #dc2626; }
.alert-name    { font-size: 14px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
.alert-variant { font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
.alert-meter   { }
.meter-bar { height: 5px; background: #f1f5f9; border-radius: 99px; overflow: hidden; margin-bottom: 5px; }
.meter-fill { height: 100%; border-radius: 99px; transition: width .4s; }
.meter-label { font-size: 11.5px; color: #64748b; font-family: 'DM Mono', monospace; }

/* ── Activity Panel ───────────────────────────────────────────── */
.activity-panel .card-header { margin-bottom: 14px; }
.activity-list { display: flex; flex-direction: column; }
.activity-row {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid #f8fafc;
  animation: fadeUp .3s ease both;
}
.activity-row:last-child { border-bottom: none; }
.act-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  margin-top: 1px;
}
.act-body  { display: flex; flex-direction: column; gap: 3px; }
.act-text  { font-size: 13.5px; color: #334155; }
.act-time  { font-size: 11.5px; color: #94a3b8; }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 1280px) {
  .kpi-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1024px) {
  .charts-row { grid-template-columns: 1fr; }
  .mid-row    { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px) {
  .dashboard  { padding: 18px 16px 36px; }
  .kpi-grid   { grid-template-columns: 1fr 1fr; }
  .mid-row    { grid-template-columns: 1fr; }
  .topbar-title { font-size: 20px; }
}
</style>