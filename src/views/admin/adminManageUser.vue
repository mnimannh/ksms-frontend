<template>
  <div class="admin-container">
    <AdminSidebar />
    
    <main class="main-content">
      <header class="page-header">
        <h1>Manage Users</h1>
        <div class="header-nav">

          <button class="btn-add">+ Add User</button>
        </div>
      </header>



      <div class="toolbar">
        <div class="toolbar-left">
          <div class="dropdown">
            <button class="btn-secondary">Actions <span class="arrow">▼</span></button>
          </div>

        </div>

        <div class="toolbar-right">
          <div class="search-box">
            <input type="text" placeholder="Search..." />
            <button class="btn-search">🔍</button>
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
            <tr v-for="(user, index) in users" :key="index">
              <td></td>
              <td class="user-name">{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.lastLogin }}</td>
              <td>{{ user.dateJoined }}</td>
              <td class="status-cell">
                <span v-if="user.status === 'active'" class="status-check">✓</span>
                <span v-else class="status-x">✕</span>
              </td>
              <td>
                Action
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination">
        Page: 1 (1 - 12 of 12)
      </footer>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'

export default {
  name: 'AdminUser',
  components: { AdminSidebar },
  data() {
    return {
      users: [
        { name: 'Applicant Name', email: 'applicant@email.com', role: 'Applicant', lastLogin: 'Yesterday', dateJoined: 'May 10 2017', status: 'active' },
        { name: 'Applicant Name 3', email: 'applicant3@email.com', role: 'Applicant', lastLogin: 'Jun 07 2017', dateJoined: 'May 10 2017', status: 'active' },
        { name: 'Applicant Name 2', email: 'applicant2@email.com', role: 'Applicant', lastLogin: 'Jun 01 2017', dateJoined: 'May 10 2017', status: 'active' },
        { name: 'Reviewer Name', email: 'reviewer@email.com', role: 'Reviewer, Applicant', lastLogin: 'Yesterday', dateJoined: 'May 10 2017', status: 'active' },
        { name: "User's Name", email: 'smpaters+user@gmail.com', role: 'Applicant', lastLogin: 'Today', dateJoined: 'May 15 2017', status: 'active' },
        { name: 'Eligibility Test', email: 'smpaters+et@gmail.com', role: 'Applicant', lastLogin: 'Jun 22 2017', dateJoined: 'Jun 22 2017', status: 'active' },
        { name: 'New User', email: 'smpaters+nu@gmail.com', role: 'Applicant', lastLogin: 'Unverified', dateJoined: 'Jun 22 2017', status: 'inactive' },
        { name: 'Reviewer Name 2', email: 'reviewer2@email.com', role: 'Reviewer', lastLogin: 'Yesterday', dateJoined: 'May 10 2017', status: 'active' },
        { name: 'Sarah Paterson', email: 'smpaterson+rec@gmail.com', role: 'Recommender', lastLogin: 'Jul 06 2017', dateJoined: 'Jun 06 2017', status: 'active' },
        { name: 'Recommender Name', email: 'recommender@email.com', role: 'Recommender', lastLogin: 'Today', dateJoined: 'Jun 13 2017', status: 'active' },
        { name: 'Sarah Paterson', email: 'smpaters+rec@gmail.com', role: 'Recommender', lastLogin: 'Jul 06 2017', dateJoined: 'Jul 06 2017', status: 'active' },
        { name: 'Sarah Paterson', email: 'sarahmpaterson@live.com', role: 'Recommender', lastLogin: 'Today', dateJoined: 'Yesterday', status: 'active' }
      ]
    }
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

.tabs {
  display: flex;
  gap: 15px;
}

.tabs a {
  text-decoration: none;
  font-size: 12px;
  color: #888;
  font-weight: bold;
  padding-bottom: 5px;
}

.tabs a.active {
  color: #2c3e50;
  border-bottom: 3px solid #34495e;
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

/* Filter Bar */
.filter-bar {
  background-color: #7f8c8d;
  padding: 8px 15px;
  border-radius: 4px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.btn-filter {
  background-color: #6a7677;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 3px;
  font-size: 13px;
  cursor: pointer;
}

/* Toolbar */
.toolbar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
}

.toolbar-left, .toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.selection-count {
  font-size: 12px;
  color: #999;
  margin-right: 10px;
}

.btn-secondary, .btn-icon, .btn-grid {
  background-color: #95a5a6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 3px;
  cursor: pointer;
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

.col-check { width: 40px; }

.status-check { color: #333; font-weight: bold; }
.status-x { color: #000; font-weight: bold; }

/* Pagination */
.pagination {
  margin-top: 15px;
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
}
</style>