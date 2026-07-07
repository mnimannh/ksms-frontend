<template>
  <div class="sidebar">
    <!-- Header -->
    <div class="sidebar-header">
      <div>
        <h2 class="sidebar-title">Current Order</h2>
        <p class="sidebar-count" v-if="cart && cart.length > 0">
          {{ cart.length }} item{{ cart.length !== 1 ? 's' : '' }}
        </p>
      </div>
      <button class="btn-new" @click="$emit('new-order')">New Order</button>
    </div>

    <!-- Divider -->
    <div class="divider" />

    <!-- Items -->
    <div class="item-list">
      <!-- Empty -->
      <div v-if="!cart || cart.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
        </div>
        <p>No items added yet</p>
        <span>Tap a product to add it here</span>
      </div>

      <!-- Cart Rows -->
      <div v-for="item in cart" :key="item.id" class="cart-row">
        <div class="cart-row-info">
          <p class="item-inventory">{{ item.inventoryName }}</p>
          <p class="item-name">{{ item.variant_name }}</p>
          <p class="item-unit">{{ formatCurrency(item.price) }} / unit</p>
        </div>

        <div class="cart-row-controls">
          <input
            type="number"
            class="qty-input"
            :value="item.orderQty"
            min="1"
            @input="onQtyChange(item.id, $event)"
          />
          <span class="item-total">{{ formatCurrency(item.price * item.orderQty) }}</span>
          <button class="btn-remove" @click="$emit('remove', item.id)" title="Remove item">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="sidebar-footer" v-if="cart && cart.length > 0">
      <div class="divider" />
      <div class="summary">
        <div class="summary-row">
          <span class="summary-label">Total Items</span>
          <span class="summary-value">{{ totalQty }}</span>
        </div>
        <div class="summary-row summary-total">
          <span class="summary-label">Total</span>
          <span class="summary-value total-price">{{ formatCurrency(total) }}</span>
        </div>
      </div>
    </div>

    <!-- Pay Button -->
    <div class="pay-wrap">
      <button
        class="btn-pay"
        :disabled="!cart || cart.length === 0"
        @click="$emit('checkout')"
      >
        <span>Pay Now</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  cart: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['remove', 'checkout', 'update-qty', 'new-order']);

const onQtyChange = (id, event) => {
  let qty = Number(event.target.value);
  if (!qty || qty < 1) qty = 1;
  emit('update-qty', { id, qty });
};

const total = computed(() =>
  props.cart.reduce((sum, item) => sum + item.price * item.orderQty, 0)
);

const totalQty = computed(() =>
  props.cart.reduce((sum, item) => sum + item.orderQty, 0)
);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'MYR' }).format(value || 0);
</script>

<style scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #ffffff;
}

/* ── Header ── */
.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 20px;
}

.sidebar-title {
  font-family: 'DM Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  line-height: 1;
}

.sidebar-count {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.btn-new {
  background: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  padding: 6px 14px;
  border-radius: 100px;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.btn-new:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: #eef2ff;
}

/* ── Divider ── */
.divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 24px;
}

/* ── Item list ── */
.item-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-list::-webkit-scrollbar {
  width: 3px;
}
.item-list::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

/* Empty */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 0;
  color: #94a3b8;
  text-align: center;
}

.empty-icon {
  color: #cbd5e1;
  line-height: 1;
  margin-bottom: 4px;
}

.empty-state p {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.empty-state span {
  font-size: 12px;
  color: #94a3b8;
}

/* Cart rows */
.cart-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
  gap: 12px;
}

.cart-row:last-child {
  border-bottom: none;
}

.cart-row-info {
  flex: 1;
  min-width: 0;
}

.item-inventory {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: .05em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-name {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-unit {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 2px;
}

.cart-row-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.qty-input {
  width: 44px;
  height: 32px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #1e293b;
  background: #f8fafc;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  -moz-appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.qty-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.1);
}

.item-total {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  min-width: 68px;
  text-align: right;
}

.btn-remove {
  background: transparent;
  border: none;
  color: #cbd5e1;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color 0.15s;
}

.btn-remove:hover {
  color: #ef4444;
}

/* ── Footer Summary ── */
.sidebar-footer {
  padding: 0 0 4px;
}

.summary {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 12px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.summary-total .summary-label {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
  text-transform: none;
  letter-spacing: 0;
}

.total-price {
  font-size: 18px;
  font-weight: 700;
  color: #6366f1;
}

/* ── Pay button ── */
.pay-wrap {
  padding: 16px 24px 24px;
}

.btn-pay {
  width: 100%;
  background: #22c55e;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 14px 20px;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
  letter-spacing: 0.01em;
}

.btn-pay:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(34,197,94,.35);
}

.btn-pay:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
</style>
