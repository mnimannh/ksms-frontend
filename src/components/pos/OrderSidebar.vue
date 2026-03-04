<template>
  <div class="order-sidebar">
    <!-- Header -->
    <div class="header">
      <h2>Order</h2>
      <button class="new-order-btn" @click="$emit('new-order')">
        New Order
      </button>
    </div>

    <!-- Table -->
    <table class="order-table">
      <thead>
        <tr>
          <th>Item Name</th>
          <th>Qty</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <!-- Empty -->
        <tr v-if="!cart || cart.length === 0">
          <td colspan="4" class="empty">No items yet</td>
        </tr>

        <!-- Items -->
        <tr v-for="item in cart" :key="item.id">
          <td>{{ item.variant_name }}</td>

          <td>
            <input
              type="number"
              class="qty-input"
              :value="item.orderQty"
              min="1"
              @input="onQtyChange(item.id, $event)"
            />
          </td>

          <td>{{ formatCurrency(item.price * item.orderQty) }}</td>

          <td>
            <button
              class="remove-btn"
              @click="$emit('remove', item.id)"
            >
              x
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- TOTALS: Qty + Price -->
    <div class="totals">
      <div class="row total">
        <span>Total Qty: {{ totalQty }}</span>
        <span>Total Price: {{ formatCurrency(total) }}</span>
      </div>
    </div>

    <!-- Pay -->
    <button
      class="pay-btn"
      :disabled="!cart || cart.length === 0"
      @click="$emit('checkout')"
    >
      Pay
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  cart: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['remove', 'checkout', 'update-qty', 'new-order'])

const onQtyChange = (id, event) => {
  let qty = Number(event.target.value)
  if (!qty || qty < 1) qty = 1
  emit('update-qty', { id, qty })
}

// Compute total price
const total = computed(() => {
  return props.cart.reduce(
    (sum, item) => sum + item.price * item.orderQty,
    0
  )
})

// Compute total quantity
const totalQty = computed(() => {
  return props.cart.reduce((sum, item) => sum + item.orderQty, 0)
})

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MYR'
  }).format(value || 0)
}
</script>

<style scoped>
.order-sidebar {
  background: white;
  padding: 15px;
  border-radius: 8px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.new-order-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th {
  text-align: left;
  color: #666;
  font-size: 12px;
}

td {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 13px;
}

.empty {
  text-align: center;
  color: #999;
  padding: 20px 0;
}

.qty-input {
  width: 50px;
  text-align: center;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 2px 6px;
}

.totals {
  margin-top: 20px;
  border-top: 2px solid #eee;
  padding-top: 10px;
}

.row.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 16px;
  color: #111;
  gap: 20px;
}

.pay-btn {
  width: 100%;
  background: #10b981;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  margin-top: auto;
  cursor: pointer;
}

.pay-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}
</style>