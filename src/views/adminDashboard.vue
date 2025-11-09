<template>
  <div class="admin-dashboard">
    <AdminSidebar />
    <div class="main-content">
      <h1>Admin Dashboard</h1>
      <p>Welcome! Add your dashboard content here.</p>
    </div>
  </div>
</template>

<script>
import AdminSidebar from "@/components/adminSidebar.vue";

export default {
  name: "AdminDashboard",
  components: {
    AdminSidebar,
  },
  mounted() {
    // Get token from localStorage
    const token = localStorage.getItem('userToken');

    if (!token) {
      // No token, redirect to login
      window.location.href = "/";
      return;
    }

    // Call backend to verify token
    fetch("http://localhost:3000/auth/checkSession", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          // Invalid or expired token, redirect to login
          localStorage.removeItem('userToken'); // optional: clear invalid token
          window.location.href = "/";
        }
      })
      .catch(() => {
        // Any network error, redirect to login
        window.location.href = "/";
      });
  },
};
</script>

<style scoped>
.admin-dashboard {
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
