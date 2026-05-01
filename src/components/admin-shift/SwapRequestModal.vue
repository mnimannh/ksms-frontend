<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-header-left">
            <div class="modal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
            </div>
            <div>
              <h2 class="modal-title">Request Shift Swap</h2>
              <p class="modal-sub">{{ shiftLabel }}</p>
            </div>
          </div>
          <button class="btn-close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">

          <div v-if="!submitted">
            <div class="info-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;color:#6366f1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Your swap request will be sent to your colleague. They must accept before it goes to admin for final approval.</span>
            </div>

            <div class="field" style="margin-top:16px">
              <label class="field-label">Swap with <span class="req">*</span></label>
              <select v-model.number="form.targetId" class="field-select">
                <option :value="null" disabled>Select a colleague…</option>
                <option v-for="s in staffList" :key="s.id" :value="s.id">{{ s.fullName }}</option>
              </select>
            </div>

            <div v-if="error" class="error-box" style="margin-top:12px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ error }}
            </div>
          </div>

          <div v-else class="success-state">
            <div class="success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p class="success-title">Swap request sent!</p>
            <p class="success-sub">Your colleague will be notified. You'll be updated once they respond.</p>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn-ghost" @click="$emit('close')">{{ submitted ? 'Close' : 'Cancel' }}</button>
          <button v-if="!submitted" class="btn-submit" @click="submit" :disabled="!form.targetId || loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Send Request</span>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import API_BASE_URL from '@/services/api.js'

export default {
  name: 'SwapRequestModal',
  emits: ['close', 'submitted'],
  props: {
    shift:     { type: Object,  required: true },
    staffList: { type: Array,   default: () => [] },
  },

  data() {
    return {
      form:      { targetId: null },
      loading:   false,
      error:     '',
      submitted: false,
    }
  },

  computed: {
    shiftLabel() {
      if (!this.shift) return ''
      const d = new Date(this.shift.startTime)
      return `${this.shift.shiftType} · ${d.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}`
    },
  },

  methods: {
    async submit() {
      this.error   = ''
      this.loading = true
      try {
        const token = localStorage.getItem('userToken')
        const res = await fetch(`${API_BASE_URL}/api/swaps`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ targetId: this.form.targetId, shiftId: this.shift.id }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to send request')
        this.submitted = true
        this.$emit('submitted')
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15,23,42,.45);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal {
  background: #fff; border-radius: 16px; width: 440px; max-width: 95vw;
  box-shadow: 0 24px 80px rgba(0,0,0,.2);
}
.modal-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 22px 16px; border-bottom: 1px solid #f1f5f9;
}
.modal-header-left { display: flex; align-items: center; gap: 12px; }
.modal-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #eef2ff; color: #6366f1;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.modal-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.modal-sub   { font-size: 12px; color: #94a3b8; }
.btn-close {
  width: 28px; height: 28px; border-radius: 7px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.btn-close:hover { background: #e2e8f0; }

.modal-body { padding: 20px 22px; }

.info-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 9px;
  padding: 12px 14px; font-size: 13px; color: #3730a3; line-height: 1.5;
}
.field { display: flex; flex-direction: column; gap: 6px; }
.field-label { font-size: 12px; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: .05em; }
.req { color: #ef4444; }
.field-select {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1e293b;
  outline: none; transition: border-color .15s; background: #fff; width: 100%;
}
.field-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

.error-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff7f7; border: 1px solid #fecaca; border-radius: 9px;
  padding: 12px 14px; font-size: 13px; color: #b91c1c; line-height: 1.45;
}

.success-state { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 12px 0; text-align: center; }
.success-icon { width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4; border: 1.5px solid #bbf7d0; display: flex; align-items: center; justify-content: center; }
.success-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.success-sub   { font-size: 13px; color: #64748b; line-height: 1.5; }

.modal-footer {
  padding: 14px 22px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
}
.btn-ghost {
  padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;
}
.btn-ghost:hover { background: #f8fafc; }
.btn-submit {
  padding: 8px 20px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.btn-submit:hover:not(:disabled) { background: #4f46e5; }
.btn-submit:disabled { opacity: .5; cursor: not-allowed; }
.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: spin .65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
