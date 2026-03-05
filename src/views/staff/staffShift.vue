<template>
  <div class="staff-shift-page">
    <!-- Sidebar -->
    <StaffSidebar />

    <!-- Shift Viewing Content -->
    <div class="shift-content">
      <!-- Add your shift viewing content here -->
    </div>
  </div>
</template>

<script>
import StaffSidebar from "@/components/sidebar/staffSidebar.vue";

export default {
  name: "StaffShift",
  components: {
    StaffSidebar
  }
};
</script>

<style scoped>
.staff-shift-page {
  display: flex;
  min-height: 100vh;
}

.shift-content {
  flex: 1;
  padding: 20px;
}
</style>