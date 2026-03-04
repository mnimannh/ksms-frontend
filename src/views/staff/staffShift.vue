<template>
  <div>
    <StaffSidebar />
    <!-- Add your shift viewing content below -->
  </div>
</template>

<script>
import StaffSidebar from "@/components/sidebar/staffSidebar.vue"

export default {
  name: 'StaffShift',
  components: { StaffSidebar }
}
</script>

<style scoped>
/* Optional: styles for staff shift page wrapper */
</style>