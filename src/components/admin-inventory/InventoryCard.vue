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

<style scoped>
.inventory-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  margin-bottom: 0.75rem;
  overflow: hidden;
}

.inventory-header {
  padding: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.inventory-header:hover {
  background: #f8fafc;
}

.inventory-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap; /* CRITICAL: Allows items to wrap rather than push sidebar */
}

.inventory-info {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
  min-width: 180px; /* Ensures text remains readable */
}

.inventory-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.inventory-desc {
  font-size: 0.813rem;
  color: #64748b;
  margin-top: 2px;
}

.inventory-stats {
  display: flex;
  gap: 1.5rem;
  text-align: center;
}

.inventory-stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  color: #94a3b8;
  font-weight: 600;
  margin: 0;
}

.inventory-stat-value {
  font-size: 0.938rem;
  font-weight: 700;
  color: #334155;
  margin: 0;
}

.inventory-actions {
  display: flex;
  gap: 0.5rem;
}

/* BUTTONS */
.inventory-actions button {
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #e2e8f0;
  background: white;
  color: #475569;
}

.inventory-actions button:last-child {
  background: #f1f5f9;
  border-color: #cbd5e1;
  color: #1e293b;
}

.inventory-actions button:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}

/* VARIANTS SECTION */
.variants-container {
  padding: 0.75rem;
  background: #f1f5f9;
  border-top: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-x: auto; /* Safety for wide variant cards */
}
</style>