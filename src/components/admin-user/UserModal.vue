<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <header class="modal-header">
        <div class="modal-title-group">
          <span class="modal-eyebrow">{{ user ? 'Edit' : 'New' }} User</span>
          <h2>{{ user ? user.fullName : 'Add new user' }}</h2>
        </div>
        <button class="close-btn" @click="closeModal">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </button>
      </header>

      <form @submit.prevent="submitForm" class="modal-form">
        <div class="form-row">
          <div class="form-group">
            <label for="fullName">Full Name</label>
            <input id="fullName" type="text" v-model="form.fullName" placeholder="E.G. JANE SMITH" required class="input-uppercase" @input="form.fullName = form.fullName.toUpperCase()" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input id="email" type="email" v-model="form.email" placeholder="jane@example.com" required />
          </div>
        </div>

        <div class="form-row two-col">
          <div class="form-group">
            <label for="role">Role</label>
            <div class="select-wrapper">
              <select id="role" v-model="form.role" required>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
              <svg class="select-arrow" width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <div class="form-group">
            <label>Status</label>
            <div class="status-toggle">
              <label class="toggle-option" :class="{ selected: form.status === 'active' }">
                <input type="radio" value="active" :checked="form.status === 'active'" @change="requestStatusChange('active')" />
                <span class="dot active-dot"></span> Active
              </label>
              <label class="toggle-option" :class="{ selected: form.status === 'inactive' }">
                <input type="radio" value="inactive" :checked="form.status === 'inactive'" @change="requestStatusChange('inactive')" />
                <span class="dot inactive-dot"></span> Inactive
              </label>
            </div>
          </div>
        </div>

        <!-- RFID UID field — only shown when role is Staff -->
        <transition name="rfid-slide">
          <div v-if="form.role === 'staff'" class="form-row rfid-row">
            <div class="form-group">
              <label for="rfidUid">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style="vertical-align:-2px; margin-right:4px;">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="1.8"/>
                  <path d="M7 12h10M7 9h4M7 15h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                RFID UID
              </label>
              <div class="rfid-input-wrapper">
                <input
                  id="rfidUid"
                  ref="rfidInput"
                  type="text"
                  :value="form.rfidUid"
                  placeholder="e.g. 02B6494C"
                  :required="form.role === 'staff'"
                  maxlength="8"
                  :readonly="!rfidScanMode"
                  :class="{ scanning: rfidScanMode }"
                  @keydown.enter.prevent="onRfidEnter"
                  @input="onRfidInput"
                />
                <span v-if="!rfidScanMode" class="rfid-badge">RFID</span>
                <span v-else class="rfid-badge scanning-badge">Scanning…</span>
              </div>

              <!-- Scan action button -->
              <div class="rfid-actions">
                <button
                  type="button"
                  class="btn-icon-action"
                  :class="{ active: rfidScanMode }"
                  @click="confirmRfidScan"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <path d="M7 12h10"/>
                    <circle cx="17" cy="9" r="1.5" fill="currentColor" stroke="none"/>
                  </svg>
                  {{ rfidScanMode ? 'Scanning…' : 'Scan Card' }}
                </button>
              </div>

              <span v-if="rfidScanMode" class="field-hint scan-hint">
                <span class="scan-dot" /> Awaiting RFID scan — tap or swipe card now.
              </span>
              <span v-else class="field-hint">Hex UID (e.g. 02B6494C) — scan or enter manually</span>
            </div>
          </div>
        </transition>


        <div class="form-divider"></div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Saving…' : (user ? 'Update User' : 'Add User') }}
          </button>
        </div>
      </form>

      <!-- Confirm Dialog (same pattern as VariantModal) -->
      <div v-if="confirmDialog.show" class="confirm-overlay">
        <div class="confirm-box">
          <div class="confirm-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <p class="confirm-msg">{{ confirmDialog.message }}</p>
          <div class="confirm-actions">
            <button type="button" class="btn-ghost" @click="confirmDialog.show = false">Cancel</button>
            <button type="button" class="btn-confirm" @click="confirmDialog.onConfirm">Confirm</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'UserModal',
  props: {
    visible: { type: Boolean, default: false },
    user:    { type: Object,  default: null  }
  },
  data() {
    return {
      form: {
        fullName: '',
        email: '',
        role: 'staff',
        status: 'active',
        rfidUid: '',
      },
      loading: false,
      rfidScanMode: false,
      confirmDialog: {
        show: false,
        message: '',
        onConfirm: null,
      },
    }
  },
  watch: {
    user: {
      immediate: true,
      handler(val) {
        if (val) {
          this.form = {
            fullName: val.fullName,
            email: val.email,
            role: val.role,
            status: val.status,
            rfidUid: val.rfidUid || '',
          }
        } else {
          this.form = {
            fullName: '',
            email: '',
            role: 'staff',
            status: 'active',
            rfidUid: '',
          }
        }
        this.rfidScanMode = false
      }
    },
    'form.role'(val) {
      if (val !== 'staff') {
        this.form.rfidUid = ''
        this.rfidScanMode = false
      }
    }
  },
  methods: {
    // ── Confirm dialog ──────────────────────────────────────────────────
    showConfirm(message, onConfirm) {
      this.confirmDialog = {
        show: true,
        message,
        onConfirm: () => {
          this.confirmDialog.show = false
          onConfirm()
        },
      }
    },

    requestStatusChange(newStatus) {
      if (newStatus === this.form.status) return
      if (this.user) {
        const label = newStatus === 'active' ? 'activate' : 'deactivate'
        this.showConfirm(
          `Are you sure you want to ${label} ${this.user.fullName}?`,
          () => { this.form.status = newStatus }
        )
      } else {
        this.form.status = newStatus
      }
    },

    confirmRfidScan() {
      const msg = this.form.rfidUid
        ? 'An RFID UID already exists. Are you sure you want to overwrite it by scanning?'
        : 'Are you sure you want to scan an RFID card?'
      this.showConfirm(msg, () => this.toggleRfidScan())
    },

    // ── RFID scan ───────────────────────────────────────────────────────
    toggleRfidScan() {
      this.rfidScanMode = !this.rfidScanMode
      if (this.rfidScanMode) {
        this.form.rfidUid = ''
        this.$nextTick(() => this.$refs.rfidInput?.focus())
      }
    },

    onRfidInput(e) {
      let raw = e.target.value.trim()

      // Scanner outputs decimal → convert to hex
      if (/^\d+$/.test(raw) && raw.length > 0) {
        raw = BigInt(raw).toString(16).toUpperCase()
      }

      const cleaned = raw
        .replace(/[^0-9a-fA-F]/g, '')
        .toUpperCase()
        .slice(0, 8)

      this.form.rfidUid = cleaned
      e.target.value = cleaned
    },

    onRfidEnter() {
      if (this.rfidScanMode) {
        this.rfidScanMode = false
      }
    },

    // ── Form submit ─────────────────────────────────────────────────────
    closeModal() {
      this.rfidScanMode = false
      this.$emit('close')
    },

    async submitForm() {
      this.loading = true
      try {
        const payload = { ...this.form }
        if (payload.role !== 'staff') delete payload.rfidUid

        if (this.user) {
          await axios.put(`http://localhost:3000/api/users/${this.user.id}`, payload)
          this.$emit('save', { isEdit: true, message: `${this.form.fullName} updated successfully.` })
        } else {
          await axios.post('http://localhost:3000/api/users', payload)
          this.$emit('save', { isEdit: false, message: `${this.form.fullName} created. Temporary password sent to ${this.form.email}.` })
        }

        this.closeModal()
      } catch (err) {
        console.error('Error saving user:', err)
        const msg = err.response?.data?.message || 'Failed to save user. Please try again.'
        this.$emit('error', { message: msg })
        this.closeModal()
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

* { box-sizing: border-box; }

.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(10, 12, 18, 0.45);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-container {
  background: #fff; width: 460px;
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
  animation: slideUp 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
  position: relative;
}
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* Header */
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 28px 20px;
  border-bottom: 1px solid #f3f4f6;
}
.modal-eyebrow {
  display: block; font-size: 10.5px; font-weight: 600;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #9ca3af; margin-bottom: 3px;
}
.modal-header h2 { font-size: 18px; font-weight: 600; color: #111827; margin: 0; letter-spacing: -0.02em; }
.close-btn {
  background: #f3f4f6; border: none; width: 30px; height: 30px;
  border-radius: 50%; cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  color: #6b7280; flex-shrink: 0; margin-top: 2px;
  transition: background 0.15s, color 0.15s;
}
.close-btn:hover { background: #e5e7eb; color: #111827; }

/* Form */
.modal-form { padding: 24px 28px; }
.form-row { margin-bottom: 18px; }
.form-row.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }

label { font-size: 12px; font-weight: 600; color: #374151; letter-spacing: 0.02em; }

input[type="text"],
input[type="email"],
input[type="password"] {
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #111827;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 9px 13px; outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}
input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #111827; background: #fff;
  box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
}
input::placeholder { color: #c4c9d4; }
.input-uppercase { text-transform: uppercase; }

/* Readonly RFID input */
input[type="text"][readonly]:not(.scanning) {
  background: #f8fafc;
  color: #64748b;
  cursor: default;
}

/* Scanning state */
input.scanning {
  border-color: #10b981 !important;
  background: #fff !important;
  box-shadow: 0 0 0 3px rgba(16,185,129,.15) !important;
  animation: pulse-border 1s ease infinite;
  color: #111827 !important;
  cursor: text !important;
}
@keyframes pulse-border {
  0%,100% { box-shadow: 0 0 0 3px rgba(16,185,129,.15); }
  50%      { box-shadow: 0 0 0 6px rgba(16,185,129,.05); }
}

/* Select */
.select-wrapper { position: relative; }
select {
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #111827;
  background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 9px 36px 9px 13px; outline: none; width: 100%;
  appearance: none; cursor: pointer; transition: border-color 0.18s;
}
select:focus { border-color: #111827; background: #fff; box-shadow: 0 0 0 3px rgba(17,24,39,0.07); }
.select-arrow { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #9ca3af; }

/* Status Toggle */
.status-toggle { display: flex; gap: 8px; padding-top: 2px; }
.toggle-option {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 13px; border-radius: 7px; border: 1px solid #e5e7eb;
  font-size: 12.5px; font-weight: 400 !important; color: #6b7280;
  cursor: pointer; transition: all 0.15s; background: #f9fafb;
}
.toggle-option input[type="radio"] { display: none; }
.toggle-option.selected { background: #f0f9ff; border-color: #bae6fd; color: #0369a1; font-weight: 500 !important; }
.dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.active-dot { background: #22c55e; }
.inactive-dot { background: #f87171; }

/* ── RFID Field ── */
.rfid-row { margin-bottom: 18px; }

.rfid-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}
.rfid-input-wrapper input[type="text"] {
  width: 100%;
  padding-right: 72px;
  font-family: 'Courier New', monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.rfid-badge {
  position: absolute; right: 10px;
  font-size: 10px; font-weight: 700;
  letter-spacing: 0.08em;
  color: #6366f1;
  background: #eef2ff;
  border: 1px solid #c7d2fe;
  border-radius: 4px;
  padding: 2px 6px;
  pointer-events: none;
  user-select: none;
  transition: all 0.15s;
}
.rfid-badge.scanning-badge {
  color: #10b981;
  background: #f0fdf4;
  border-color: #6ee7b7;
}

/* RFID scan button */
.rfid-actions { display: flex; gap: 8px; margin-top: 4px; }
.btn-icon-action {
  display: flex; align-items: center; gap: 6px;
  padding: 7px 12px; border-radius: 8px;
  border: 1px solid #e2e8f0; background: #f8fafc;
  font-size: 12.5px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  color: #475569; cursor: pointer; white-space: nowrap; transition: all .15s;
}
.btn-icon-action:hover       { border-color: #6366f1; color: #6366f1; }
.btn-icon-action.active      { background: #f0fdf4; border-color: #10b981; color: #10b981; }

/* Hints */
.field-hint {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 400;
  margin-top: 2px;
}
.scan-hint {
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.scan-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #10b981;
  display: inline-block; animation: blink 1s ease infinite; flex-shrink: 0;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

/* RFID slide transition */
.rfid-slide-enter-active { transition: all 0.22s cubic-bezier(0.34, 1.3, 0.64, 1); }
.rfid-slide-leave-active { transition: all 0.15s ease; }
.rfid-slide-enter-from   { opacity: 0; transform: translateY(-6px); }
.rfid-slide-leave-to     { opacity: 0; transform: translateY(-4px); }

/* Divider */
.form-divider { height: 1px; background: #f3f4f6; margin: 20px 0; }

/* Actions */
.form-actions { display: flex; justify-content: flex-end; gap: 10px; }
.btn-cancel {
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  color: #6b7280; background: #f3f4f6; border: none;
  padding: 9px 18px; border-radius: 8px; cursor: pointer; transition: background 0.15s;
}
.btn-cancel:hover { background: #e5e7eb; color: #374151; }
.btn-save {
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
  color: #fff; background: #16a34a; border: none;
  padding: 9px 20px; border-radius: 8px; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background 0.15s, transform 0.12s;
}
.btn-save:hover:not(:disabled) { background: #124f29; transform: translateY(-1px); }
.btn-save:disabled { opacity: 0.6; cursor: not-allowed; }
.spinner {
  width: 12px; height: 12px;
  border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
  border-radius: 50%; animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Confirm dialog ── */
.confirm-overlay {
  position: absolute; inset: 0; background: rgba(15,23,42,.35);
  display: flex; align-items: center; justify-content: center;
  border-radius: inherit; z-index: 10; backdrop-filter: blur(2px);
}
.confirm-box {
  background: #fff; border-radius: 14px; padding: 28px 24px 20px;
  width: 300px; display: flex; flex-direction: column; align-items: center;
  gap: 12px; box-shadow: 0 20px 60px rgba(0,0,0,.18);
}
.confirm-icon { width: 44px; height: 44px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center; }
.confirm-msg  { font-size: 13.5px; color: #334155; text-align: center; line-height: 1.55; }
.confirm-actions { display: flex; gap: 8px; width: 100%; margin-top: 4px; }
.btn-ghost {
  flex: 1; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px;
  background: #fff; font-size: 13px; font-family: 'DM Sans', sans-serif;
  font-weight: 500; color: #64748b; cursor: pointer; display: flex; justify-content: center;
}
.btn-ghost:hover { background: #f8fafc; }
.btn-confirm {
  flex: 1; padding: 8px 16px; border: none; border-radius: 8px;
  background: #6366f1; color: #fff;
  font-size: 13px; font-family: 'DM Sans', sans-serif; font-weight: 600;
  cursor: pointer; transition: background .15s;
}
.btn-confirm:hover { background: #4f46e5; }
</style>