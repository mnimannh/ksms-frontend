<template>
  <transition name="modal-fade">
    <div v-if="show" class="overlay" @click.self="$emit('close')">
      <div class="modal-box">

        <!-- Header -->
        <div class="modal-header">
          <div>
            <p class="modal-eyebrow">Payroll Record</p>
            <h2 class="modal-title">{{ record?.monthLabel }}</h2>
          </div>
          <button class="close-btn" @click="$emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="record">

          <!-- Status banner -->
          <div class="status-banner" :class="statusClass">
            <div class="banner-icon">
              <!-- Received -->
              <svg v-if="record.isReceived" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <!-- Generated -->
              <svg v-else-if="record.isCreated" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <!-- Pending -->
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div>
              <p class="banner-title">{{ statusLabel }}</p>
              <p class="banner-sub">{{ statusSub }}</p>
            </div>
          </div>

          <!-- Hours highlight -->
          <div class="hours-highlight">
            <div class="hl-left">
              <span class="hl-val">{{ record.hoursWorked }}<span class="hl-unit">h</span></span>
              <span class="hl-label">Total Hours Worked</span>
            </div>
            <div class="hl-bar-wrap">
              <div class="hl-track">
                <div class="hl-fill" :style="`width:${Math.min((record.hoursWorked/200)*100,100)}%`" />
              </div>
              <div class="hl-legend">
                <span>0h</span><span>200h</span>
              </div>
            </div>
          </div>

          <!-- Detail rows -->
          <div class="detail-grid">
            <div class="detail-row">
              <span class="d-label">Record ID</span>
              <span class="d-val mono">#{{ record.id }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">Pay Period</span>
              <span class="d-val">{{ record.monthLabel }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">Hours Worked</span>
              <span class="d-val mono">{{ record.hoursWorked }}h</span>
            </div>
            <div class="detail-row">
              <span class="d-label">Generated On</span>
              <span class="d-val">{{ record.created_at ? formatDate(record.created_at) : '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="d-label">Payroll Status</span>
              <span class="status-badge" :class="statusClass">
                <span class="s-dot" />{{ statusLabel }}
              </span>
            </div>
            <div class="detail-row" v-if="record.notes">
              <span class="d-label">Notes</span>
              <span class="d-val notes">{{ record.notes }}</span>
            </div>
          </div>

          <!-- Progress tracker -->
          <div class="progress-section">
            <p class="progress-label">Payment Progress</p>
            <div class="progress-track">
              <div class="prog-step active">
                <div class="prog-dot filled" />
                <span>Logged</span>
              </div>
              <div class="prog-line" :class="{ filled: record.isCreated }" />
              <div class="prog-step" :class="{ active: record.isCreated }">
                <div class="prog-dot" :class="{ filled: record.isCreated }" />
                <span>Generated</span>
              </div>
              <div class="prog-line" :class="{ filled: record.isReceived }" />
              <div class="prog-step" :class="{ active: record.isReceived }">
                <div class="prog-dot" :class="{ filled: record.isReceived }" />
                <span>Received</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn-close" @click="$emit('close')">Close</button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script>
export default {
  name: 'PayrollDetailModal',
  emits: ['close'],
  props: {
    show:   { type: Boolean, required: true },
    record: { type: Object,  default: null },
  },
  computed: {
    statusClass() {
      if (!this.record) return 'pending'
      if (this.record.isReceived) return 'received'
      if (this.record.isCreated)  return 'generated'
      return 'pending'
    },
    statusLabel() {
      if (!this.record) return 'Pending'
      if (this.record.isReceived) return 'Received'
      if (this.record.isCreated)  return 'Generated'
      return 'Pending'
    },
    statusSub() {
      if (!this.record) return ''
      if (this.record.isReceived) return 'Your payroll has been received.'
      if (this.record.isCreated)  return 'Payroll generated. Awaiting disbursement.'
      return 'Hours logged. Awaiting admin to generate payroll.'
    },
  },
  methods: {
    formatDate(dt) {
      return new Date(dt).toLocaleDateString('en-MY', { day:'numeric', month:'long', year:'numeric' })
    },
  },
}
</script>

<style scoped>
.overlay {
  position:fixed; inset:0;
  background:rgba(15,23,42,.45);
  backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center;
  z-index:1000; padding:20px;
}
.modal-box {
  background:#fff; border-radius:16px;
  width:100%; max-width:480px;
  max-height:90vh; overflow-y:auto;
  box-shadow:0 20px 60px rgba(0,0,0,.15);
}
.modal-header {
  display:flex; align-items:flex-start; justify-content:space-between;
  padding:22px 24px 16px;
  border-bottom:1px solid #f1f5f9;
  position:sticky; top:0; background:#fff; z-index:1;
}
.modal-eyebrow {
  font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.07em; margin-bottom:4px;
}
.modal-title { font-size:18px; font-weight:600; color:#0f172a; }
.close-btn {
  width:30px; height:30px; border:none;
  background:#f8fafc; border-radius:7px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:#64748b; transition:background .15s;
}
.close-btn:hover { background:#f1f5f9; }

.modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:20px; }

/* Status banner */
.status-banner {
  display:flex; align-items:center; gap:14px;
  padding:14px 16px; border-radius:12px;
}
.status-banner.received  { background:#f0fdf4; color:#15803d; }
.status-banner.generated { background:#eff6ff; color:#1d4ed8; }
.status-banner.pending   { background:#fffbeb; color:#b45309; }
.banner-icon {
  width:38px; height:38px; border-radius:9px;
  background:rgba(255,255,255,.6);
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0;
}
.banner-title { font-size:14px; font-weight:600; margin-bottom:2px; }
.banner-sub   { font-size:12.5px; opacity:.8; }

/* Hours highlight */
.hours-highlight {
  background:#f8fafc; border-radius:12px; padding:18px 20px;
}
.hl-left { margin-bottom:14px; }
.hl-val  { font-size:40px; font-weight:700; color:#0f172a; letter-spacing:-.04em; }
.hl-unit { font-size:20px; font-weight:500; color:#94a3b8; }
.hl-label { display:block; font-size:12.5px; color:#64748b; margin-top:4px; }
.hl-track {
  height:6px; background:#e2e8f0; border-radius:99px;
  overflow:hidden; margin-bottom:6px;
}
.hl-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6);
  transition:width .6s ease;
}
.hl-legend {
  display:flex; justify-content:space-between;
  font-size:11px; color:#94a3b8;
  font-family:'DM Mono',monospace;
}

/* Detail rows */
.detail-grid { display:flex; flex-direction:column; gap:0; }
.detail-row {
  display:flex; align-items:center; justify-content:space-between;
  padding:11px 0;
  border-bottom:1px solid #f8fafc;
}
.detail-row:last-child { border-bottom:none; }
.d-label { font-size:13px; color:#64748b; }
.d-val   { font-size:13.5px; font-weight:500; color:#0f172a; }
.d-val.mono  { font-family:'DM Mono',monospace; }
.d-val.notes { color:#475569; font-size:13px; font-weight:400; max-width:220px; text-align:right; }

.status-badge {
  display:inline-flex; align-items:center; gap:6px;
  padding:4px 11px; border-radius:6px;
  font-size:12px; font-weight:600;
}
.status-badge.received  { background:#f0fdf4; color:#15803d; }
.status-badge.generated { background:#eff6ff; color:#1d4ed8; }
.status-badge.pending   { background:#fffbeb; color:#b45309; }
.s-dot { width:6px; height:6px; border-radius:50%; background:currentColor; }

/* Progress */
.progress-section { }
.progress-label {
  font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.07em; margin-bottom:12px;
}
.progress-track { display:flex; align-items:center; }
.prog-step { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }
.prog-step span { font-size:11px; color:#94a3b8; white-space:nowrap; }
.prog-step.active span { color:#475569; font-weight:500; }
.prog-dot {
  width:10px; height:10px; border-radius:50%;
  border:2px solid #e2e8f0; background:#fff; transition:all .3s;
}
.prog-dot.filled { background:#0f172a; border-color:#0f172a; }
.prog-line {
  flex:1; height:2px; background:#e2e8f0;
  margin-bottom:18px; transition:background .3s;
}
.prog-line.filled { background:#0f172a; }

.modal-footer {
  padding:14px 24px 20px;
  border-top:1px solid #f1f5f9;
  display:flex; justify-content:flex-end;
}
.btn-close {
  padding:9px 24px; border:1px solid #e2e8f0; border-radius:8px;
  background:#f8fafc; font-family:'DM Sans',sans-serif;
  font-size:14px; color:#475569; cursor:pointer; transition:background .15s;
}
.btn-close:hover { background:#f1f5f9; }

.modal-fade-enter-active, .modal-fade-leave-active { transition:all .2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity:0; }
.modal-fade-enter-from .modal-box,
.modal-fade-leave-to   .modal-box { transform:translateY(12px) scale(.98); }
</style>