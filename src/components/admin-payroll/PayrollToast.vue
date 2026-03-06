<template>
  <transition name="toast-up">
    <div v-if="show" class="toast" :class="type">
      <!-- Success icon -->
      <svg v-if="type === 'success'" width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      <!-- Info icon -->
      <svg v-else width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span>{{ message }}</span>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PayrollToast',
  props: {
    show:    { type: Boolean, default: false },
    message: { type: String,  default: '' },
    type:    { type: String,  default: 'success' }, // 'success' | 'info'
  },
}
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 28px; right: 28px;
  display: flex; align-items: center; gap: 9px;
  padding: 11px 18px;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px; font-weight: 500;
  z-index: 9999;
  box-shadow: 0 8px 24px rgba(0,0,0,.12);
}
.toast.success { background: #0f172a; color: #fff; }
.toast.info    { background: #fff; color: #1e293b; border: 1px solid #e2e8f0; }

.toast-up-enter-active, .toast-up-leave-active { transition: all .25s ease; }
.toast-up-enter-from, .toast-up-leave-to { opacity: 0; transform: translateY(10px); }
</style>