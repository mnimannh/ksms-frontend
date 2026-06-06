<template>
  <div class="login-page">

    <!-- ── Left branding panel ── -->
    <div class="left-panel">
      <div class="left-inner">

        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.8"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.8"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.8"/>
            </svg>
          </div>
          <span class="brand-name">KSMS</span>
        </div>

        <div class="left-body">
          <h2 class="left-headline">Koperasi Kolej Vokasional Shah Alam</h2>
          <p class="left-sub">Streamline scheduling, track attendance, and manage your team — all in one place.</p>

          <ul class="feature-list">
            <li><span class="dot"></span>Real-time shift scheduling</li>
            <li><span class="dot"></span>Attendance tracking &amp; reports</li>
            <li><span class="dot"></span>Role-based access control</li>
          </ul>
        </div>

        <p class="left-footer">© 2026 KSMS · All rights reserved</p>

      </div>

      <!-- decorative glow -->
      <div class="glow glow-a"></div>
      <div class="glow glow-b"></div>
    </div>

    <!-- ── Right form panel ── -->
    <div class="right-panel">
      <div class="form-card">

        <!-- ── LOGIN view ── -->
        <template v-if="currentView === 'login'">
          <div class="form-header">
            <span class="eyebrow">Welcome back</span>
            <h1 class="form-title">Sign in to your account</h1>
            <p class="form-hint">Enter your credentials below to continue.</p>
          </div>

          <form @submit.prevent="handleLogin" class="login-form" novalidate>

            <div class="field" :class="{ 'field--error': errors.email }">
              <label for="email">Email address</label>
              <div class="input-wrap">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M1 6l7 4 7-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                  id="email"
                  type="email"
                  v-model="form.email"
                  placeholder="you@example.com"
                  autocomplete="email"
                />
              </div>
              <span v-if="errors.email" class="field-error">{{ errors.email }}</span>
            </div>

            <div class="field" :class="{ 'field--error': errors.password }">
              <label for="password">Password</label>
              <div class="input-wrap">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="3" y="7" width="10" height="8" rx="1.5" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="8" cy="11" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
                <button type="button" class="pw-toggle" @click="showPassword = !showPassword" tabindex="-1" :aria-label="showPassword ? 'Hide password' : 'Show password'">
                  <svg v-if="!showPassword" width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.5"/>
                    <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
                  </svg>
                  <svg v-else width="15" height="15" viewBox="0 0 16 16" fill="none">
                    <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 9.4M4.2 4.3C2.8 5.3 1.7 6.7 1 8c1.3 2.7 4 5 7 5a7 7 0 003.8-1.1M6 3.2A7 7 0 0115 8c-.4.9-1 1.8-1.7 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.password" class="field-error">{{ errors.password }}</span>
            </div>

            <div v-if="loginError" class="alert-error" role="alert">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style="flex-shrink:0">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
                <path d="M8 5v3.5M8 11v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              {{ loginError }}
            </div>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              <template v-else>
                <span>Sign in</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </template>
            </button>

            <div class="forgot-link-wrap">
              <button type="button" class="forgot-link" @click="currentView = 'forgotForm'">Forgot password?</button>
            </div>

          </form>
        </template>

        <!-- ── FORGOT FORM view ── -->
        <template v-else-if="currentView === 'forgotForm'">
          <div class="form-header">
            <span class="eyebrow">Account recovery</span>
            <h1 class="form-title">Reset your password</h1>
            <p class="form-hint">Enter your email and we'll send you a reset link.</p>
          </div>

          <form @submit.prevent="handleForgot" class="login-form" novalidate>

            <div class="field" :class="{ 'field--error': forgotError }">
              <label for="forgot-email">Email address</label>
              <div class="input-wrap">
                <svg class="field-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M1 6l7 4 7-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <input
                  id="forgot-email"
                  type="email"
                  v-model="forgotEmail"
                  placeholder="you@example.com"
                  autocomplete="email"
                />
              </div>
              <span v-if="forgotError" class="field-error">{{ forgotError }}</span>
            </div>

            <button type="submit" class="btn-submit" :disabled="forgotLoading">
              <span v-if="forgotLoading" class="spinner"></span>
              <template v-else>
                <span>Send reset link</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8l10-4-4 10-2-4z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                </svg>
              </template>
            </button>

            <div class="forgot-link-wrap">
              <button type="button" class="forgot-link" @click="currentView = 'login'">← Back to sign in</button>
            </div>

          </form>
        </template>

        <!-- ── EMAIL SENT view ── -->
        <template v-else-if="currentView === 'forgotSent'">
          <div class="sent-state">
            <div class="sent-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="3" stroke="#3b82f6" stroke-width="1.8"/>
                <path d="M2 8l10 6 10-6" stroke="#3b82f6" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <h2 class="sent-title">Check your inbox</h2>
            <p class="sent-body">
              We sent a reset link to <strong>{{ forgotEmail }}</strong>. It expires in 1 hour.
            </p>
            <p class="sent-note">Didn't receive it? Check your spam folder, or try a different email.</p>
            <button type="button" class="btn-submit" @click="currentView = 'forgotForm'">
              Try another email
            </button>
            <div class="forgot-link-wrap">
              <button type="button" class="forgot-link" @click="currentView = 'login'">← Back to sign in</button>
            </div>
          </div>
        </template>

      </div>
    </div>

  </div>
</template>

<script>
import API_BASE_URL from '@/services/api'
export default {
  name: 'LoginView',
  data() {
    return {
      currentView: 'login',
      form: { email: '', password: '' },
      errors: {},
      loginError: '',
      loading: false,
      showPassword: false,
      forgotEmail: '',
      forgotError: '',
      forgotLoading: false,
    }
  },
  methods: {
    validate() {
      this.errors = {}
      if (!this.form.email) this.errors.email = 'Email is required.'
      else if (!/\S+@\S+\.\S+/.test(this.form.email)) this.errors.email = 'Enter a valid email.'
      if (!this.form.password) this.errors.password = 'Password is required.'
      return Object.keys(this.errors).length === 0
    },
    async handleForgot() {
      this.forgotError = ''
      if (!this.forgotEmail) { this.forgotError = 'Email is required.'; return }
      if (!/\S+@\S+\.\S+/.test(this.forgotEmail)) { this.forgotError = 'Enter a valid email.'; return }
      this.forgotLoading = true
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.forgotEmail })
        })
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.message || 'Something went wrong.')
        }
        this.currentView = 'forgotSent'
      } catch (err) {
        this.forgotError = err.message || 'Something went wrong. Please try again.'
      } finally {
        this.forgotLoading = false
      }
    },
    async handleLogin() {
      this.loginError = ''
      if (!this.validate()) return
      this.loading = true
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.form.email, password: this.form.password })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Invalid credentials.')
        localStorage.setItem('userToken', data.token)
        localStorage.setItem('userName', data.fullName || '')
        localStorage.setItem('userRole', data.role || '')
        const role = (data.role || '').toLowerCase()
        this.$router.push(role === 'admin' ? '/admin/inventory' : '/staff/pos')
      } catch (err) {
        this.loginError = err.message || 'Something went wrong. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* ─────────────────────────────────────────
   PAGE LAYOUT
───────────────────────────────────────── */

.login-page {
  min-height: 100vh;
  display: flex;
  font-family: 'DM Sans', sans-serif;
}

/* ─────────────────────────────────────────
   LEFT PANEL
───────────────────────────────────────── */

.left-panel {
  width: 44%;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(29,78,216,0.14) 0%, transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #111f3a 50%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  padding: 52px 52px;
}

/* subtle dot-grid texture */
.left-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(59,130,246,0.18) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

.left-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* decorative glows */
.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(72px);
  pointer-events: none;
  z-index: 0;
}
.glow-a {
  width: 340px;
  height: 340px;
  background: rgba(37,99,235,0.22);
  bottom: -80px;
  right: -80px;
}
.glow-b {
  width: 200px;
  height: 200px;
  background: rgba(59,130,246,0.14);
  top: 60px;
  right: 30px;
}

/* brand */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-icon {
  width: 42px;
  height: 42px;
  background: rgba(37,99,235,0.15);
  border: 1px solid rgba(37,99,235,0.25);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
}

.brand-name {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: .1em;
}

/* body */
.left-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 32px;
}

.left-headline {
  font-size: 38px;
  font-weight: 700;
  color: #fff;
  line-height: 1.18;
  letter-spacing: -.04em;
  margin-bottom: 18px;
}

.left-sub {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
  line-height: 1.8;
  max-width: 310px;
  margin-bottom: 40px;
}

.feature-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.feature-list li {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 13.5px;
  color: rgba(255,255,255,0.6);
  font-weight: 400;
}

.dot {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(59,130,246,0.7);
}

.left-footer {
  font-size: 11.5px;
  color: rgba(255,255,255,0.2);
  letter-spacing: .02em;
}

/* ─────────────────────────────────────────
   RIGHT PANEL
───────────────────────────────────────── */

.right-panel {
  flex: 1;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
}

.form-card {
  width: 100%;
  max-width: 368px;
}

/* header */
.form-header {
  margin-bottom: 36px;
}

.eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: .13em;
  text-transform: uppercase;
  color: #3b82f6;
  margin-bottom: 12px;
}

.eyebrow::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 1.5px;
  background: #3b82f6;
  border-radius: 2px;
}

.form-title {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -.035em;
  line-height: 1.2;
  margin-bottom: 8px;
}

.form-hint {
  font-size: 13.5px;
  color: #9ca3af;
  line-height: 1.5;
}

/* ─────────────────────────────────────────
   FORM FIELDS
───────────────────────────────────────── */

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field label {
  font-size: 12.5px;
  font-weight: 600;
  color: #374151;
  letter-spacing: .015em;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 14px;
  color: #9ca3af;
  pointer-events: none;
  transition: color .18s;
}

.input-wrap:focus-within .field-icon {
  color: #374151;
}

.input-wrap input {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  color: #111827;
  background: #f9fafb;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  padding: 13px 14px 13px 44px;
  width: 100%;
  outline: none;
  transition: border-color .18s, box-shadow .18s, background .18s;
}

.input-wrap input::placeholder {
  color: #c4c9d4;
}

.input-wrap input:focus {
  border-color: #111827;
  background: #fff;
  box-shadow: 0 0 0 3.5px rgba(17,24,39,.07);
}

.field--error .input-wrap input {
  border-color: #fca5a5;
  background: #fff;
  box-shadow: 0 0 0 3.5px rgba(239,68,68,.06);
}

.field-error {
  font-size: 11.5px;
  color: #ef4444;
}

/* password toggle */
.pw-toggle {
  position: absolute;
  right: 11px;
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 6px;
  transition: color .15s, background .15s;
}

.pw-toggle:hover {
  color: #374151;
  background: rgba(17,24,39,.06);
}

/* ─────────────────────────────────────────
   ERROR ALERT
───────────────────────────────────────── */

.alert-error {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #fff7f7;
  border: 1px solid #fecaca;
  border-radius: 9px;
  padding: 12px 14px;
  font-size: 13px;
  color: #b91c1c;
  line-height: 1.45;
}

/* ─────────────────────────────────────────
   SUBMIT BUTTON
───────────────────────────────────────── */

.btn-submit {
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: #111827;
  border: none;
  border-radius: 10px;
  padding: 13px 20px;
  width: 100%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 6px;
  letter-spacing: .01em;
  transition: background .15s, transform .12s, box-shadow .15s;
}

.btn-submit:hover:not(:disabled) {
  background: #1f2937;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(17,24,39,.22);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: none;
}

.btn-submit:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin .65s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ─────────────────────────────────────────
   FORGOT PASSWORD
───────────────────────────────────────── */

.forgot-link-wrap {
  display: flex;
  justify-content: center;
  margin-top: 4px;
}

.forgot-link {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  color: #6b7280;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: color .15s, background .15s;
}

.forgot-link:hover {
  color: #111827;
  background: rgba(17,24,39,.06);
}

/* ─────────────────────────────────────────
   EMAIL SENT STATE
───────────────────────────────────────── */

.sent-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 8px 0;
}

.sent-icon {
  width: 64px;
  height: 64px;
  background: #eff6ff;
  border: 1.5px solid #bfdbfe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.sent-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  letter-spacing: -.03em;
  line-height: 1.2;
  margin: 0;
}

.sent-body {
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
  margin: 0;
}

.sent-note {
  font-size: 12.5px;
  color: #9ca3af;
  line-height: 1.6;
  margin: 0;
}

.sent-state .btn-submit {
  width: 100%;
  margin-top: 4px;
}

/* ─────────────────────────────────────────
   RESPONSIVE — TABLET
───────────────────────────────────────── */

@media (max-width: 900px) {
  .left-panel {
    width: 42%;
    padding: 44px 36px;
  }
  .left-headline {
    font-size: 30px;
  }
}

/* ─────────────────────────────────────────
   RESPONSIVE — MOBILE (stacked)
───────────────────────────────────────── */

@media (max-width: 660px) {
  .login-page {
    flex-direction: column;
  }

  .left-panel {
    width: 100%;
    padding: 28px 24px 26px;
  }

  .left-body,
  .left-footer {
    display: none;
  }

  .right-panel {
    flex: 1;
    align-items: flex-start;
    padding: 36px 24px 48px;
  }

  .form-card {
    max-width: 100%;
  }

  .form-title {
    font-size: 22px;
  }
}

@media (max-width: 380px) {
  .right-panel {
    padding: 28px 18px 40px;
  }
}

</style>
