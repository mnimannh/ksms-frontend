<template>
  <div 
    class="product-card"
    :class="{ disabled: product.quantity <= 0 }"
    @click="handleClick"
  >
    <div class="image-container">
      <img :src="product.image_url" :alt="product.variant_name" />

      <span 
        class="status-badge"
        :class="{ 'out-of-stock': product.quantity <= 0 }"
      >
        {{ product.quantity > 0 ? 'Available' : 'Out of Stock' }}
      </span>
    </div>

    <div class="card-info">
      <h3>{{ product.variant_name }}</h3>

      <!-- ✅ CATEGORY -->
      <p class="category-name">{{ product.inventoryName }}</p>

      <!-- ✅ STOCK / UNIT -->
      <p class="stock">
        Stock: {{ product.quantity }}
      </p>

      <!-- PRICE -->
      <p class="price">{{ formatCurrency(product.price) }}</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['add-to-cart'])

const handleClick = () => {
  if (props.product.quantity > 0) {
    emit('add-to-cart', props.product)
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR'
  }).format(value || 0)
}
</script>

<style scoped>
.product-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s;
  background: white;
}

.product-card:hover {
  transform: scale(1.02);
}

.product-card.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-container {
  position: relative;
}

img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.status-badge {
  position: absolute;
  bottom: 5px;
  left: 5px;
  background: #28a745;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.out-of-stock {
  background: #dc3545;
}

h3 {
  font-size: 14px;
  margin: 8px 0 4px;
}

.category-name {
  font-size: 11px;
  color: #888;
  margin: 0;
}

.stock {
  font-size: 11px;
  color: #555;
}

.price {
  color: #2c3e50;
  font-weight: bold;
}
</style>