<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <div class="logo-circle">
          <!-- simple logo -->
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
          </svg>
        </div>
        <h2>Welcome Back</h2>
        <p class="subtitle">Sign in to your account to continue</p>
      </div>

      <form @submit.prevent="loginUser" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="Enter your password" required />
        </div>

        <button type="submit" class="login-button" :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <span v-else class="loading-spinner"></span>
        </button>

        <div v-if="message" :class="['message', messageType]">{{ message }}</div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      message: '',
      messageType: 'error',
      isLoading: false
    };
  },
  methods: {
    async loginUser() {
      this.isLoading = true;
      this.message = '';

      try {
        const res = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: this.email, password: this.password })
        });

        const data = await res.json();

        if (res.ok) {
          // Store token in localStorage
          localStorage.setItem('userToken', data.token);

          this.messageType = 'success';
          this.message = 'Login successful! Redirecting...';

          // Role-based redirect
          setTimeout(() => {
            if (data.role === 'admin') {
              this.$router.push('/adminDashboard');
            } else if (data.role === 'student') {
              this.$router.push('/studentDashboard');
            } else {
              this.message = 'Unknown role';
            }
          }, 500);

        } else {
          this.messageType = 'error';
          this.message = data.message || 'Login failed';
        }
      } catch (err) {
        console.error(err);
        this.messageType = 'error';
        this.message = 'Unable to connect to server';
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: Arial, sans-serif;
}

.login-container {
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

h2 {
  text-align: center;
  margin-bottom: 0.5rem;
}

.subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.login-button {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.message {
  margin-top: 1rem;
  padding: 8px 12px;
  border-radius: 6px;
}

.message.error {
  background: #fee;
  color: #c53030;
}

.message.success {
  background: #f0fdf4;
  color: #166534;
}
</style>
