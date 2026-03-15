<template>
  <div class="login-page">

    <div class="login-card">

      <!-- Logo -->
      <div class="brand">
        <div class="brand-icon">
          <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.8"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.8"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.8"/>
          </svg>
        </div>
        <span class="brand-name">KSMS</span>
      </div>

      <!-- Heading -->
      <div class="card-header">
        <span class="card-eyebrow">Welcome back</span>
        <h1 class="card-title">Sign in</h1>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleLogin" class="login-form">

        <div class="form-group" :class="{ error: errors.email }">
          <label for="email">Email address</label>
          <div class="input-wrap">
            <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
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
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="form-group" :class="{ error: errors.password }">
          <label for="password">Password</label>
          <div class="input-wrap">
            <svg class="input-icon" width="14" height="14" viewBox="0 0 16 16" fill="none">
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
            <button type="button" class="toggle-pw" @click="showPassword = !showPassword" tabindex="-1">
              <svg v-if="!showPassword" width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 2l12 12M6.5 6.6A2 2 0 0010 9.4M4.2 4.3C2.8 5.3 1.7 6.7 1 8c1.3 2.7 4 5 7 5a7 7 0 003.8-1.1M6 3.2A7 7 0 0115 8c-.4.9-1 1.8-1.7 2.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <div v-if="loginError" class="alert-error">
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M8 5v3.5M8 11v.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          {{ loginError }}
        </div>

        <button type="submit" class="btn-login" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span v-else>Sign in</span>
        </button>

      </form>

    </div>

  </div>
</template>

<script>
import API_BASE_URL from '@/services/api'
export default {
  name: 'LoginView',
  data() {
    return {
      form: { email: '', password: '' },
      errors: {},
      loginError: '',
      loading: false,
      showPassword: false
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
        this.$router.push(role === 'admin' ? '/admin/dashboard' : '/staff/dashboard')
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

@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

*{
  box-sizing:border-box;
  margin:0;
  padding:0;
}

.login-page{
  min-height:100vh;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.18) 0%, transparent 55%),
    radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.12) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(29,78,216,0.14) 0%, transparent 50%),
    linear-gradient(135deg,#0f172a 0%,#111f3a 50%,#0f172a 100%);
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:'DM Sans',sans-serif;
  padding:24px;
}

/* CARD */

.login-card{
  background:#fff;
  border:1px solid #e5e7eb;
  border-radius:16px;
  padding:40px 36px;
  width:100%;
  max-width:380px;
  box-shadow:0 4px 24px rgba(0,0,0,0.05),0 1px 4px rgba(0,0,0,0.03);
}

/* BRAND */

.brand{
  display:flex;
  align-items:center;
  gap:9px;
  margin-bottom:32px;
}

.brand-icon{
  width:34px;
  height:34px;
  background:rgba(37,99,235,0.1);
  border:1px solid rgba(37,99,235,0.25);
  border-radius:9px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#3b82f6;
}

.brand-name{
  font-size:16px;
  font-weight:700;
  color:#111827;
  letter-spacing:.07em;
}

/* HEADER */

.card-header{
  margin-bottom:28px;
}

.card-eyebrow{
  display:block;
  font-size:11px;
  font-weight:600;
  letter-spacing:.12em;
  text-transform:uppercase;
  color:#9ca3af;
  margin-bottom:5px;
}

.card-title{
  font-size:24px;
  font-weight:700;
  color:#111827;
  letter-spacing:-.03em;
}

/* FORM */

.login-form{
  display:flex;
  flex-direction:column;
  gap:18px;
}

.form-group{
  display:flex;
  flex-direction:column;
  gap:6px;
}

.form-group label{
  font-size:12px;
  font-weight:600;
  color:#374151;
}

.input-wrap{
  position:relative;
  display:flex;
  align-items:center;
}

.input-icon{
  position:absolute;
  left:12px;
  color:#9ca3af;
  pointer-events:none;
}

.input-wrap input{
  font-family:'DM Sans',sans-serif;
  font-size:14px;
  color:#111827;
  background:#f9fafb;
  border:1px solid #e5e7eb;
  border-radius:9px;
  padding:12px 14px 12px 38px;
  width:100%;
  outline:none;
  transition:border-color .18s,box-shadow .18s,background .18s;
}

.input-wrap input::placeholder{
  color:#c4c9d4;
}

.input-wrap input:focus{
  border-color:#111827;
  background:#fff;
  box-shadow:0 0 0 3px rgba(17,24,39,.07);
}

.form-group.error .input-wrap input{
  border-color:#fca5a5;
  background:#fff;
  box-shadow:0 0 0 3px rgba(239,68,68,.06);
}

.toggle-pw{
  position:absolute;
  right:11px;
  background:none;
  border:none;
  cursor:pointer;
  color:#9ca3af;
  display:flex;
  align-items:center;
}

.toggle-pw:hover{
  color:#374151;
}

.error-msg{
  font-size:11.5px;
  color:#ef4444;
}

/* ALERT */

.alert-error{
  display:flex;
  align-items:center;
  gap:8px;
  background:#fff7f7;
  border:1px solid #fecaca;
  border-radius:8px;
  padding:10px 13px;
  font-size:13px;
  color:#b91c1c;
}

/* BUTTON */

.btn-login{
  font-family:'DM Sans',sans-serif;
  font-size:14px;
  font-weight:600;
  color:#fff;
  background:#111827;
  border:none;
  border-radius:9px;
  padding:12px;
  width:100%;
  cursor:pointer;
  display:flex;
  align-items:center;
  justify-content:center;
  margin-top:4px;
  transition:background .15s,transform .12s;
}

.btn-login:hover:not(:disabled){
  background:#1f2937;
  transform:translateY(-1px);
}

.btn-login:disabled{
  opacity:.6;
  cursor:not-allowed;
}

.spinner{
  width:15px;
  height:15px;
  border:2px solid rgba(255,255,255,.3);
  border-top-color:#fff;
  border-radius:50%;
  animation:spin .6s linear infinite;
}

@keyframes spin{
  to{transform:rotate(360deg);}
}


/* ========================= */
/* TABLET RESPONSIVE */
/* ========================= */

@media (max-width:768px){

.login-card{
  max-width:420px;
  padding:36px 30px;
}

.card-title{
  font-size:22px;
}

.brand-name{
  font-size:15px;
}

}


/* ========================= */
/* MOBILE RESPONSIVE */
/* ========================= */

@media (max-width:480px){

.login-page{
  padding:16px;
}

.login-card{
  max-width:100%;
  padding:28px 22px;
  border-radius:14px;
}

.card-title{
  font-size:20px;
}

.brand-name{
  font-size:14px;
}

.input-wrap input{
  font-size:15px;
  padding:13px 14px 13px 40px;
}

.btn-login{
  font-size:15px;
  padding:14px;
}

.input-icon{
  left:14px;
}

.toggle-pw{
  right:12px;
}

}

</style>