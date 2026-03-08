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

          <!-- Pay breakdown -->
          <div class="pay-highlight">
            <div class="ph-row">
              <div class="ph-block">
                <span class="ph-val">{{ record.hoursWorked }}<span class="ph-unit">h</span></span>
                <span class="ph-label">Hours Worked</span>
              </div>
              <div class="ph-sep">×</div>
              <div class="ph-block">
                <span class="ph-val"><span class="ph-unit">RM </span>{{ hourlyRate.toFixed(2) }}</span>
                <span class="ph-label">Hourly Rate</span>
              </div>
              <div class="ph-sep">=</div>
              <div class="ph-block accent">
                <span class="ph-val"><span class="ph-unit">RM </span>{{ totalPay }}</span>
                <span class="ph-label">Total Pay</span>
              </div>
            </div>
            <div class="hl-track">
              <div class="hl-fill" :style="`width:${Math.min((record.hoursWorked/200)*100,100)}%`" />
            </div>
            <div class="hl-legend"><span>0h</span><span>200h target</span></div>
          </div>

          <!-- Payment Progress -->
          <div class="progress-section">
            <p class="section-label">Payment Progress</p>
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

          <!-- Processed By — info staff can't see in the table -->
          <div class="info-section">
            <p class="section-label">Processed By</p>

            <div v-if="record.isCreated" class="admin-card">
              <div class="admin-avatar">{{ adminInitials }}</div>
              <div class="admin-info">
                <span class="admin-name">{{ record.createdByName ?? 'Admin' }}</span>
                <span class="admin-meta">Generated on {{ formatDate(record.created_at) }}</span>
              </div>
              <span class="status-badge" :class="statusClass">
                <span class="s-dot" />{{ statusLabel }}
              </span>
            </div>

            <div v-else class="pending-card">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2" style="flex-shrink:0;margin-top:1px">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>Not yet processed. Awaiting admin to generate payroll.</span>
            </div>
          </div>

          <!-- Admin Notes (only if present) -->
          <div class="notes-section" v-if="record.notes">
            <p class="section-label">Admin Notes</p>
            <div class="notes-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" style="flex-shrink:0;margin-top:2px">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              <p class="notes-text">{{ record.notes }}</p>
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
    show:       { type: Boolean, required: true },
    record:     { type: Object,  default: null },
    hourlyRate: { type: Number,  default: 0 },
  },
  computed: {
    totalPay() {
      if (!this.record) return '0.00'
      return (this.record.hoursWorked * this.hourlyRate)
        .toLocaleString('en-MY', { minimumFractionDigits:2, maximumFractionDigits:2 })
    },
    adminInitials() {
      const name = this.record?.createdByName ?? 'Admin'
      return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    },
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
  },
  methods: {
    formatDate(dt) {
      if (!dt) return '—'
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
  width:100%; max-width:460px;
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

.modal-body { padding:22px 24px; display:flex; flex-direction:column; gap:22px; }

/* Pay highlight */
.pay-highlight { background:#f8fafc; border-radius:12px; padding:18px 20px; }
.ph-row {
  display:flex; align-items:center; gap:10px;
  margin-bottom:16px; flex-wrap:wrap; justify-content:center;
}
.ph-block { display:flex; flex-direction:column; align-items:center; gap:3px; }
.ph-block.accent .ph-val { color:#6366f1; }
.ph-val   { font-size:22px; font-weight:700; color:#0f172a; letter-spacing:-.03em; font-family:'DM Mono',monospace; }
.ph-unit  { font-size:13px; font-weight:500; color:#94a3b8; }
.ph-label { font-size:11px; color:#94a3b8; white-space:nowrap; }
.ph-sep   { font-size:20px; color:#cbd5e1; font-weight:300; margin-bottom:16px; }
.hl-track {
  height:5px; background:#e2e8f0; border-radius:99px;
  overflow:hidden; margin-bottom:6px;
}
.hl-fill {
  height:100%; border-radius:99px;
  background:linear-gradient(90deg,#6366f1,#8b5cf6);
  transition:width .6s ease;
}
.hl-legend {
  display:flex; justify-content:space-between;
  font-size:11px; color:#94a3b8; font-family:'DM Mono',monospace;
}

/* Section label */
.section-label {
  font-size:11px; font-weight:600; color:#94a3b8;
  text-transform:uppercase; letter-spacing:.07em; margin-bottom:12px;
}

/* Progress */
.progress-track { display:flex; align-items:center; }
.prog-step { display:flex; flex-direction:column; align-items:center; gap:5px; flex-shrink:0; }
.prog-step span { font-size:11px; color:#94a3b8; white-space:nowrap; }
.prog-step.active span { color:#475569; font-weight:500; }
.prog-dot {
  width:10px; height:10px; border-radius:50%;
  border:2px solid #e2e8f0; background:#fff; transition:all .3s;
}
.prog-dot.filled { background:#0f172a; border-color:#0f172a; }
.prog-line { flex:1; height:2px; background:#e2e8f0; margin-bottom:18px; transition:background .3s; }
.prog-line.filled { background:#0f172a; }

/* Admin card */
.admin-card {
  display:flex; align-items:center; gap:12px;
  padding:14px 16px; border-radius:12px;
  background:#f8fafc; border:1px solid #f1f5f9;
}
.admin-avatar {
  width:40px; height:40px; border-radius:10px;
  background:linear-gradient(135deg,#6366f1,#8b5cf6);
  color:#fff; font-size:13px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
  flex-shrink:0; letter-spacing:.03em;
}
.admin-info { flex:1; display:flex; flex-direction:column; gap:2px; min-width:0; }
.admin-name { font-size:13.5px; font-weight:600; color:#0f172a; }
.admin-meta { font-size:12px; color:#94a3b8; }

.pending-card {
  display:flex; align-items:flex-start; gap:8px;
  padding:12px 14px; border-radius:10px;
  background:#fffbeb; color:#b45309; font-size:13px; line-height:1.55;
}

/* Status badge */
.status-badge {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 10px; border-radius:6px;
  font-size:11.5px; font-weight:600; flex-shrink:0;
}
.status-badge.received  { background:#f0fdf4; color:#15803d; }
.status-badge.generated { background:#eff6ff; color:#1d4ed8; }
.status-badge.pending   { background:#fffbeb; color:#b45309; }
.s-dot { width:5px; height:5px; border-radius:50%; background:currentColor; }

/* Notes */
.notes-box {
  display:flex; gap:10px; align-items:flex-start;
  background:#f8fafc; border-radius:10px;
  padding:12px 14px; border-left:3px solid #e2e8f0;
}
.notes-text { font-size:13px; color:#475569; line-height:1.6; }

/* Footer */
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