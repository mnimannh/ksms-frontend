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
            <input id="fullName" type="text" v-model="form.fullName" placeholder="e.g. Jane Smith" required />
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
                <input type="radio" value="active" v-model="form.status" />
                <span class="dot active-dot"></span> Active
              </label>
              <label class="toggle-option" :class="{ selected: form.status === 'inactive' }">
                <input type="radio" value="inactive" v-model="form.status" />
                <span class="dot inactive-dot"></span> Inactive
              </label>
            </div>
          </div>
        </div>

        <div v-if="user" class="form-group password-toggle-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="changingPassword" />
            <span class="checkbox-box">
              <svg v-if="changingPassword" width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.8 7L9 1" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            Change password
          </label>
        </div>

        <div v-if="!user || changingPassword" class="form-row two-col">
          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              v-model="form.password"
              placeholder="••••••••"
              :required="!user || changingPassword"
            />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm</label>
            <input
              id="confirmPassword"
              type="password"
              v-model="form.confirmPassword"
              placeholder="••••••••"
              :required="!user || changingPassword"
            />
          </div>
        </div>

        <div class="form-divider"></div>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
          <button type="submit" class="btn-save" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Saving…' : (user ? 'Update User' : 'Add User') }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'UserModal',
  props: {
    visible: { type: Boolean, default: false },
    user: { type: Object, default: null }
  },
  data() {
    return {
      form: {
        fullName: '',
        email: '',
        role: 'staff',
        status: 'active',
        password: '',
        confirmPassword: ''
      },
      changingPassword: false,
      loading: false
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
            password: '',
            confirmPassword: ''
          }
          this.changingPassword = false
        } else {
          this.form = {
            fullName: '',
            email: '',
            role: 'staff',
            status: 'active',
            password: '',
            confirmPassword: ''
          }
          this.changingPassword = false
        }
      }
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    async submitForm() {
      if ((!this.user || this.changingPassword) && this.form.password !== this.form.confirmPassword) {
        alert('Passwords do not match!')
        return
      }
      this.loading = true
      try {
        const payload = { ...this.form }
        if (this.user) {
          if (!this.changingPassword || !payload.password) {
            delete payload.password
          }
          delete payload.confirmPassword
          await axios.put(`http://localhost:3000/api/users/${this.user.id}`, payload)
        } else {
          delete payload.confirmPassword
          await axios.post('http://localhost:3000/api/users', payload)
        }
        this.$emit('save')
        this.closeModal()
      } catch (err) {
        console.error('Error saving user:', err)
        alert('Failed to save user.')
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
  position: fixed;
  inset: 0;
  background: rgba(10, 12, 18, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: #fff;
  width: 460px;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06);
  animation: slideUp 0.2s cubic-bezier(0.34, 1.3, 0.64, 1);
}

@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* ── Header ── */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 28px 20px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-eyebrow {
  display: block;
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 3px;
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.close-btn {
  background: #f3f4f6;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
  margin-top: 2px;
  transition: background 0.15s, color 0.15s;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

/* ── Form ── */
.modal-form {
  padding: 24px 28px;
}

.form-row {
  margin-bottom: 18px;
}

.form-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.02em;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #111827;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 13px;
  outline: none;
  transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #111827;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
}

input::placeholder { color: #c4c9d4; }

/* Select */
.select-wrapper {
  position: relative;
}

select {
  font-family: 'DM Sans', sans-serif;
  font-size: 13.5px;
  color: #111827;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 9px 36px 9px 13px;
  outline: none;
  width: 100%;
  appearance: none;
  cursor: pointer;
  transition: border-color 0.18s;
}

select:focus {
  border-color: #111827;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(17,24,39,0.07);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
}

/* Status Toggle */
.status-toggle {
  display: flex;
  gap: 8px;
  padding-top: 2px;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 7px;
  border: 1px solid #e5e7eb;
  font-size: 12.5px;
  font-weight: 400 !important;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
  background: #f9fafb;
}

.toggle-option input[type="radio"] {
  display: none;
}

.toggle-option.selected {
  background: #f0f9ff;
  border-color: #bae6fd;
  color: #0369a1;
  font-weight: 500 !important;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.active-dot { background: #22c55e; }
.inactive-dot { background: #f87171; }

/* Checkbox */
.password-toggle-group {
  margin-bottom: 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  font-weight: 400 !important;
  color: #6b7280;
  cursor: pointer;
  letter-spacing: 0;
}

.checkbox-box {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 1.5px solid #d1d5db;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

input[type="checkbox"] {
  display: none;
}

input[type="checkbox"]:checked + .checkbox-box {
  background: #111827;
  border-color: #111827;
}

/* Divider */
.form-divider {
  height: 1px;
  background: #f3f4f6;
  margin: 20px 0 20px;
}

/* Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  border: none;
  padding: 9px 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel:hover { background: #e5e7eb; color: #374151; }

.btn-save {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background: #16a34a;
  border: none;
  padding: 9px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.15s, transform 0.12s;
}

.btn-save:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>