<template>
  <div class="admin-sidebar">
    <h2 class="logo">My System</h2>
    <ul class="nav">
      <li><a href="#">Dashboard</a></li>
      <li><a href="#">Inventory</a></li>
      <li><a href="#">Payroll</a></li>
      <li><a href="#">Shift</a></li>
      <li><a href="#">Alarm</a></li>
      <li><a href="#">Report</a></li>
    </ul>
    <div class="logout">
      <a href="#" @click.prevent="handleLogout">Logout</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminSidebar",
  methods: {
    handleLogout() {
      // Remove token from localStorage
      localStorage.removeItem('userToken');

      // Optional: remove any other user-related info
      localStorage.removeItem('userRole');

      // Redirect to login page
      window.location.href = "/";
    },
  },
};
</script>

<style scoped>
.admin-sidebar {
  width: 220px;
  height: 100vh;
  background-color: #1e293b;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 0;
}

.logo {
  text-align: center;
  font-size: 1.4rem;
  margin-bottom: 30px;
}

.nav {
  list-style: none;
  padding: 0;
}

.nav li {
  margin: 10px 0;
}

.nav a {
  color: #e2e8f0;
  text-decoration: none;
  padding: 10px 20px;
  display: block;
  transition: background 0.3s;
}

.nav a:hover {
  background-color: #334155;
  border-radius: 8px;
}

.logout {
  text-align: center;
  border-top: 1px solid #334155;
  padding-top: 15px;
}

.logout a {
  color: #f87171;
  text-decoration: none;
  font-weight: bold;
}

.logout a:hover {
  color: #ef4444;
}
</style>
