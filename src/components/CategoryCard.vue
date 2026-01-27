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
