<template>
  <transition name="da-fade">
    <div v-if="visible" class="da-backdrop" @click.self="$emit('close')">
      <div class="da-modal" :class="mode === 'publish' ? 'da-modal--publish' : 'da-modal--discard'">

        <!-- Icon -->
        <div class="da-icon-wrap">
          <div class="da-icon">
            <!-- Publish: send/checkmark icon -->
            <svg v-if="mode === 'publish'" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            <!-- Discard: trash icon -->
            <svg v-else width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </div>
        </div>

        <!-- Content -->
        <div class="da-content">
          <h2 class="da-title">{{ mode === 'publish' ? 'Publish Schedule' : 'Discard Draft' }}</h2>

          <template v-if="mode === 'publish'">
            <p class="da-desc">
              You are about to publish the shift schedule for
              <strong>{{ monthLabel }}</strong>.
            </p>
            <div class="da-info-strip">
              <div class="da-info-item">
                <span class="da-info-val">{{ count }}</span>
                <span class="da-info-lbl">Shifts</span>
              </div>
              <div class="da-info-sep"></div>
              <div class="da-info-item">
                <span class="da-info-val">{{ monthLabel }}</span>
                <span class="da-info-lbl">Period</span>
              </div>
            </div>
            <div class="da-notice da-notice--green">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              All assigned staff will be able to see their shifts immediately after publishing.
            </div>
          </template>

          <template v-else>
            <p class="da-desc">
              You are about to permanently delete the draft schedule for
              <strong>{{ monthLabel }}</strong>.
            </p>
            <div class="da-info-strip">
              <div class="da-info-item">
                <span class="da-info-val">{{ count }}</span>
                <span class="da-info-lbl">Shifts</span>
              </div>
              <div class="da-info-sep"></div>
              <div class="da-info-item">
                <span class="da-info-val">{{ monthLabel }}</span>
                <span class="da-info-lbl">Period</span>
              </div>
            </div>
            <div class="da-notice da-notice--red">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="flex-shrink:0"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              This action cannot be undone. You will need to run Auto-Generate again to recreate the schedule.
            </div>
          </template>
        </div>

        <!-- Actions -->
        <div class="da-actions">
          <button class="da-btn-cancel" @click="$emit('close')" :disabled="loading">Cancel</button>
          <button
            class="da-btn-confirm"
            :class="mode === 'publish' ? 'da-btn-confirm--publish' : 'da-btn-confirm--discard'"
            @click="$emit('confirm')"
            :disabled="loading"
          >
            <span v-if="loading" class="da-spinner"></span>
            <template v-else>
              <svg v-if="mode === 'publish'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="22 2 15 22 11 13 2 9 22 2"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
              {{ mode === 'publish' ? 'Yes, Publish' : 'Yes, Discard' }}
            </template>
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'ShiftDraftActionModal',
  emits: ['close', 'confirm'],
  props: {
    visible:    { type: Boolean, required: true },
    mode:       { type: String,  default: 'publish' }, // 'publish' | 'discard'
    count:      { type: Number,  default: 0 },
    monthLabel: { type: String,  default: '' },
    loading:    { type: Boolean, default: false },
  },
}
</script>

<style scoped>
.da-backdrop {
  position: fixed; inset: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.da-fade-enter-active, .da-fade-leave-active { transition: opacity .2s ease; }
.da-fade-enter-from, .da-fade-leave-to { opacity: 0; }

.da-modal {
  background: #fff; border-radius: 20px;
  width: 420px; max-width: 95vw;
  padding: 32px 28px 24px;
  box-shadow: 0 32px 80px rgba(0,0,0,.22);
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  font-family: 'DM Sans', sans-serif;
  animation: da-pop .2s cubic-bezier(.34,1.56,.64,1) both;
}
@keyframes da-pop {
  from { transform: scale(.92); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}

/* Icon */
.da-icon-wrap { display: flex; align-items: center; justify-content: center; }
.da-icon {
  width: 64px; height: 64px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
}
.da-modal--publish .da-icon { background: #f0fdf4; color: #16a34a; }
.da-modal--discard .da-icon { background: #fef2f2; color: #dc2626; }

/* Content */
.da-content { display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; text-align: center; }
.da-title { font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; }
.da-desc  { font-size: 14px; color: #64748b; line-height: 1.6; }
.da-desc strong { color: #0f172a; }

/* Info strip */
.da-info-strip {
  display: flex; align-items: center; justify-content: center;
  background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;
  padding: 14px 24px; width: 100%; gap: 0;
}
.da-info-item { display: flex; flex-direction: column; gap: 3px; flex: 1; align-items: center; }
.da-info-val  { font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: -.03em; line-height: 1; }
.da-info-lbl  { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
.da-info-sep  { width: 1px; height: 36px; background: #e2e8f0; margin: 0 20px; flex-shrink: 0; }

/* Notice */
.da-notice {
  display: flex; align-items: flex-start; gap: 8px;
  border-radius: 10px; padding: 11px 14px;
  font-size: 12.5px; line-height: 1.55; text-align: left; width: 100%;
}
.da-notice--green { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.da-notice--red   { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }

/* Actions */
.da-actions { display: flex; gap: 10px; width: 100%; }
.da-btn-cancel {
  flex: 1; padding: 11px; border: 1px solid #e2e8f0; border-radius: 10px;
  background: #fff; font-family: 'DM Sans', sans-serif;
  font-size: 14px; font-weight: 500; color: #64748b; cursor: pointer;
  transition: background .15s;
}
.da-btn-cancel:hover:not(:disabled) { background: #f8fafc; }
.da-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }

.da-btn-confirm {
  flex: 1; padding: 11px; border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; color: #fff;
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  transition: all .15s;
}
.da-btn-confirm:disabled { opacity: .5; cursor: not-allowed; }
.da-btn-confirm--publish { background: #16a34a; }
.da-btn-confirm--publish:hover:not(:disabled) { background: #15803d; box-shadow: 0 4px 14px rgba(22,163,74,.35); }
.da-btn-confirm--discard { background: #dc2626; }
.da-btn-confirm--discard:hover:not(:disabled) { background: #b91c1c; box-shadow: 0 4px 14px rgba(220,38,38,.35); }

.da-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff; border-radius: 50%;
  animation: da-spin .65s linear infinite;
}
@keyframes da-spin { to { transform: rotate(360deg); } }
</style>
