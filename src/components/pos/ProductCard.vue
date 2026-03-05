<template>
  <div
    class="product-card"
    :class="{ disabled: product.quantity <= 0 }"
    @click="handleClick"
  >
    <div class="image-wrap">
      <img :src="product.image_url" :alt="product.variant_name" />
      <span
        class="badge"
        :class="{ 'badge--out': product.quantity <= 0 }"
      >
        {{ product.quantity > 0 ? 'In Stock' : 'Out of Stock' }}
      </span>
    </div>

    <div class="card-body">
      <p class="category">{{ product.inventoryName }}</p>
      <h3 class="name">{{ product.variant_name }}</h3>
      <div class="card-footer">
        <span class="stock">{{ product.quantity }} left</span>
        <span class="price">{{ formatCurrency(product.price) }}</span>
      </div>
    </div>

    <!-- Add indicator on hover -->
    <div class="add-overlay" v-if="product.quantity > 0">
      <span class="add-icon">+</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['add-to-cart']);

const handleClick = () => {
  if (props.product.quantity > 0) {
    emit('add-to-cart', props.product);
  }
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  }).format(value || 0);
</script>

<style scoped>
.product-card {
  position: relative;
  background: #ffffff;
  border: 1px solid #e8e6e0;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease;
}

.product-card:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 26, 24, 0.08);
  border-color: #d4cfc5;
}

.product-card.disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

/* Image */
.image-wrap {
  position: relative;
  overflow: hidden;
  background: #f0ede6;
}

img {
  width: 100%;
  height: 130px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.product-card:hover:not(.disabled) img {
  transform: scale(1.04);
}

/* Badge */
.badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: #1a1a18cc;
  backdrop-filter: blur(4px);
  color: #f5f4f0;
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 100px;
}

.badge--out {
  background: #b34a4acc;
}

/* Body */
.card-body {
  padding: 12px 14px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category {
  font-size: 10px;
  color: #9e9b93;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  font-weight: 500;
}

.name {
  font-size: 13px;
  font-weight: 500;
  color: #1a1a18;
  line-height: 1.35;
  margin-top: 2px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.stock {
  font-size: 11px;
  color: #b5b2a9;
}

.price {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a18;
  letter-spacing: -0.01em;
}

/* Add overlay */
.add-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201, 169, 110, 0.12);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.product-card:hover .add-overlay {
  opacity: 1;
}

.add-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #c9a96e;
  color: #fff;
  font-size: 22px;
  line-height: 36px;
  text-align: center;
  font-weight: 300;
  box-shadow: 0 4px 12px rgba(201, 169, 110, 0.4);
}
</style>