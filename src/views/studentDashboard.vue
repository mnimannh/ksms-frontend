<template>
  <div class="student-dashboard">
    <StudentSidebar />
    <div class="main-content">
      <h1>Student Dashboard</h1>
      <p>Welcome! Your courses, assignments, and grades will appear here.</p>
    </div>
  </div>
</template>

<script>
import StudentSidebar from "@/components/studentSidebar.vue";

export default {
  name: "StudentDashboard",
  components: {
    StudentSidebar,
  },
  mounted() {
    const token = localStorage.getItem('userToken');
    if (!token) {
      window.location.href = "/";
      return;
    }

    // Check session with backend
    fetch("http://localhost:3000/auth/checkSession", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.user || data.user.role !== 'student') {
          // Invalid role or session, redirect
          localStorage.removeItem('userToken');
          window.location.href = "/";
        }
      })
      .catch(() => {
        window.location.href = "/";
      });
  },
};
</script>

<style scoped>
.student-dashboard {
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
