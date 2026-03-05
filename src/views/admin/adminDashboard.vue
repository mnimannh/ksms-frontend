<template>
  <div class="layout">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Content -->
    <div class="dashboard">
      <h1 class="title">Admin Dashboard</h1>

      <!-- KPI CARDS -->
      <div class="cards">
        <div class="card">
          <h3>Active Staff</h3>
          <p>{{ stats.activeStaff }}</p>
        </div>

        <div class="card">
          <h3>Orders Today</h3>
          <p>{{ stats.ordersToday }}</p>
        </div>

        <div class="card">
          <h3>Low Stock Alerts</h3>
          <p>{{ stats.lowStock }}</p>
        </div>

        <div class="card">
          <h3>Pending Attendance</h3>
          <p>{{ stats.pendingAttendance }}</p>
        </div>
      </div>

      <!-- CHARTS -->
      <div class="charts">
        <div class="chart-box">
          <h3>Low Stock Variants</h3>
          <Bar :data="lowStockChartData" :options="barOptions"/>
        </div>

        <div class="chart-box">
          <h3>Attendance Status Today</h3>
          <Pie :data="attendanceChartData" :options="pieOptions"/>
        </div>
      </div>

      <!-- TABLES -->
      <div class="tables">
        <div class="table-box">
          <h3>Low Stock Alerts</h3>
          <table>
            <thead>
              <tr>
                <th>Variant</th>
                <th>Stock</th>
                <th>Threshold</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in lowStockList" :key="item.id">
                <td>{{ item.variant }}</td>
                <td>{{ item.stock }}</td>
                <td>{{ item.threshold }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-box">
          <h3>Recent Orders</h3>
          <table>
            <thead>
              <tr>
                <th>Variant</th>
                <th>Quantity</th>
                <th>Order Time</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id">
                <td>{{ order.variant }}</td>
                <td>{{ order.quantity }}</td>
                <td>{{ order.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from "@/components/sidebar/AdminSidebar.vue";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "vue-chartjs";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement
);

export default {
  name: "AdminDashboard",
  components: { AdminSidebar, Pie, Bar },
  data() {
    return {
      // KPI Cards
      stats: {
        activeStaff: 12,
        ordersToday: 34,
        lowStock: 5,
        pendingAttendance: 3,
      },

      // Low Stock Bar Chart
      lowStockChartData: {
        labels: ["Cola 330ml", "Sprite 500ml", "Instant Noodles", "Iced Tea", "Energy Drink"],
        datasets: [
          {
            label: "Stock Remaining",
            data: [8, 6, 5, 12, 3],
            backgroundColor: "#f44336",
          },
        ],
      },
      barOptions: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true },
        },
      },

      // Attendance Pie Chart
      attendanceChartData: {
        labels: ["Completed", "Late", "Missed", "Pending"],
        datasets: [
          {
            data: [6, 2, 1, 3],
            backgroundColor: ["#4caf50", "#ff9800", "#f44336", "#9e9e9e"],
          },
        ],
      },
      pieOptions: { responsive: true },

      // Low Stock Table
      lowStockList: [
        { id: 1, variant: "Cola 330ml", stock: 8, threshold: 10 },
        { id: 2, variant: "Sprite 500ml", stock: 6, threshold: 10 },
        { id: 3, variant: "Instant Noodles", stock: 5, threshold: 10 },
        { id: 4, variant: "Energy Drink", stock: 3, threshold: 10 },
      ],

      // Recent Orders Table
      recentOrders: [
        { id: 1, variant: "Cola 330ml", quantity: 3, time: "2026-03-06 08:15" },
        { id: 2, variant: "Sprite 500ml", quantity: 2, time: "2026-03-06 09:02" },
        { id: 3, variant: "Iced Tea", quantity: 1, time: "2026-03-06 10:25" },
        { id: 4, variant: "Instant Noodles", quantity: 4, time: "2026-03-06 11:40" },
      ],
    };
  },
};
</script>

<style scoped>
/* 1. MAIN LAYOUT FIX */
.layout {
  display: flex;
  width: 100%;
  height: 100vh;
  overflow: hidden; /* Prevents the whole page from scrolling, only the dashboard will */
}

/* 2. DASHBOARD CONTAINER */
.dashboard {
  flex: 1;
  min-width: 0; /* CRITICAL: Allows flex child to shrink below content size */
  padding: 25px;
  background: #f5f6fa;
  overflow-y: auto; /* Dashboard scrolls independently of sidebar */
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 25px;
  color: #1e293b;
}

/* 3. KPI CARDS - Responsive Grid */
.cards {
  display: grid;
  /* Adjusts column count based on available space */
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card h3 {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.card p {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

/* 4. CHARTS & TABLES - Two column layout that stacks on mobile */
.charts, .tables {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 25px;
  margin-bottom: 30px;
}

/* Handle smaller screens for charts/tables */
@media (max-width: 900px) {
  .charts, .tables {
    grid-template-columns: 1fr;
  }
}

.chart-box, .table-box {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  min-width: 0; /* Fixes Chart.js overflow bugs */
}

.chart-box h3, .table-box h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #1e293b;
}

/* 5. TABLE STYLING */
.table-box {
  overflow-x: auto; /* Allows table to scroll if it gets too wide */
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

thead {
  background-color: #f8fafc;
}

th {
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #64748b;
  border-bottom: 2px solid #e2e8f0;
}

td {
  padding: 12px 15px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

tr:hover {
  background-color: #f8fafc;
}

/* Scrollbar styling for a cleaner look */
.dashboard::-webkit-scrollbar {
  width: 6px;
}
.dashboard::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>