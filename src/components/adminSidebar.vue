<template>
  <div class="admin-sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div class="logo-container">
        <router-link to="/" class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </router-link>
        <h2 class="logo">KSMS</h2>
      </div>
    </div>

    <!-- NAV -->
    <nav class="nav-container">
      <ul class="sidebar-nav">
        <li v-for="item in menu" :key="item.path" class="nav-item">
          <router-link 
            :to="item.path" 
            class="nav-link"
            :class="{ active: $route.path === item.path }"
          >
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- FOOTER -->
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="avatar">{{ user.fullName.charAt(0) || "A" }}</div>
        <div>
          <div class="user-name">{{ user.fullName || "Admin" }}</div>
          <div class="user-role">{{ user.role || "Administrator" }}</div>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        Logout
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminSidebar",
  data() {
    return {
      menu: [
        { name: "Dashboard", path: "/admin/dashboard" },
        { name: "Inventory", path: "/admin/inventory" },
        { name: "Payroll", path: "/admin/payroll" },
        { name: "Shift", path: "/admin/shift" },
        { name: "Alarm", path: "/admin/alarm" },
        { name: "Report", path: "/admin/report" }
      ],
      user: {
        fullName: "",
        role: ""
      }
    };
  },
  mounted() {
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        const response = await fetch("http://127.0.0.1:3000/api/user/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch user info");
        const data = await response.json();
        this.user.fullName = data.fullname || "Admin"; // adjust key based on your DB
        this.user.role = data.role || "Administrator";
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },
    handleLogout() {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userRole");
      window.location.href = "/";
    }
  }
};
</script>

<style scoped>
.admin-sidebar {
  width: 260px;
  height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.sidebar-header {
  padding: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

/* NAV */
.nav-container {
  flex: 1;
  padding: 10px;
}

.nav {
  list-style: none;
  padding: 0;
}

.nav-link {
  display: block;
  padding: 10px 14px;
  border-radius: 8px;
  color: #cbd5e1;
  text-decoration: none;
  margin-bottom: 6px;
  transition: 0.2s;
}

.nav-link:hover {
  background: #1e293b;
}

.nav-link.active {
  background: #2563eb;
  color: white;
}

/* FOOTER */
.sidebar-footer {
  padding: 15px;
  border-top: 1px solid #1e293b;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.avatar {
  width: 35px;
  height: 35px;
  background: #2563eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.logout-btn {
  width: 100%;
  padding: 10px;
  background: #ef4444;
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
}
</style>