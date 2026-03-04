<template>
  <div class="admin-sidebar">
    <!-- HEADER -->
    <div class="sidebar-header">
      <div class="logo-container">
        <router-link to="" class="logo-icon">
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
      <ul class="nav flex-column"> <!-- 🔥 bootstrap safe -->
        <li
          v-for="item in menu"
          :key="item.path"
          class="nav-item"
        >
          <router-link
            :to="item.path"
            class="nav-link custom-link"
            :class="{ active: $route.path.startsWith(item.path) }"
          >
            {{ item.name }}
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- FOOTER -->
    <div class="sidebar-footer">
      <div class="user-info d-flex align-items-center">
        <!-- <div class="avatar">
          {{ user.fullName ? user.fullName.charAt(0) : "S" }}
        </div> -->
        <div class="ms-2">
          <div class="user-name">{{ user.fullName || "Staff" }}</div>
          <div class="user-role">{{ user.role || "Employee" }}</div>
        </div>
      </div>

      <button class="logout-btn mt-2" @click="handleLogout">
        Logout
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: "StaffSidebar",
  data() {
    return {
      menu: [
        { name: "Dashboard", path: "/staff/dashboard" },
        { name: "POS", path: "/staff/pos" },
        { name: "Shift", path: "/staff/shifts" },
        { name: "Payroll", path: "/staff/payroll" },
      ],
      user: {
        fullName: "",
        role: ""
      }
    };
  },
    mounted() {
    // Load from localStorage first
    const savedName = localStorage.getItem("userName");
    const savedRole = localStorage.getItem("userRole");

    if (savedName) this.user.fullName = savedName;
    if (savedRole) this.user.role = savedRole;

    // Fetch fresh info from backend
    this.fetchUserInfo();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        // Updated API path to match backend route
        const response = await fetch("http://127.0.0.1:3000/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to fetch user info");

        const data = await response.json();

        // Update sidebar
        this.user.fullName = data.fullName || "Admin";
        this.user.role = data.role || "Administrator";

        // Update localStorage so it persists on refresh
        localStorage.setItem("userName", this.user.fullName);
        localStorage.setItem("userRole", this.user.role);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },

    handleLogout() {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
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

.logo-icon {
  width: 36px;
  height: 36px;
  background: #2563eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
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

/* 🔥 IMPORTANT FIX */
.nav {
  width: 100%;
}

/* override bootstrap nav-link */
.custom-link {
  display: block;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  color: #cbd5e1 !important;
  text-decoration: none;
  margin-bottom: 6px;
  transition: 0.2s;
}

.custom-link:hover {
  background: #1e293b;
  color: white !important;
}

.custom-link.active {
  background: #2563eb;
  color: white !important;
}

/* FOOTER */
.sidebar-footer {
  padding: 15px;
  border-top: 1px solid #1e293b;
}

.user-info {
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

.user-name {
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  color: #94a3b8;
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