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

<style scoped>
.variant-card {
  background: white;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 4px;
}

.variant-content {
  display: flex;
  gap: 16px;
  align-items: center;
}

/* 1. FIX IMAGE BLOWOUT */
.variant-image {
  width: 60px;
  height: 60px;
  flex-shrink: 0; /* Prevents image from being squashed */
  border-radius: 6px;
  overflow: hidden;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.variant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures image fits without distorting */
}

/* 2. FLEXIBLE INFO AREA */
.variant-info {
  flex: 1;
  min-width: 0; /* CRITICAL: Allows child text to truncate instead of push */
}

.variant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
}

.variant-header h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Truncates name if it's too long */
}

/* 3. RESPONSIVE DETAILS */
.variant-details {
  display: flex;
  gap: 16px;
  font-size: 0.813rem;
  color: #64748b;
  margin-bottom: 8px;
  flex-wrap: wrap; /* Allows details to wrap on narrow screens */
}

.variant-detail strong {
  color: #334155;
}

/* 4. STATUS BADGES */
.status-badge {
  padding: 2px 8px;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.status-in { background: #dcfce7; color: #166534; }
.status-low { background: #ffedd5; color: #9a3412; }
.status-out { background: #fee2e2; color: #991b1b; }

/* 5. ACTIONS */
.variant-actions {
  display: flex;
  gap: 12px;
}

.variant-actions button {
  background: transparent;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2563eb;
  cursor: pointer;
}

.variant-actions button:hover {
  text-decoration: underline;
}

.variant-actions button:last-child {
  color: #dc2626;
}
</style>