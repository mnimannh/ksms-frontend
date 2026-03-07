<template>
  <div class="admin-sidebar">

    <!-- HEADER -->
    <div class="sidebar-header">
      <router-link to="" class="logo-wrap">
        <div class="logo-icon">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.8"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.8"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </div>
        <span class="logo-text">KSMS</span>
      </router-link>
    </div>

    <!-- NAV -->
    <nav class="nav-container">
      <p class="nav-section-label">Menu</p>
      <ul class="sidebar-nav">
        <li v-for="item in menu" :key="item.path" class="nav-item">
          <router-link
            :to="item.path"
            class="nav-link"
            :class="{ active: $route.path === item.path }"
          >
            <span class="nav-icon" v-html="item.icon"></span>
            <span class="nav-label">{{ item.name }}</span>
            <span v-if="$route.path === item.path" class="active-dot"></span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- FOOTER -->
    <div class="sidebar-footer">
      <div class="user-card">
        <div class="user-avatar">{{ (user.fullName || 'A').charAt(0).toUpperCase() }}</div>
        <div class="user-info">
          <div class="user-name">{{ user.fullName || 'Admin' }}</div>
          <div class="user-role">{{ user.role || 'Administrator' }}</div>
        </div>
      </div>

      <button class="logout-btn" @click="handleLogout">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          <path d="M10 11l3-3-3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13 8H6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>
        Logout
      </button>
    </div>

  </div>
</template>

<script>
import API_BASE_URL from '@/services/api';
import axios from 'axios';
export default {
  name: "AdminSidebar",
  data() {
    return {
      menu: [
        {
          name: "Dashboard", path: "/admin/dashboard",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>`
        },
        {
          name: "Inventory", path: "/admin/inventory",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="4" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 4V3a3 3 0 016 0v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M1 8h14" stroke="currentColor" stroke-width="1.5"/></svg>`
        },
        {
          name: "Payroll", path: "/admin/payroll",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 6v4M6 7.5c0-.83.67-1.5 1.5-1.5h1a1.5 1.5 0 010 3h-1A1.5 1.5 0 006 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
        },
        {
          name: "Shift", path: "/admin/shift",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5V8l2.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
        },
        {
          name: "Alarm", path: "/admin/alarm",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 1.5a5 5 0 015 5v3l1 2H2l1-2v-3a5 5 0 015-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M6.5 13.5a1.5 1.5 0 003 0" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
        },
        {
          name: "Report", path: "/admin/report",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 5h6M5 8h6M5 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
        },
        {
          name: "User", path: "/admin/user",
          icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3.31 2.69-6 6-6s6 2.69 6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`
        }
      ],
      user: { fullName: "", role: "" }
    };
  },
  mounted() {
    const savedName = localStorage.getItem("userName");
    const savedRole = localStorage.getItem("userRole");
    if (savedName) this.user.fullName = savedName;
    if (savedRole) this.user.role = savedRole;
    this.fetchUserInfo();
  },
  methods: {
async fetchUserInfo() {
  try {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    this.user.fullName = response.data.fullName || "Admin";
    this.user.role = response.data.role || "Administrator";
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
    },
    isActive(path) {
      return this.$route.path.startsWith(path);
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.admin-sidebar {
  width: 240px;
  min-width: 240px;
  height: 100vh;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  font-family: 'DM Sans', sans-serif;
  position: sticky;
  top: 0;
}

/* ── Header ── */
.sidebar-header {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon {
  width: 34px;
  height: 34px;
  background: rgba(37, 99, 235, 0.2);
  border: 1px solid rgba(37, 99, 235, 0.35);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #60a5fa;
  flex-shrink: 0;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 0.08em;
}

/* ── Nav ── */
.nav-container {
  flex: 1;
  padding: 20px 12px;
  overflow-y: auto;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #475569;
  padding: 0 8px;
  margin: 0 0 10px;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item { list-style: none; }

.nav-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 400;
  transition: background 0.15s, color 0.15s;
  position: relative;
}

.nav-link:hover {
  background: rgba(255,255,255,0.05);
  color: #e2e8f0;
}

.nav-link.active {
  background: rgba(37, 99, 235, 0.15);
  color: #93c5fd;
  font-weight: 500;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.75;
}

.nav-link.active .nav-icon { opacity: 1; }

.nav-label { flex: 1; }

.active-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}

/* ── Footer ── */
.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 9px;
  background: rgba(255,255,255,0.04);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.3;
}

.user-role {
  font-size: 11px;
  color: #64748b;
  text-transform: capitalize;
  margin-top: 1px;
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 8px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #fca5a5;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, color 0.15s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fecaca;
}
</style>