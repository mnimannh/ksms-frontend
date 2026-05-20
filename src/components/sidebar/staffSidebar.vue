<template>
  <div>
    <transition name="fade">
      <div
        v-if="isMobile && isOpen"
        class="sidebar-backdrop"
        @click="closeSidebar"
      />
    </transition>

    <div
      class="admin-sidebar"
      :class="{
        'is-collapsed': isCollapsed && !isMobile,
        'is-open': isMobile && isOpen,
        'is-mobile': isMobile
      }"
    >
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

        <button
          v-if="!isMobile"
          class="collapse-btn"
          @click="toggleCollapse"
          :title="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              :d="isCollapsed ? 'M6 3l5 5-5 5' : 'M10 3L5 8l5 5'"
              stroke="currentColor" stroke-width="1.8"
              stroke-linecap="round" stroke-linejoin="round"
            />
          </svg>
        </button>

        <button v-if="isMobile" class="collapse-btn" @click="closeSidebar">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <nav class="nav-container">
        <p class="nav-section-label">Menu</p>
        <ul class="sidebar-nav">
          <li v-for="item in menu" :key="item.path" class="nav-item">
            <router-link
              :to="item.path"
              class="nav-link"
              :class="{ active: $route.path.startsWith(item.path) }"
              :title="isCollapsed && !isMobile ? item.name : ''"
              @click.stop="handleNavClick"
            >
              <span class="nav-icon-wrap">
                <span class="nav-icon" v-html="item.icon"></span>
                <span v-if="item.path === '/staff/profile' && isTempPassword" class="temp-badge"></span>
              </span>
              <span class="nav-label">{{ item.name }}</span>
              <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
              <span v-else-if="$route.path.startsWith(item.path)" class="active-dot"></span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <img v-if="user.profilePicture" :src="picUrl(user.profilePicture)" class="user-avatar user-avatar-img" alt="avatar" />
          <div v-else class="user-avatar">{{ (user.fullName || 'S').charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <div class="user-name">{{ user.fullName || 'Staff' }}</div>
            <div class="user-role">{{ user.role || 'Employee' }}</div>
          </div>
        </div>

        <button class="logout-btn" @click="handleLogout">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M10 11l3-3-3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M13 8H6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
          <span class="logout-label">Logout</span>
        </button>
      </div>
    </div>

    <button v-if="isMobile && !isOpen" class="mobile-toggle" @click="openSidebar">
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      </svg>
    </button>
  </div>
</template>

<script>
import API_BASE_URL from '@/services/api';
import axios from 'axios';

// Extracts the logged-in User ID smoothly out of your JWT structure
function getUserIdFromToken(token) {
  try {
    if (!token) return null;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const decoded = JSON.parse(jsonPayload);
    return decoded.id || decoded.userId || null;
  } catch (e) {
    return null;
  }
}

export default {
  name: "StaffSidebar",
  data() {
    return {
      isCollapsed: false,
      isOpen: false,
      isMobile: false,
      menu: [
        { name: "Dashboard", path: "/staff/dashboard", icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/><rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" stroke-width="1.5"/></svg>`, badge: null },
        { name: "POS", path: "/staff/pos", icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M5 7h2m2 0h2M5 10h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 9v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`, badge: null },
        { name: "Shift", path: "/staff/shifts", icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 4.5V8l2.5 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`, badge: null },
        { name: "Payroll", path: "/staff/payroll", icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 6v4M6 7.5c0-.83.67-1.5 1.5-1.5h1a1.5 1.5 0 010 3h-1A1.5 1.5 0 006 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`, badge: null },
        { name: "Profile", path: "/staff/profile", icon: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`, badge: null },
      ],
      user: { fullName: "", role: "", profilePicture: null },
      isTempPassword: false,
      apiBase: API_BASE_URL,
      pollInterval: null
    };
  },
  mounted() {
    const savedName = localStorage.getItem("userName");
    const savedRole = localStorage.getItem("userRole");
    if (savedName) this.user.fullName = savedName;
    if (savedRole) this.user.role = savedRole;

    this.checkMobile();
    const saved = localStorage.getItem('staffSidebarCollapsed');
    if (saved !== null) this.isCollapsed = saved === '1';
    window.addEventListener('resize', this.checkMobile);

    this.fetchUserInfo();
    this.fetchSwapNotifications();
    this.pollInterval = setInterval(() => this.fetchSwapNotifications(), 5000);
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    if (this.pollInterval) clearInterval(this.pollInterval);
  },
  methods: {
    picUrl(url) {
      if (!url) return ''
      if (url.startsWith('http')) return url
      return `${this.apiBase}${url}`
    },
    checkMobile() {
      this.isMobile = window.innerWidth < 768;
      if (!this.isMobile) this.isOpen = false;
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem('staffSidebarCollapsed', this.isCollapsed ? '1' : '0');
      this.$emit('collapse-change', this.isCollapsed);
    },
    openSidebar() {
      this.isOpen = true;
    },
    closeSidebar() {
      this.isOpen = false;
    },
    handleNavClick() {
      if (this.isMobile) this.closeSidebar();
    },

    async fetchUserInfo() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;
        const res = await axios.get(`${API_BASE_URL}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.user.fullName = res.data.fullName || "Staff";
        this.user.role = res.data.role || "Employee";
        this.user.profilePicture = res.data.profile_picture || null;
        this.isTempPassword = !!res.data.is_temp_password;
        localStorage.setItem("userName", this.user.fullName);
        localStorage.setItem("userRole", this.user.role);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    },

    async fetchSwapNotifications() {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return;

        const currentUserId = getUserIdFromToken(token);
        if (!currentUserId) return;

        const res = await axios.get(`${API_BASE_URL}/api/swaps`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const swapRequests = res.data || [];
        
        const shiftMenu = this.menu.find(m => m.name === "Shift");
        if (shiftMenu) {
          // Filters objects where status is 'pending' and the user is targeted (target_id)
          const pendingCount = swapRequests.filter(req => {
            return req.status === 'pending' && Number(req.target_id) === Number(currentUserId);
          }).length;
          
          shiftMenu.badge = pendingCount || null;
        }
      } catch (err) {
        console.error("Error fetching swap notifications:", err);
      }
    },

    handleLogout() {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      window.location.href = "/";
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

/* ── Backdrop ── */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 99;
  backdrop-filter: blur(2px);
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ── Sidebar base ── */
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
  overflow: hidden;
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  flex-shrink: 0;
}

/* ── Collapsed (desktop icon-rail) ── */
.admin-sidebar.is-collapsed {
  width: 64px;
  min-width: 64px;
}

/* ── Mobile: hidden off-screen by default ── */
.admin-sidebar.is-mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transform: translateX(-100%);
  width: 240px;
  min-width: 240px;
}

.admin-sidebar.is-mobile.is-open {
  transform: translateX(0);
}

/* ── Mobile hamburger button ── */
.mobile-toggle {
  position: fixed;
  top: 14px;
  left: 14px;
  z-index: 98;
  width: 38px;
  height: 38px;
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.mobile-toggle:hover {
  background: #1e293b;
  color: #e2e8f0;
}

/* ── Header ── */
.sidebar-header {
  padding: 20px 16px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
}

.logo-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  overflow: hidden;
  flex: 1;
  min-width: 0;
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
  white-space: nowrap;
  overflow: hidden;
  opacity: 1;
  transition: opacity 0.2s ease, width 0.25s ease;
}

/* Hide text labels when collapsed */
.is-collapsed .logo-text,
.is-collapsed .nav-label,
.is-collapsed .active-dot,
.is-collapsed .logout-label,
.is-collapsed .user-info,
.is-collapsed .nav-section-label {
  opacity: 0;
  width: 0;
  overflow: hidden;
  pointer-events: none;
}

/* Badge rules when collapsed */
.is-collapsed .nav-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 15px;
  height: 15px;
  font-size: 9px;
  padding: 0 3px;
}

/* Collapse toggle button */
.collapse-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}
.collapse-btn:hover {
  background: rgba(255,255,255,0.1);
  color: #94a3b8;
}

/* ── Nav ── */
.nav-container {
  flex: 1;
  padding: 18px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #475569;
  padding: 0 8px;
  margin: 0 0 10px;
  white-space: nowrap;
  transition: opacity 0.2s ease;
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
  padding: 9px 10px;
  border-radius: 8px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 400;
  transition: background 0.15s, color 0.15s;
  position: relative;
  white-space: nowrap;
  overflow: hidden;
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

/* Center icon in collapsed mode */
.is-collapsed .nav-link {
  justify-content: center;
  padding: 10px;
}

.nav-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
}

.nav-link.active .nav-icon { opacity: 1; }
.nav-link.active .nav-icon-wrap .nav-icon { opacity: 1; }

.nav-label {
  flex: 1;
  transition: opacity 0.2s ease;
  overflow: hidden;
  text-overflow: ellipsis;
}

.active-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}

/* ── Notification Badge ── */
.nav-badge {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 99px;
  background: #ef4444;
  color: #fff;
  font-size: 10.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  flex-shrink: 0;
  animation: badgePulse 2s ease infinite;
  transition: all 0.2s ease;
}

@keyframes badgePulse {
  0%, 100% { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.25); }
  50%       { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
}

/* ── Footer ── */
.sidebar-footer {
  padding: 14px 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex-shrink: 0;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 9px;
  background: rgba(255,255,255,0.04);
  overflow: hidden;
}

/* Center avatar in collapsed mode */
.is-collapsed .user-card {
  justify-content: center;
  padding: 8px;
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
.user-avatar-img {
  object-fit: cover;
  background: none;
}

.user-info {
  overflow: hidden;
  transition: opacity 0.2s ease;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: #64748b;
  text-transform: capitalize;
  margin-top: 1px;
  white-space: nowrap;
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
  overflow: hidden;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.35);
  color: #fecaca;
}

.logout-label {
  white-space: nowrap;
  transition: opacity 0.2s ease;
}

/* ── Temp password badge ── */
.temp-badge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ef4444;
  border: 1.5px solid #0f172a;
  display: block;
}

/* ── Scrollbar ── */
.nav-container::-webkit-scrollbar { width: 3px; }
.nav-container::-webkit-scrollbar-track { background: transparent; }
.nav-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
</style>