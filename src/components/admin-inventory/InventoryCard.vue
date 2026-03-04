<template>
  <div class="inventory-card">
    <div class="inventory-header" @click="toggle">
      <div class="inventory-header-content">
        <div class="inventory-info">
          <svg v-if="expanded" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          <div>
            <h3>{{ inventory.name }}</h3>
            <p class="inventory-desc">{{ inventory.description }}</p>
          </div>
        </div>

        <div class="inventory-stats">
          <div>
            <p class="inventory-stat-label">Threshold</p>
            <p class="inventory-stat-value">{{ inventory.defaultThreshold }}</p>
          </div>
          <div>
            <p class="inventory-stat-label">Variants</p>
            <p class="inventory-stat-value">{{ inventory.variantCount || 0 }}</p>
          </div>
          <div>
            <p class="inventory-stat-label">Stock</p>
            <p class="inventory-stat-value">{{ inventory.totalStock || 0 }}</p>
          </div>
        </div>

        <div class="inventory-actions">
          <button @click.stop="$emit('edit', inventory)">Edit</button>
          <button @click.stop="$emit('delete', inventory.id)">Delete</button>
          <button @click.stop="$emit('add-variant', inventory.id)">+ Add Variant</button>
        </div>
      </div>
    </div>

    <div v-if="expanded" class="variants-container">
      <VariantCard
        v-for="variant in inventory.variants"
        :key="variant.id"
        :variant="variant"
        :threshold="inventory.defaultThreshold"
        @edit="$emit('edit-variant', $event)"
        @delete="$emit('delete-variant', $event)"
      />
    </div>
  </div>
</template>

<script>
import VariantCard from './VariantCard.vue';

export default {
  components: { VariantCard },
  props: { inventory: Object },
  data() {
    return { expanded: false };
  },
  methods: {
    toggle() { this.expanded = !this.expanded; }
  }
};
</script>
