<template>
  <div class="staff-dashboard">
    <StaffSidebar />
    <div class="main-content">
      <h1>Staff Dashboard</h1>
      <p>Welcome! Your courses, assignments, and grades will appear here.</p>
    </div>
  </div>
</template>

<script>
import StaffSidebar from "@/components/staffSidebar.vue";

export default {
  name: "StaffDashboard",
  components: {
    StaffSidebar,
  },
  mounted() {
    const token = localStorage.getItem('userToken');
    if (!token) {
      window.location.href = "/";
      return;
    }

    // Check session with backend
    fetch("http://localhost:3000/auth/checkSession", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'staff') {
          // Invalid role or session, redirect
          localStorage.removeItem('userToken');
          window.location.href = "/";
        }
      })
      .catch(() => {
        window.location.href = "/";
      });
  },
};
</script>

<style scoped>
.staff-dashboard {
  display: flex;
  height: 100vh;
  background-color: #f8fafc;
}

.main-content {
  flex-grow: 1;
  padding: 30px;
  color: #1e293b;
}
</style>
