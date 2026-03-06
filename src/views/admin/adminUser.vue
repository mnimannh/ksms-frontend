<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <header class="page-header">
        <div class="header-title">
          <span class="header-eyebrow">Administration</span>
          <h1>Manage Users</h1>
        </div>
        <button class="btn-add" @click="openAddModal">
          <span class="btn-icon">+</span> New User
        </button>
      </header>

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="dropdown">
            <button class="btn-filter">
              <span class="filter-label">Role</span>
              <span class="filter-value">{{ selectedRole }}</span>
              <span class="arrow-icon">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </span>
            </button>
            <div class="dropdown-menu">
              <div @click="setRoleFilter('All')" class="dropdown-item" :class="{ active: selectedRole === 'All' }">All Roles</div>
              <div @click="setRoleFilter('admin')" class="dropdown-item" :class="{ active: selectedRole === 'admin' }">Admin</div>
              <div @click="setRoleFilter('staff')" class="dropdown-item" :class="{ active: selectedRole === 'staff' }">Staff</div>
            </div>
          </div>
        </div>

        <div class="toolbar-right">
          <div class="search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" stroke-width="1.5"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
            <input v-model="searchQuery" type="text" placeholder="Search users..." />
          </div>
        </div>
      </div>
<div class="grid-container">
  <div class="col-span-12">
      <div class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th>#</th>
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
              <td class="td-name">
                <div class="user-avatar">{{ user.fullName.charAt(0).toUpperCase() }}</div>
                <span>{{ user.fullName }}</span>
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
                <button class="btn-edit" @click="openEditModal(user)">Edit</button>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="empty-state">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
  </div>
</div>
<footer class="pagination">
  <span>Showing</span>
  <strong>{{ filteredUsers.length }}</strong>
  <span>of</span>
  <strong>{{ users.length }}</strong>
  <span>users</span>
</footer>
    </main>

    <UserModal
      :visible="showModal"
      :user="selectedUser"
      @close="showModal = false"
      @save="refreshUsers"
    />
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'
import UserModal from '@/components/admin-user/UserModal.vue'
import axios from 'axios'

export default {
  name: 'AdminUser',
  components: { AdminSidebar, UserModal },
  data() {
    return {
      users: [],
      searchQuery: '',
      showModal: false,
      selectedUser: null,
      selectedRole: 'All'
    }
  },
  computed: {
    filteredUsers() {
      let users = this.users
      if (this.selectedRole !== 'All') {
        users = users.filter(u => u.role.toLowerCase() === this.selectedRole.toLowerCase())
      }
      if (this.searchQuery) {
        users = users.filter(u =>
          u.fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      }
      return users
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await axios.get('http://localhost:3000/api/users')
        this.users = res.data
      } catch (err) {
        console.error('Error fetching users:', err)
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return '—'
      const d = new Date(dateStr)
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    },
    searchUsers() {},
    openAddModal() {
      this.selectedUser = null
      this.showModal = true
    },
    openEditModal(user) {
      this.selectedUser = user
      this.showModal = true
    },
    async deleteUser(id) {
      if (!confirm('Are you sure you want to delete this user?')) return
      try {
        await axios.delete(`http://localhost:3000/api/users/${id}`)
        this.users = this.users.filter(u => u.id !== id)
      } catch (err) {
        console.error('Error deleting user:', err)
      }
    },
    refreshUsers() {
      this.fetchUsers()
    },
    setRoleFilter(role) {
      this.selectedRole = role
    }
  },
  mounted() {
    this.fetchUsers()
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; }

.admin-container {
  display: flex;
  font-family: 'DM Sans', sans-serif;
  background-color: #f7f8fa;
  min-height: 100vh;
  color: #1a1d23;
}

.main-content {
  flex: 1;
  padding: 36px 40px;
  max-width: 100%;
}

/* ── Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 32px;
}

.header-eyebrow {
  display: block;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 4px;
}

.page-header h1 {
  font-size: 26px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: #111827;
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  transition: background 0.18s, transform 0.12s;
}

.btn-add:hover {
  background-color: #1f2937;
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
  line-height: 1;
}

/* ── Toolbar ── */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 7px 14px;
  transition: border-color 0.18s, box-shadow 0.18s;
}

.search-box:focus-within {
  border-color: #111827;
  box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
}

.search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.search-box input {
  border: none;
  outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1a1d23;
  width: 210px;
  background: transparent;
}

.search-box input::placeholder { color: #c4c9d4; }

/* ── Dropdown ── */
.dropdown {
  position: relative;
  display: inline-block;
}

.btn-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 7px 14px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #374151;
  transition: border-color 0.18s;
}

.btn-filter:hover { border-color: #d1d5db; }

.filter-label {
  color: #9ca3af;
  font-size: 12px;
}

.filter-value {
  font-weight: 500;
  color: #111827;
}

.arrow-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  background: #fff;
  min-width: 140px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04);
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  z-index: 10;
  overflow: hidden;
  padding: 4px;
}

.dropdown:hover .dropdown-menu { display: block; }

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  border-radius: 6px;
  transition: background 0.12s;
}

.dropdown-item:hover { background: #f9fafb; }
.dropdown-item.active { background: #f3f4f6; font-weight: 500; color: #111827; }

/* ── Table ── */
.table-container {
  width: 100%; 
  margin: 0;  
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  
}

.user-table thead tr {
  border-bottom: 1px solid #f0f0f0;
}

.user-table th {
  background: #fafafa;
  text-align: left;
  padding: 12px 16px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.user-table td {
  padding: 13px 16px;
  border-bottom: 1px solid #f9fafb;
  color: #374151;
  vertical-align: middle;
}

.table-row:last-child td { border-bottom: none; }

.table-row:hover td { background: #fafbfc; }

.td-num {
  color: #d1d5db;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  width: 40px;
}

.td-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #111827;
}

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #f3f4f6;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.td-email {
  color: #6b7280;
  font-size: 12.5px;
}

.td-muted {
  color: #9ca3af;
  font-size: 12.5px;
  font-family: 'DM Sans', sans-serif;
}

/* Role Badge */
.role-badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: capitalize;
}

.role-admin {
  background: #eff6ff;
  color: #3b82f6;
}

.role-staff {
  background: #f0fdf4;
  color: #16a34a;
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}

.status-active {
  background: #f0fdf4;
  color: #15803d;
}

.status-active .status-dot { background: #22c55e; }

.status-inactive {
  background: #fff7f7;
  color: #b91c1c;
}

.status-inactive .status-dot { background: #ef4444; }

/* Edit Button */
.btn-edit {
  background: transparent;
  border: 1px solid #e5e7eb;
  color: #374151;
  padding: 5px 13px;
  border-radius: 6px;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-edit:hover {
  background: #111827;
  border-color: #111827;
  color: #fff;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 40px;
  color: #c4c9d4;
  font-size: 13px;
}

/* ── Pagination ── */
.pagination {
  margin-top: 14px;
  text-align: right;
  font-size: 12px;
  color: #9ca3af;
    display: flex;
  gap: 4px;
}

.pagination strong { color: #374151; }
</style>