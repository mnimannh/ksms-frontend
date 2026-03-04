<template>
  <div class="layout">
    <AdminSidebar />
  </div>
  <div class="page">
    <!-- Page content goes here -->
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue';

export default {
  name: 'ShiftAssignment',
  components: { AdminSidebar },
};
</script>

<style scoped>
.page {
  padding: 20px;
}
</style>