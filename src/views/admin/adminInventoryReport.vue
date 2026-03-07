<template>
  <div>
    <AdminSidebar />
    <!-- Add your report page content below -->
  </div>
</template>

<script>
import AdminSidebar from '@/components/sidebar/AdminSidebar.vue'

export default {
  name: 'AdminInventoryReport',
  components: { AdminSidebar }
}
</script>

<style scoped>
/* Optional: styles for admin report page wrapper */
</style>