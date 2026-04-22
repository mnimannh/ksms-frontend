<template>
  <div class="app-layout">
    <AdminSidebar />

    <main class="page">

      <!-- ── TOP BAR ── -->
      <div class="topbar">
        <div class="topbar-left">
          <p class="topbar-date">{{ today }}</p>
          <h1 class="topbar-title">Manage <span class="accent">Users</span></h1>
        </div>
        <div class="topbar-right">
          <button class="btn-bulk-rate" @click="showBulkRateModal = true">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            Set All Rates
          </button>
          <button class="btn-add" @click="openAddModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New User
          </button>
        </div>
      </div>

      <!-- ── SUMMARY CARDS ── -->
      <div class="summary-row">
        <div class="summary-card" style="animation-delay:0ms">
          <div class="summary-icon" style="background:#eef2ff; color:#6366f1">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ users.length }}</p>
            <p class="summary-label">Total Users</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:60ms">
          <div class="summary-icon" style="background:#eff6ff; color:#3b82f6">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0113 0"/><polyline points="16 11 18 13 22 9"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ users.filter(u => u.role === 'admin').length }}</p>
            <p class="summary-label">Admins</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:120ms">
          <div class="summary-icon" style="background:#f0fdf4; color:#10b981">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0113 0"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ users.filter(u => u.role === 'staff').length }}</p>
            <p class="summary-label">Staff</p>
          </div>
        </div>
        <div class="summary-card" style="animation-delay:180ms">
          <div class="summary-icon" style="background:#fffbeb; color:#f59e0b">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <p class="summary-val">{{ users.filter(u => u.status === 'active').length }}</p>
            <p class="summary-label">Active</p>
          </div>
        </div>
      </div>

      <!-- ── PANEL ── -->
      <div class="panel">
        <div class="card-header">
          <div>
            <p class="card-title">All Users</p>
            <p class="card-sub">Manage system access and roles</p>
          </div>
          <div class="toolbar-right">
            <div class="dropdown">
              <button class="btn-filter" @click.stop="openDropdown = openDropdown === 'role' ? null : 'role'">
                <span class="filter-label">Role</span>
                <span class="filter-value">{{ selectedRole }}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <div class="dropdown-menu" :class="{ open: openDropdown === 'role' }">
                <div @click="setRoleFilter('All')"   class="dropdown-item" :class="{ active: selectedRole === 'All' }">All Roles</div>
                <div @click="setRoleFilter('admin')" class="dropdown-item" :class="{ active: selectedRole === 'admin' }">Admin</div>
                <div @click="setRoleFilter('staff')" class="dropdown-item" :class="{ active: selectedRole === 'staff' }">Staff</div>
              </div>
            </div>
            <div class="dropdown">
              <button class="btn-filter" @click.stop="openDropdown = openDropdown === 'status' ? null : 'status'">
                <span class="filter-label">Status</span>
                <span class="filter-value">{{ selectedStatus === 'all' ? 'All' : selectedStatus === 'active' ? 'Active' : 'Inactive' }}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
              <div class="dropdown-menu" :class="{ open: openDropdown === 'status' }">
                <div @click="selectedStatus = 'all';    openDropdown = null" class="dropdown-item" :class="{ active: selectedStatus === 'all' }">All</div>
                <div @click="selectedStatus = 'active'; openDropdown = null" class="dropdown-item" :class="{ active: selectedStatus === 'active' }">Active</div>
                <div @click="selectedStatus = 'inactive'; openDropdown = null" class="dropdown-item" :class="{ active: selectedStatus === 'inactive' }">Inactive</div>
              </div>
            </div>
            <div class="search-box">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/><path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              <input v-model="searchQuery" type="text" placeholder="Search users..." />
            </div>
          </div>
        </div>

        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th class="th-avatar">Photo</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in filteredUsers" :key="user.id" class="table-row">
                <td class="td-num">{{ index + 1 }}</td>
                <td class="td-avatar">
                  <img
                    v-if="user.profile_picture"
                    :src="apiBase + user.profile_picture"
                    class="row-avatar row-avatar-img"
                    :alt="user.fullName"
                    @click="openLightbox(user)"
                  />
                  <div
                    v-else
                    class="row-avatar row-avatar-initials"
                    :style="{ background: avatarColor(user.fullName) }"
                  >{{ user.fullName.charAt(0).toUpperCase() }}</div>
                </td>
                <td>
                  <span class="user-name">{{ user.fullName }}</span>
                </td>
                <td class="td-email">{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="'role-' + user.role">{{ user.role }}</span>
                </td>
                <td class="td-muted">{{ formatDate(user.last_login) }}</td>
                <td class="td-muted">{{ formatDate(user.created_at) }}</td>
                <td>
                  <span class="status-pill" :class="user.status === 'active' ? 'status-active' : 'status-inactive'">
                    <span class="status-dot"></span>{{ user.status }}
                  </span>
                </td>
                <td>
                  <div class="action-group">
                    <button class="btn-action" @click="openEditModal(user)">Edit</button>
                    <button v-if="user.role === 'staff' && user.status === 'active'" class="btn-rate" @click="openRateModal(user)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                      Rate
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredUsers.length === 0">
                <td colspan="9" class="empty-state">No users found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer">
          <span>Showing <strong>{{ filteredUsers.length }}</strong> of <strong>{{ users.length }}</strong> users</span>
        </div>
      </div>

    </main>

    <UserModal
      :visible="showModal"
      :user="selectedUser"
      @close="showModal = false"
      @save="onUserSaved"
      @error="onUserError"
    />

    <RateModal
      v-if="rateUser"
      :visible="showRateModal"
      :user="rateUser"
      @close="showRateModal = false"
    />

    <BulkRateModal
      :visible="showBulkRateModal"
      :staffList="staffUsers"
      @close="showBulkRateModal = false"
      @saved="showBulkRateModal = false"
    />

    <!-- TOAST -->
    <transition name="toast-slide">
      <div v-if="toast.show" class="toast" :class="'toast-' + toast.type">
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <span class="toast-msg">{{ toast.message }}</span>
        <button class="toast-close" @click="toast.show = false">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </transition>

    <!-- LIGHTBOX -->
    <transition name="lb">
      <div v-if="lightboxUser" class="lightbox" @click.self="closeLightbox">
        <button class="lb-close" @click="closeLightbox">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <div class="lb-content">
          <img :src="apiBase + lightboxUser.profile_picture" class="lb-img" :alt="lightboxUser.fullName" />
          <p class="lb-name">{{ lightboxUser.fullName }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import API_BASE_URL from "@/services/api";
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import UserModal from '@/components/admin-user/UserModal.vue'
import RateModal from '@/components/admin-user/RateModal.vue'
import BulkRateModal from '@/components/admin-user/BulkRateModal.vue'
import axios from 'axios'

const AVATAR_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#ec4899','#14b8a6']

export default {
  name: 'AdminUser',
  components: { AdminSidebar, UserModal, RateModal, BulkRateModal },

  data() {
    return {
      today: new Date().toLocaleDateString('en-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      users: [],
      searchQuery: '',
      showModal: false,
      selectedUser: null,
      selectedRole: 'All',
      selectedStatus: 'all',
      showRateModal: false,
      rateUser: null,
      showBulkRateModal: false,
      openDropdown: null,
      lightboxUser: null,
      apiBase: API_BASE_URL,
      toast: { show: false, type: 'success', message: '' },
      toastTimer: null,
    }
  },

  computed: {
    staffUsers() {
      return this.users.filter(u => u.role === 'staff' && u.status === 'active')
    },
    filteredUsers() {
      let users = this.users
      if (this.selectedRole !== 'All')
        users = users.filter(u => u.role.toLowerCase() === this.selectedRole.toLowerCase())
      if (this.selectedStatus !== 'all')
        users = users.filter(u => u.status === this.selectedStatus)
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase()
        users = users.filter(u =>
          u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        )
      }
      return users
    },
  },

  methods: {
    avatarColor(name) {
      const i = name.charCodeAt(0) % AVATAR_COLORS.length
      return AVATAR_COLORS[i]
    },

    async fetchUsers() {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/users`)
        this.users = res.data
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    },

    async deleteUser(id) {
      if (!confirm('Are you sure you want to delete this user?')) return
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${id}`)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err) {
        console.error('Error deleting user:', err)
      }
    },

    refreshUsers() { this.fetchUsers() },

    formatDate(dateStr) {
      if (!dateStr) return '—'
      return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },

    showToast(type, message) {
      clearTimeout(this.toastTimer)
      this.toast = { show: true, type, message }
      this.toastTimer = setTimeout(() => { this.toast.show = false }, 4000)
    },
    onUserSaved({ message }) {
      this.refreshUsers()
      this.showToast('success', message)
    },
    onUserError({ message }) {
      this.showToast('error', message)
    },

    openAddModal()    { this.selectedUser = null; this.showModal = true },
    openEditModal(u)  { this.selectedUser = u;    this.showModal = true },
    openRateModal(u)  { this.rateUser = u;        this.showRateModal = true },
    setRoleFilter(r)  { this.selectedRole = r; this.openDropdown = null },
    openLightbox(u)   { this.lightboxUser = u; },
    closeLightbox()   { this.lightboxUser = null; },
    onKeydown(e)      { if (e.key === 'Escape') this.closeLightbox(); },
  },

  mounted() {
    this.fetchUsers()
    document.addEventListener('click', () => { this.openDropdown = null })
    window.addEventListener('keydown', this.onKeydown)
  },

  beforeUnmount() {
    document.removeEventListener('click', () => { this.openDropdown = null })
    window.removeEventListener('keydown', this.onKeydown)
  },
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=DM+Mono:wght@400;500&display=swap');
</style>

<style scoped>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Base (mobile) ───────────────────────────────────────────── */
.app-layout {
  display: flex; min-height: 100vh;
  background: #f6f7fb; font-family: 'DM Sans', sans-serif; color: #1e293b;
}

.page {
  flex: 1; padding: 20px 16px 40px;
  display: flex; flex-direction: column; gap: 16px; overflow-x: hidden;
}

/* Topbar — stacked on mobile */
.topbar { display: flex; flex-direction: column; gap: 10px; }
.topbar-date  { font-size: 12px; color: #94a3b8; margin-bottom: 4px; }
.topbar-title { font-size: 22px; font-weight: 600; letter-spacing: -.025em; color: #0f172a; }
.topbar-title .accent { color: #6366f1; }
.topbar-right { display: flex; align-items: center; }

.topbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

.btn-bulk-rate {
  display: inline-flex; align-items: center; gap: 7px;
  background: #fff; color: #15803d;
  border: 1px solid #bbf7d0; padding: 9px 14px; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: all .15s;
}
.btn-bulk-rate:hover { background: #f0fdf4; border-color: #86efac; transform: translateY(-1px); }

.btn-add {
  display: inline-flex; align-items: center; gap: 7px;
  background: #16a34a; color: #fff;
  border: none; padding: 9px 16px; border-radius: 9px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  cursor: pointer; transition: background .15s, transform .12s;
}
.btn-add:hover { background: #15803d; transform: translateY(-1px); }

/* Summary — 2 cols on mobile */
.summary-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.summary-card {
  background: #fff; border: 1px solid #f1f5f9; border-radius: 14px;
  padding: 14px 16px; display: flex; align-items: center; gap: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
  animation: fadeUp .35s ease both; transition: box-shadow .15s;
}
.summary-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.07); }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.summary-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.summary-val   { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; margin-bottom: 3px; }
.summary-label { font-size: 11px; color: #94a3b8; }

/* Panel */
.panel {
  background: #fff; border: 1px solid #f1f5f9;
  border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04); overflow: hidden;
}

/* Card header — stacked on mobile */
.card-header {
  display: flex; flex-direction: column; gap: 12px;
  padding: 16px 16px 12px; border-bottom: 1px solid #f8fafc;
}
.card-title { font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 2px; }
.card-sub   { font-size: 12px; color: #94a3b8; }

.toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

/* Dropdown */
.dropdown { position: relative; }
.btn-filter {
  display: flex; align-items: center; gap: 7px;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px; padding: 7px 11px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 12.5px; color: #334155; transition: border-color .15s;
}
.btn-filter:hover { border-color: #e2e8f0; }
.filter-label { color: #94a3b8; font-size: 11.5px; }
.filter-value { font-weight: 500; color: #0f172a; }
.dropdown-menu {
  display: none; position: absolute; top: calc(100% + 4px); left: 0;
  background: #fff; min-width: 130px;
  box-shadow: 0 4px 16px rgba(0,0,0,.08); border: 1px solid #f0f0f0;
  border-radius: 10px; z-index: 100; padding: 4px;
}
.dropdown-menu.open { display: block; }
.dropdown-item { padding: 8px 12px; cursor: pointer; font-size: 13px; color: #374151; border-radius: 6px; transition: background .12s; }
.dropdown-item:hover { background: #f8fafc; }
.dropdown-item.active { background: #f1f5f9; font-weight: 500; color: #0f172a; }

/* Search — expands to fill on mobile */
.search-box {
  display: flex; align-items: center; gap: 7px; flex: 1; min-width: 0;
  background: #f8fafc; border: 1px solid #f1f5f9;
  border-radius: 8px; padding: 7px 11px;
  color: #94a3b8; transition: border-color .18s, box-shadow .18s;
}
.search-box:focus-within { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); background: #fff; }
.search-box input {
  border: none; outline: none; font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1e293b; width: 100%; background: transparent;
}
.search-box input::placeholder { color: #c4c9d4; }

/* Table */
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; border-collapse: collapse; font-size: 13px; min-width: 600px; }
.data-table thead tr { border-bottom: 1px solid #f1f5f9; }
.data-table th {
  background: #fafafa; text-align: left;
  padding: 10px 14px; font-size: 10.5px; font-weight: 600;
  letter-spacing: .07em; text-transform: uppercase; color: #94a3b8; white-space: nowrap;
}
.data-table td { padding: 12px 14px; border-bottom: 1px solid #f8fafc; color: #334155; vertical-align: middle; }
.table-row:last-child td { border-bottom: none; }
.table-row:hover td { background: #fafbfc; }

.td-num   { color: #cbd5e1; font-family: 'DM Mono', monospace; font-size: 12px; width: 36px; }
.th-avatar { width: 52px; text-align: center; }
.td-avatar { width: 52px; text-align: center; }
.td-email { color: #64748b; font-size: 12.5px; }
.td-muted { color: #94a3b8; font-size: 12.5px; white-space: nowrap; }

.row-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff;
  flex-shrink: 0; vertical-align: middle;
}
.row-avatar-img  { object-fit: cover; cursor: zoom-in; border: 2px solid #e2e8f0; transition: border-color .15s, transform .15s; }
.row-avatar-img:hover { border-color: #6366f1; transform: scale(1.08); }
.row-avatar-initials { font-size: 13px; }

/* Lightbox */
.lightbox {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.88); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
}
.lb-content { display: flex; flex-direction: column; align-items: center; gap: 14px; }
.lb-img {
  max-width: min(88vw, 420px); max-height: 80vh;
  border-radius: 14px; object-fit: contain;
  box-shadow: 0 32px 80px rgba(0,0,0,.5);
  animation: lb-pop .22s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes lb-pop { from { transform: scale(.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.lb-name { color: #fff; font-size: 15px; font-weight: 600; letter-spacing: -.01em; }
.lb-close {
  position: absolute; top: 18px; right: 18px;
  width: 38px; height: 38px; border-radius: 50%;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.2);
  color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.lb-close:hover { background: rgba(255,255,255,0.22); }
.lb-enter-active, .lb-leave-active { transition: opacity .2s ease; }
.lb-enter-from, .lb-leave-to { opacity: 0; }

.cell-user { display: flex; align-items: center; gap: 10px; }
.user-avatar {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
}
.user-name { font-weight: 500; color: #1e293b; white-space: nowrap; }

.role-badge {
  display: inline-block; padding: 3px 10px; border-radius: 6px;
  font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: capitalize;
}
.role-admin { background: #eef2ff; color: #4338ca; }
.role-staff { background: #f0fdf4; color: #15803d; }

.status-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 6px;
  font-size: 11.5px; font-weight: 500; text-transform: capitalize; white-space: nowrap;
}
.status-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.status-active   { background: #f0fdf4; color: #15803d; } .status-active   .status-dot { background: #22c55e; }
.status-inactive { background: #fef2f2; color: #dc2626; } .status-inactive .status-dot { background: #ef4444; }

.action-group { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.btn-action {
  background: transparent; border: 1px solid #e2e8f0;
  color: #475569; padding: 5px 11px; border-radius: 7px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-action:hover { background: #6366f1; border-color: #6366f1; color: #fff; }

.btn-rate {
  display: inline-flex; align-items: center; gap: 5px;
  background: #f0fdf4; border: 1px solid #bbf7d0;
  color: #15803d; padding: 5px 10px; border-radius: 7px;
  font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
  cursor: pointer; transition: all .15s; white-space: nowrap;
}
.btn-rate:hover { background: #22c55e; border-color: #22c55e; color: #fff; }

.empty-state { text-align: center; padding: 48px; color: #cbd5e1; font-size: 13px; }

.table-footer { padding: 12px 16px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f8fafc; }
.table-footer strong { color: #475569; }

/* ── Toast ── */
.toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 9998;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; font-weight: 500;
  box-shadow: 0 8px 32px rgba(0,0,0,.12); max-width: 380px;
  pointer-events: all;
}
.toast-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
.toast-error   { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; }
.toast-icon {
  width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.toast-success .toast-icon { background: #dcfce7; }
.toast-error   .toast-icon { background: #fee2e2; }
.toast-msg  { flex: 1; line-height: 1.4; }
.toast-close {
  background: none; border: none; cursor: pointer; padding: 2px;
  color: inherit; opacity: .5; display: flex; align-items: center; flex-shrink: 0;
}
.toast-close:hover { opacity: 1; }
.toast-slide-enter-active { transition: all .3s cubic-bezier(.34,1.56,.64,1); }
.toast-slide-leave-active { transition: all .2s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateY(16px) scale(.95); }
.toast-slide-leave-to   { opacity: 0; transform: translateY(8px); }

/* ── Tablet (≥ 600px) ─────────────────────────────────────── */
@media (min-width: 600px) {
  .page { padding: 24px 24px 44px; gap: 18px; }
  .topbar { flex-direction: row; align-items: flex-end; justify-content: space-between; }
  .topbar-title { font-size: 24px; }
  .summary-row { gap: 12px; }
  .summary-card { padding: 16px 18px; gap: 14px; }
  .summary-icon { width: 42px; height: 42px; border-radius: 11px; }
  .summary-val { font-size: 24px; }
  .summary-label { font-size: 12px; }
  .card-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 18px 20px 14px; }
  .search-box { flex: none; }
  .search-box input { width: 180px; }
  .table-footer { padding: 12px 20px; }
}

/* ── Desktop (≥ 900px) ────────────────────────────────────── */
@media (min-width: 900px) {
  .page { padding: 32px 36px 48px; gap: 20px; }
  .topbar-title { font-size: 26px; }
  .summary-row { grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .summary-card { padding: 18px 20px; }
  .summary-val { font-size: 26px; }
  .card-header { padding: 20px 22px 16px; }
  .search-box input { width: 200px; }
  .data-table th { padding: 10px 16px; }
  .data-table td { padding: 13px 16px; }
  .table-footer { padding: 12px 22px; }
}
</style>
