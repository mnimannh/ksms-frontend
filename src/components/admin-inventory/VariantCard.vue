<template>
  <div class="variant-card">
    <div class="variant-content">
      <div class="variant-image">
        <img :src="variant.imageUrl" :alt="variant.name" />
      </div>
      <div class="variant-info">
        <div class="variant-header">
          <h4>{{ variant.name }}</h4>
          <span :class="['status-badge', stockStatus.class]">{{ stockStatus.label }}</span>
        </div>
        <div class="variant-details">
          <div class="variant-detail">Qty: <strong>{{ variant.quantity }}</strong></div>
          <div class="variant-detail">Price: <strong>RM{{ variant.price.toFixed(2) }}</strong></div>
          <div class="variant-detail">Barcode: <strong>{{ variant.barcode }}</strong></div>
        </div>
        <div class="variant-actions">
          <button @click.stop="$emit('edit', variant)">Edit</button>
          <button @click.stop="$emit('delete', variant.id)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: { variant: Object, threshold: Number },
  computed: {
    stockStatus() {
      const qty = this.variant.quantity;
      if (qty === 0) return { class: 'status-out', label: 'Out of Stock' };
      if (qty <= this.threshold) return { class: 'status-low', label: 'Low Stock' };
      return { class: 'status-in', label: 'In Stock' };
    }
  }
}
</script>
