<template>
  <div class="modal-overlay" @mousedown.self="$emit('cancel')">
    <div class="modal-box" style="max-width: 400px;">
      <div class="modal-header">
        <span class="modal-title">Confirm Delete</span>
        <button class="modal-close" @click="$emit('cancel')">✕</button>
      </div>
      <div class="modal-body">
        <div class="confirm-body">
          <div class="confirm-icon">⚠</div>
          <p class="confirm-msg">{{ message }}</p>
          <p class="confirm-sub">This action cannot be undone.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-ghost" @click="$emit('cancel')">Cancel</button>
        <button class="btn-danger" @click="$emit('confirm')">Delete</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: { message: String },
  emits: ['confirm', 'cancel'],
}
</script>

<style scoped>
.confirm-body {
  display: flex; flex-direction: column; align-items: center;
  text-align: center; gap: 8px;
  padding: 8px 0;
}
.confirm-icon {
  font-size: 32px;
  width: 56px; height: 56px;
  background: var(--red-bg);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.confirm-msg { font-size: 14px; font-weight: 500; color: var(--text-primary); }
.confirm-sub { font-size: 13px; color: var(--text-muted); }
.btn-danger {
  padding: 9px 18px;
  background: var(--red); color: #fff;
  border: none; border-radius: var(--radius-sm);
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-danger:hover { background: #B91C1C; }
</style>