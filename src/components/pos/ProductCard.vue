<template>
  <div
    class="product-card"
    :class="{
      disabled: product.quantity <= 0,
      'low-stock': product.quantity > 0 && product.quantity <= 5,
    }"
    @click="handleClick"
    role="button"
    :tabindex="product.quantity > 0 ? 0 : -1"
    @keydown.enter="handleClick"
  >
    <!-- Image -->
    <div class="image-wrap">
      <img
        :src="resolvedImage"
        :alt="product.variant_name"
        @error="onImgError"
      />

      <!-- Out of stock overlay -->
      <div class="out-overlay" v-if="product.quantity <= 0">
        <span>Out of Stock</span>
      </div>

      <!-- Low stock badge -->
      <span class="low-badge" v-else-if="product.quantity <= 5">
        Only {{ product.quantity }} left
      </span>

      <!-- Hover add overlay -->
      <div class="hover-overlay" v-if="product.quantity > 0">
        <div class="add-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add
        </div>
      </div>
    </div>

    <!-- Body -->
    <div class="card-body">
      <p class="category-tag">{{ product.inventoryName }}</p>
      <h3 class="product-name">{{ product.variant_name }}</h3>
      <div class="card-footer">
        <div class="stock-indicator" v-if="product.quantity > 0">
          <span class="stock-dot" :style="product.quantity > 5 ? 'background:#22c55e' : 'background:#f59e0b'" />
          <span class="stock-text">{{ product.quantity }} in stock</span>
        </div>
        <div class="stock-indicator" v-else>
          <span class="stock-dot" style="background:#ef4444" />
          <span class="stock-text" style="color:#ef4444">Out of stock</span>
        </div>
        <span class="price">{{ formatCurrency(product.price) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import API_BASE_URL from '@/services/api'

const props = defineProps({
  product: { type: Object, required: true },
})
const emit = defineEmits(['add-to-cart'])

const fallbackImg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f0ede6"/%3E%3Ctext x="50" y="54" font-size="28" text-anchor="middle" fill="%23c4bfb5"%3E⬜%3C/text%3E%3C/svg%3E'

// Prepend API base for local /uploads/ paths, pass through http URLs, fallback if null
const resolvedImage = computed(() => {
  const url = props.product.image_url
  if (!url) return fallbackImg
  if (url.startsWith('http')) return url
  return `${API_BASE_URL}${url}`
})

const onImgError = (e) => { e.target.src = fallbackImg }

const handleClick = () => {
  if (props.product.quantity > 0) emit('add-to-cart', props.product)
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(value || 0)
</script>

<style scoped>
.product-card {
  position: relative;
  background: #ffffff;
  border: 1.5px solid #edeae3;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow .22s ease, transform .22s ease, border-color .22s ease;
  outline: none;
}
.product-card:focus-visible { outline: 2px solid #c9a96e; outline-offset: 2px; }
.product-card:hover:not(.disabled) {
  transform: translateY(-3px);
  box-shadow: 0 10px 32px rgba(26,26,24,.1);
  border-color: #c9a96e;
}
.product-card.disabled { opacity: .5; cursor: not-allowed; }

/* ── Image ── */
.image-wrap {
  position: relative; overflow: hidden;
  background: #f5f3ee; height: 130px;
}
img {
  width: 100%; height: 100%; object-fit: cover;
  display: block; transition: transform .3s ease;
}
.product-card:hover:not(.disabled) img { transform: scale(1.05); }

.out-overlay {
  position: absolute; inset: 0;
  background: rgba(26,26,24,.55); backdrop-filter: blur(2px);
  display: flex; align-items: center; justify-content: center;
}
.out-overlay span {
  font-size: 11px; font-weight: 600; color: #f5f4f0;
  letter-spacing: .07em; text-transform: uppercase;
  background: rgba(180,60,60,.8); padding: 4px 10px; border-radius: 99px;
}
.low-badge {
  position: absolute; top: 8px; right: 8px;
  background: rgba(245,158,11,.92); color: #fff;
  font-size: 10px; font-weight: 600; letter-spacing: .04em;
  padding: 3px 8px; border-radius: 99px; backdrop-filter: blur(4px);
}
.hover-overlay {
  position: absolute; inset: 0;
  display: flex; align-items: flex-end; justify-content: center;
  padding-bottom: 14px; opacity: 0;
  transition: opacity .2s ease; pointer-events: none;
  background: linear-gradient(to top, rgba(201,169,110,.18) 0%, transparent 60%);
}
.product-card:hover .hover-overlay { opacity: 1; }
.add-btn {
  display: inline-flex; align-items: center; gap: 5px;
  background: #1a1a18; color: #f5f4f0;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px; font-weight: 500;
  padding: 7px 14px; border-radius: 99px;
  box-shadow: 0 4px 14px rgba(26,26,24,.3); letter-spacing: .02em;
}

/* ── Body ── */
.card-body { padding: 11px 13px 13px; display: flex; flex-direction: column; gap: 3px; }
.category-tag {
  font-size: 9.5px; font-weight: 600; color: #b5b2a9;
  letter-spacing: .08em; text-transform: uppercase;
}
.product-name {
  font-size: 13px; font-weight: 500; color: #1a1a18;
  line-height: 1.35; margin-top: 1px;
  display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 7px; }
.stock-indicator { display: flex; align-items: center; gap: 5px; }
.stock-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.stock-text { font-size: 11px; color: #a8a49c; }
.price { font-size: 14px; font-weight: 700; color: #1a1a18; letter-spacing: -.02em; }
</style>