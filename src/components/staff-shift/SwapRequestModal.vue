<template>
  <transition name="swap-fade">
    <div class="swap-backdrop" @click.self="$emit('close')">
      <div class="swap-modal">
        <div class="swap-header">
          <div class="swap-header-left">
            <div class="swap-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
            </div>
            <div>
              <h2 class="swap-title">Request Shift Swap</h2>
              <p class="swap-sub">{{ shiftLabel }}</p>
            </div>
          </div>
          <button class="swap-btn-close" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="swap-body">
          <div v-if="!submitted">
            <div class="swap-info-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;color:#6366f1"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>Your swap offer will be sent to your colleague. They must accept before it goes to admin for final approval.</span>
            </div>

            <!-- Target Context Label (Read Only) -->
            <div class="swap-field" style="margin-top:16px">
              <label class="swap-field-label">Target Teammate</label>
              <div class="swap-read-only-name">
                {{ shift.ownerName || 'Selected Colleague' }}
              </div>
            </div>

            <!-- Trade Shift Dropdown -->
            <div class="swap-field" style="margin-top:16px">
              <label class="swap-field-label">Which of your shifts will you offer? <span class="swap-req">*</span></label>
              <select v-model="form.proposingShiftId" class="swap-select">
                <option :value="null" disabled>Select one of your shifts…</option>
                <option v-for="s in availableMyShifts" :key="s.id" :value="s.id">
                  {{ s.shiftType }} Shift · {{ formatShiftOptionDate(s.startTime) }}
                </option>
              </select>
              <p v-if="availableMyShifts.length === 0" class="swap-warning-text">
                You have no shifts on other days available to swap.
              </p>
            </div>

            <div v-if="error" class="swap-error-box" style="margin-top:12px">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {{ error }}
            </div>
          </div>

          <div v-else class="swap-success">
            <div class="swap-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p class="swap-success-title">Swap request sent!</p>
            <p class="swap-success-sub">Your colleague will be notified. You'll be updated once they respond.</p>
          </div>
        </div>

        <div class="swap-footer">
          <button class="swap-btn-ghost" @click="$emit('close')">{{ submitted ? 'Close' : 'Cancel' }}</button>
          <button v-if="!submitted" class="swap-btn-submit" @click="submit" :disabled="!form.proposingShiftId || loading">
            <span v-if="loading" class="swap-spinner"></span>
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
    shift:     { type: Object, required: true }, // The colleague's shift being target-clicked
    myShifts:  { type: Array,  default: () => [] }, // Abu's own list of shifts passed down
  },

  data() {
    return {
      form: {
        proposingShiftId: null 
      },
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
    // Filter out shifts on the same day as the clicked target shift to avoid layout/system bugs
    availableMyShifts() {
      if (!this.shift) return []
      const targetDayStr = new Date(this.shift.startTime).toDateString()
      return this.myShifts.filter(s => {
        return new Date(s.startTime).toDateString() !== targetDayStr
      })
    }
  },

  methods: {
    formatShiftOptionDate(dt) {
      return new Date(dt).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })
    },
    async submit() {
      this.error   = ''
      this.loading = true
      try {
        const token = localStorage.getItem('userToken')
        const res = await fetch(`${API_BASE_URL}/api/swaps`, {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body:    JSON.stringify({ 
            targetShiftId: this.shift.id,             // Ali's shift ID
            proposingShiftId: this.form.proposingShiftId // Abu's shift ID offered in trade
          }),
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
.swap-backdrop {
  position: fixed; inset: 0; background: rgba(15,23,42,.45);
  display: flex; align-items: center; justify-content: center; z-index: 1100;
}
.swap-fade-enter-active, .swap-fade-leave-active { transition: opacity .2s ease; }
.swap-fade-enter-from, .swap-fade-leave-to { opacity: 0; }

.swap-modal {
  background: #fff; border-radius: 16px; width: 440px; max-width: 95vw;
  box-shadow: 0 24px 80px rgba(0,0,0,.2);
}

.swap-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding: 20px 22px 16px; border-bottom: 1px solid #f1f5f9;
}
.swap-header-left { display: flex; align-items: center; gap: 12px; }
.swap-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: #eef2ff; color: #6366f1;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.swap-title { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 2px; }
.swap-sub   { font-size: 12px; color: #94a3b8; }

.swap-btn-close {
  width: 28px; height: 28px; border-radius: 7px; border: none;
  background: #f1f5f9; color: #64748b; cursor: pointer;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.swap-btn-close:hover { background: #e2e8f0; }

.swap-body { padding: 20px 22px; }

.swap-info-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 9px;
  padding: 12px 14px; font-size: 13px; color: #3730a3; line-height: 1.5;
}

.swap-field { display: flex; flex-direction: column; gap: 6px; }
.swap-field-label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; }
.swap-req { color: #ef4444; }

.swap-read-only-name {
  padding: 10px 14px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 8px; font-size: 14px; font-weight: 600; color: #334155;
}

.swap-select {
  padding: 9px 12px; border: 1px solid #e2e8f0; border-radius: 8px;
  font-size: 14px; font-family: 'DM Sans', sans-serif; color: #1e293b;
  outline: none; transition: border-color .15s; background: #fff; width: 100%;
}
.swap-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

.swap-warning-text { font-size: 11px; color: #f59e0b; margin-top: 2px; }

.swap-error-box {
  display: flex; align-items: flex-start; gap: 10px;
  background: #fff7f7; border: 1px solid #fecaca; border-radius: 9px;
  padding: 12px 14px; font-size: 13px; color: #b91c1c; line-height: 1.45;
}

.swap-success { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 12px 0; text-align: center; }
.swap-success-icon { width: 56px; height: 56px; border-radius: 50%; background: #f0fdf4; border: 1.5px solid #bbf7d0; display: flex; align-items: center; justify-content: center; }
.swap-success-title { font-size: 16px; font-weight: 700; color: #0f172a; }
.swap-success-sub   { font-size: 13px; color: #64748b; line-height: 1.5; }

.swap-footer {
  padding: 14px 22px; border-top: 1px solid #f1f5f9;
  display: flex; justify-content: flex-end; gap: 8px;
}
.swap-btn-ghost {
  padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 500; color: #64748b; cursor: pointer;
}
.swap-btn-ghost:hover { background: #f8fafc; }
.swap-btn-submit {
  padding: 8px 20px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s;
  display: inline-flex; align-items: center; gap: 6px;
}
.swap-btn-submit:hover:not(:disabled) { background: #4f46e5; }
.swap-btn-submit:disabled { opacity: .5; cursor: not-allowed; }
.swap-spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%; animation: swap-spin .65s linear infinite;
}
@keyframes swap-spin { to { transform: rotate(360deg); } }
</style>