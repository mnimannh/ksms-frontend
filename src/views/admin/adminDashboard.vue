<template>
  <div class="layout">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Main Dashboard -->
    <div class="dashboard">
      <h1>Admin Dashboard</h1>

      <div class="cards">
        <div class="card">Total Staff</div>
        <div class="card">Total Sales</div>
        <div class="card">Inventory Status</div>
        <div class="card">Today's Attendance</div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue';

export default {
  name: "AdminDashboard",
  components: {
    AdminSidebar
  }
};
</script>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
}

.dashboard {
  flex: 1;
  padding: 20px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.card {
  background: #f4f4f4;
  padding: 20px;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
}
</style>
