<template>
  <div class="admin-container">
    <AdminSidebar />

    <main class="main-content">
      <header class="page-header">
        <h1>Manage Users</h1>
        <div class="header-nav">
          <button class="btn-add" @click="openAddModal">+ Add User</button>
        </div>
      </header>

      <div class="toolbar">
        <!-- LEFT: Role Actions Dropdown -->
        <div class="toolbar-left">
          <div class="dropdown">
            <button class="btn-secondary">
             {{ selectedRole }} <span class="arrow">▼</span>
            </button>
            <div class="dropdown-menu">
              <div @click="setRoleFilter('All')" class="dropdown-item">All</div>
              <div @click="setRoleFilter('admin')" class="dropdown-item">Admin</div>
              <div @click="setRoleFilter('staff')" class="dropdown-item">Staff</div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Search -->
        <div class="toolbar-right">
          <div class="search-box">
            <input v-model="searchQuery" type="text" placeholder="Search..." />
            <button class="btn-search" @click="searchUsers">🔍</button>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last login</th>
              <th>Date joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(user, index) in filteredUsers" :key="user.id">
              <td>{{ index + 1 }}</td>
              <td class="user-name">{{ user.fullName }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ formatDate(user.last_login) }}</td>
              <td>{{ formatDate(user.created_at) }}</td>
<td class="status-cell">
  <span 
    :class="user.status === 'active' ? 'status-active' : 'status-inactive'">
    {{ user.status }}
  </span>
</td>
              <td>
                <button @click="openEditModal(user)">Edit</button>
                <button @click="deleteUser(user.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination">
        Page: 1 ({{ filteredUsers.length }} of {{ users.length }})
      </footer>
    </main>

    <!-- Add/Edit Modal -->
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
      selectedRole: 'All' // default role filter
    }
  },
  computed: {
    filteredUsers() {
      let users = this.users

      // Filter by role if not "All"
      if (this.selectedRole !== 'All') {
        users = users.filter(u => u.role.toLowerCase() === this.selectedRole.toLowerCase())
      }

      // Filter by search query
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
      if (!dateStr) return 'N/A'
      const d = new Date(dateStr)
      return d.toLocaleDateString()
    },
    searchUsers() {
      // filteredUsers updates automatically
    },
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
.admin-container {
  display: flex;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f4f7f6;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding: 20px;
  color: #555;
}

/* Header & Tabs */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h1 {
  font-size: 24px;
  color: #777;
  font-weight: 300;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.btn-add {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
}

.search-box {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 3px;
  background: white;
}

.search-box input {
  border: none;
  padding: 6px;
  outline: none;
  width: 200px;
}

.btn-search {
  background: #7f8c8d;
  border: none;
  color: white;
  padding: 0 10px;
  cursor: pointer;
}

/* Dropdown Styles */
.dropdown {
  position: relative;
  display: inline-block;
}

.btn-secondary {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  background-color: white;
  min-width: 100px;
  box-shadow: 0px 2px 5px rgba(0,0,0,0.2);
  z-index: 1;
  margin-top: 2px;
  border-radius: 4px;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}

/* Table Styles */
.table-container {
  background: white;
  border: 1px solid #eee;
  border-radius: 4px;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.user-table th {
  background-color: #dcdcdc;
  text-align: left;
  padding: 12px;
  color: #333;
}

.user-table td {
  padding: 12px;
  border-bottom: 1px solid #eee;
}

.user-name {
  color: #2980b9;
  text-decoration: underline;
  cursor: pointer;
}

.status-check { color: #333; font-weight: bold; }
.status-x { color: #000; font-weight: bold; }

/* Pagination */
.pagination {
  margin-top: 15px;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}

.status-active {
  color: #27ae60; /* green */
  font-weight: bold;
}

.status-inactive {
  color: #e74c3c; /* red */
  font-weight: bold;
}
</style>