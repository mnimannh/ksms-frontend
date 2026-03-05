<template>
  <div class="category-card">
    <div class="category-header" @click="toggle">
      <div class="category-header-content">
        <div class="category-info">
          <h2>{{ category.name }}</h2>
          <p class="category-desc">{{ category.description }}</p>
        </div>
        <div class="category-stats">
          <div>Products: {{ category.totalProducts || 0 }}</div>
          <div>Variants: {{ category.totalVariants || 0 }}</div>
          <div>Stock: {{ category.totalStock || 0 }}</div>
        </div>
        <div class="category-actions">
          <button @click.stop="$emit('edit', category)">Edit</button>
          <button @click.stop="$emit('delete', category.id)">Delete</button>
          <button @click.stop="$emit('add-inventory', category.id)">+ Add Item</button>
        </div>
      </div>
    </div>

    <div v-if="expanded" class="inventory-container">
      <InventoryCard
        v-for="item in category.inventory"
        :key="item.id"
        :inventory="item"
        @edit="$emit('edit-inventory', $event)"
        @delete="$emit('delete-inventory', $event)"
        @add-variant="$emit('add-variant', $event)"
        @edit-variant="$emit('edit-variant', $event)"
        @delete-variant="$emit('delete-variant', $event)"
      />
    </div>
  </div>
</template>

<script>
import InventoryCard from './InventoryCard.vue';

export default {
  components: { InventoryCard },
  props: { category: Object },
  data() { return { expanded: false }; },
  methods: { toggle() { this.expanded = !this.expanded; } }
}
</script>

<style scoped>
.category-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden; /* Keeps everything contained */
  border: 1px solid #e2e8f0;
}

.category-header {
  padding: 1.25rem;
  cursor: pointer;
  background: #ffffff;
  transition: background 0.2s;
}

.category-header:hover {
  background: #f8fafc;
}

.category-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap; /* Allows actions to wrap on smaller screens */
}

.category-info {
  flex: 1;
  min-width: 200px; /* Prevents text from becoming too narrow */
}

.category-info h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.category-desc {
  color: #64748b;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.category-stats {
  display: flex;
  gap: 1.5rem;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 500;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
}

/* BUTTON STYLES */
.category-actions button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

/* Edit/Delete/Add specific styles */
.category-actions button:nth-child(1) { background: #f1f5f9; color: #475569; border: none; }
.category-actions button:nth-child(2) { background: #fee2e2; color: #dc2626; border: none; }
.category-actions button:nth-child(3) { background: #2563eb; color: white; border: none; }

.category-actions button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* THE INVENTORY AREA */
.inventory-container {
  padding: 1rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  display: grid;
  grid-template-columns: 1fr; /* Stacks inventory items vertically */
  gap: 1rem;
  overflow-x: auto; /* Safety for wide tables/items inside InventoryCard */
}
</style>