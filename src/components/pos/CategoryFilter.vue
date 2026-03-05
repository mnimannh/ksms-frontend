<template>
  <div class="filter-bar">
    <button
      v-for="cat in categories"
      :key="cat.id"
      :class="['filter-btn', { active: selectedId === cat.id }]"
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
.filter-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
  scrollbar-width: none;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  flex-shrink: 0;
  background: transparent;
  color: #6b6860;
  border: 1px solid #dedad2;
  padding: 7px 18px;
  border-radius: 100px;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.01em;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.filter-btn:hover {
  border-color: #c9a96e;
  color: #1a1a18;
  background: #faf8f3;
}

.filter-btn.active {
  background: #1a1a18;
  color: #f5f4f0;
  border-color: #1a1a18;
  font-weight: 500;
}
</style>