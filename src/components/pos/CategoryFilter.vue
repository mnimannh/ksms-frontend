<template>
  <div class="filter-bar">
    <button 
      v-for="cat in categories" 
      :key="cat.id"
      :class="{ active: selectedId === cat.id }"
      @click="$emit('filter', cat.id)"
    >
      {{ cat.name }}
    </button>
  </div>
</template>

<script setup>
defineProps(['categories', 'selectedId']);
defineEmits(['filter']);
</script>

<style scoped>
.filter-bar { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; }
button {
  background: #3b82f6; color: white; border: none; padding: 8px 16px;
  border-radius: 6px; cursor: pointer; white-space: nowrap;
}
button.active { background: #1d4ed8; font-weight: bold; }
</style>