<template>
  <div class="main-container">
    <!-- Animated background elements -->
    <div class="animated-background">
      <div class="bg-blob blob-1"></div>
      <div class="bg-blob blob-2"></div>
      <div class="bg-blob blob-3"></div>
    </div>

    <!-- Floating particles -->
    <div class="particles-container">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
      <div class="particle particle-5"></div>
      <div class="particle particle-6"></div>
    </div>

    <div class="login-card-wrapper">
      <!-- Header with futuristic styling -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-glow"></div>
          <div class="logo-base">
            <svg class="logo-icon" fill="currentColor" viewBox="0 0 24 24">
              <!-- Updated SVG path for a shield with a checkmark -->
              <path fill-rule="evenodd" d="M11.03 3.023a.75.75 0 01.447 0 9.773 9.773 0 016.974 2.876l1.713 1.713a.75.75 0 010 1.06L12 18.06l-7.164-7.164a.75.75 0 010-1.06l1.713-1.713A9.773 9.773 0 0111.03 3.023zM9.5 10.5a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.06 0l4.5-4.5a.75.75 0 00-1.06-1.06L11.5 12.44l-1.97-1.97z" clip-rule="evenodd" />
            </svg>
          </div>
        </div>
        <h2 class="main-title">
          KSMS
        </h2>
        <p class="subtitle">
          <span class="subtitle-badge">
            Sign in to your account to continue
          </span>
        </p>
      </div>

      <!-- Futuristic form container -->
      <form class="login-form" @submit.prevent="handleLogin">
        <!-- Glassmorphism card with enhanced styling -->
        <div class="form-card">
          <!-- Animated border -->
          <div class="form-card-border">
            <div class="form-card-inner-bg"></div>
          </div>
          
          <div class="form-content">
            <!-- Username field -->
            <div class="input-group">
              <label for="identifier" class="input-label">
                <span class="input-label-content">
                  <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Email
                </span>
              </label>
              <div class="input-field-wrapper">
                <input 
                  id="identifier" 
                  v-model="loginForm.identifier" 
                  type="text" 
                  required 
                  class="input-field"
                  placeholder="Enter your email"
                />
                <div class="input-field-focus-effect"></div>
              </div>
            </div>

            <!-- Password field -->
            <div class="input-group">
              <label for="password" class="input-label">
                <span class="input-label-content">
                  <svg class="input-icon password-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  Password
                </span>
              </label>
              <div class="input-field-wrapper">
                <input 
                  id="password" 
                  v-model="loginForm.password" 
                  type="password" 
                  required 
                  class="input-field"
                  placeholder="Enter your password"
                />
                <div class="input-field-focus-effect password-focus-effect"></div>
              </div>
            </div>

            <!-- Error/Success message with enhanced styling -->
            <div v-if="error" class="message-container">
              <div :class="['message-box', { 'message-success': error.includes('successful') }]">
                <div class="message-content">
                  <svg class="message-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  {{ error }}
                </div>
              </div>
            </div>

            <!-- Futuristic submit button -->
            <div class="button-container">
              <button 
                type="submit" 
                :disabled="loading"
                class="submit-button"
              >
                <!-- Animated background -->
                <div class="submit-button-bg"></div>
                
                <!-- Button content -->
                <div class="submit-button-content">
                  <svg v-if="loading" class="spinner-icon" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg v-else class="submit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                  </svg>
                  <span v-if="loading">Signing in...</span>
                  <span v-else>Sign in</span>
                </div>

                <!-- Ripple effect -->
                <div class="submit-button-ripple"></div>
              </button>
            </div>
          </div>
        </div>

        <!-- Tech-inspired decorative elements -->
        <div class="decorative-dots">
          <div class="dot dot-1"></div>
          <div class="dot dot-2" style="animation-delay: 0.5s;"></div>
          <div class="dot dot-3" style="animation-delay: 1s;"></div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

// State variables for loading and error messages
const loading = ref(false);
const error = ref('');

// State for login form inputs
const loginForm = reactive({
  identifier: '',
  password: ''
});

// Mock login handler
const handleLogin = async () => {
  loading.value = true; // Set loading state to true
  error.value = ''; // Clear any previous errors

  // Simulate an asynchronous operation (e.g., a network request)
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate 1.5 second delay

  // Mock success or failure based on credentials
  if (loginForm.identifier === 'user' && loginForm.password === 'password') {
    console.log('Mock login successful!');
    error.value = 'Login successful! (This is a mockup)'; // Display success as an 'error' for visibility in mockup
  } else {
    error.value = 'Invalid username or password. (Mockup)'; // Mock error message
  }

  loading.value = false; // Set loading state back to false
};
</script>

<style scoped>
/* General Styles */
.main-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom right, #e0f2fe, #f3e8ff, #fce7f3); /* from-blue-50 via-purple-50 to-pink-50 */
  padding: 3rem 1rem; /* py-12 px-4 */
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif; /* Added font-sans */
}

/* Animated Background Elements */
.animated-background {
  position: absolute;
  inset: 0;
  opacity: 0.3;
}

.bg-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(3rem); /* blur-3xl */
  animation: pulse 6s infinite ease-in-out alternate;
}

.blob-1 {
  top: 25%; /* top-1/4 */
  left: 25%; /* left-1/4 */
  width: 24rem; /* w-96 */
  height: 24rem; /* h-96 */
  background: linear-gradient(to right, rgba(96, 165, 250, 0.2), rgba(168, 85, 247, 0.2)); /* from-blue-400/20 to-purple-400/20 */
}

.blob-2 {
  bottom: 25%; /* bottom-1/4 */
  right: 25%; /* right-1/4 */
  width: 20rem; /* w-80 */
  height: 20rem; /* h-80 */
  background: linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(236, 72, 153, 0.2)); /* from-indigo-400/20 to-pink-400/20 */
  animation-delay: 2s;
}

.blob-3 {
  top: 50%; /* top-1/2 */
  left: 50%; /* left-1/2 */
  transform: translate(-50%, -50%); /* -translate-x-1/2 -translate-y-1/2 */
  width: 16rem; /* w-64 */
  height: 16rem; /* h-64 */
  background: linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2)); /* from-cyan-400/20 to-blue-400/20 */
  animation-delay: 4s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Floating Particles */
.particles-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-10px) rotate(120deg); }
  66% { transform: translateY(5px) rotate(240deg); }
}

@keyframes float-reverse {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(8px) rotate(-90deg); }
  66% { transform: translateY(-6px) rotate(-180deg); }
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4);
  border-radius: 50%;
  opacity: 0.6;
}

.particle-1 {
  top: 20%;
  left: 15%;
  animation: float 6s ease-in-out infinite;
}

.particle-2 {
  top: 60%;
  right: 20%;
  animation: float-reverse 8s ease-in-out infinite;
}

.particle-3 {
  bottom: 30%;
  left: 25%;
  animation: float 7s ease-in-out infinite;
  animation-delay: 2s;
}

.particle-4 {
  top: 40%;
  right: 35%;
  animation: float-reverse 5s ease-in-out infinite;
  animation-delay: 1s;
}

.particle-5 {
  bottom: 50%;
  left: 60%;
  animation: float 9s ease-in-out infinite;
  animation-delay: 3s;
}

.particle-6 {
  top: 25%;
  right: 50%;
  animation: float-reverse 6s ease-in-out infinite;
  animation-delay: 4s;
}

/* Login Card Wrapper */
.login-card-wrapper {
  max-width: 28rem; /* max-w-md */
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem; /* sm:px-6 */
  padding-right: 1.5rem; /* sm:px-6 */
  padding-top: 2rem; /* space-y-8 */
  padding-bottom: 2rem; /* space-y-8 */
  position: relative;
  z-index: 10;
}

@media (min-width: 640px) { /* sm breakpoint */
  .login-card-wrapper {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) { /* lg breakpoint */
  .login-card-wrapper {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}

/* Header Section */
.header-section {
  text-align: center;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem; /* mb-6 */
}

.logo-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #2563eb, #7c3aed); /* from-blue-600 to-purple-600 */
  border-radius: 9999px; /* rounded-full */
  filter: blur(1rem); /* blur-lg */
  opacity: 0.75;
  animation: pulse-logo 2s infinite ease-in-out alternate;
}

@keyframes pulse-logo {
  0%, 100% { transform: scale(1); opacity: 0.75; }
  50% { transform: scale(1.05); opacity: 1; }
}

.logo-base {
  position: relative;
  background: linear-gradient(to right, #1f2937, #111827); /* from-gray-900 to-gray-800 */
  border-radius: 9999px; /* rounded-full */
  padding: 1rem; /* p-4 */
  border: 1px solid rgba(55, 65, 81, 0.5); /* border border-gray-700/50 */
}

.logo-icon {
  width: 2rem; /* w-8 */
  height: 2rem; /* h-8 */
  color: #22d3ee; /* text-cyan-400 */
}

.main-title {
  font-size: 2.25rem; /* text-4xl */
  line-height: 2.5rem; /* leading-10 */
  font-weight: 700; /* font-bold */
  background: linear-gradient(to right, #1f2937, #172554, #4a044e); /* from-gray-900 via-blue-900 to-purple-900 */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.5rem; /* mb-2 */
}

.subtitle {
  color: #4b5563; /* text-gray-600 */
  font-size: 1rem; /* text-base */
  position: relative;
}

.subtitle-badge {
  display: inline-block;
  padding: 0.25rem 1rem; /* px-4 py-1 */
  border-radius: 9999px; /* rounded-full */
  background: rgba(255, 255, 255, 0.5); /* bg-white/50 */
  backdrop-filter: blur(0.5rem); /* backdrop-blur-sm */
  border: 1px solid rgba(229, 231, 235, 0.5); /* border border-gray-200/50 */
}

/* Form Container */
.login-form {
  margin-top: 2rem; /* mt-8 */
  margin-bottom: 2rem; /* space-y-6 */
  position: relative;
}

.form-card {
  position: relative;
  background: rgba(255, 255, 255, 0.1); /* bg-white/10 */
  backdrop-filter: blur(1.5rem); /* backdrop-blur-xl */
  border-radius: 1rem; /* rounded-2xl */
  padding: 2rem; /* p-8 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* border border-white/20 */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); /* shadow-2xl */
}

.form-card-border {
  position: absolute;
  inset: 0;
  border-radius: 1rem; /* rounded-2xl */
  background: linear-gradient(to right, rgba(37, 99, 235, 0.2), rgba(126, 34, 206, 0.2), rgba(219, 39, 119, 0.2)); /* from-blue-600/20 via-purple-600/20 to-pink-600/20 */
  padding: 1px; /* p-[1px] */
}

.form-card-inner-bg {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.95); /* bg-white/95 */
  backdrop-filter: blur(1.5rem); /* backdrop-blur-xl */
  border-radius: 1rem; /* rounded-2xl */
}

.form-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 1.5rem; /* space-y-6 */
}

/* Input Fields */
.input-group {
  position: relative;
}

.input-label {
  display: block;
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* font-semibold */
  color: #374151; /* text-gray-700 */
  margin-bottom: 0.5rem; /* mb-2 */
}

.input-label-content {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
}

.input-icon {
  width: 1rem; /* w-4 */
  height: 1rem; /* h-4 */
  color: #2563eb; /* text-blue-600 */
}

.password-icon {
  color: #7c3aed; /* text-purple-600 */
}

.input-field-wrapper {
  position: relative;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem; /* px-4 py-3 */
  background: rgba(249, 250, 251, 0.8); /* bg-gray-50/80 */
  backdrop-filter: blur(0.5rem); /* backdrop-blur-sm */
  border: 2px solid #e5e7eb; /* border-2 border-gray-200 */
  border-radius: 0.75rem; /* rounded-xl */
  transition: all 0.3s ease-in-out; /* transition-all duration-300 */
  color: #111827; /* text-gray-900 */
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
}

.input-field::placeholder {
  color: #6b7280; /* placeholder-gray-500 */
}

.input-field:hover {
  border-color: #d1d5db; /* group-hover:border-gray-300 */
}

.input-field:focus {
  border-color: #3b82f6; /* focus:border-blue-500 */
  background: rgba(255, 255, 255, 0.9); /* focus:bg-white/90 */
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 10px 25px -5px rgba(59, 130, 246, 0.1);
}

.input-field-focus-effect {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem; /* rounded-xl */
  background: linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(126, 34, 206, 0.1)); /* from-blue-600/10 to-purple-600/10 */
  opacity: 0;
  transition: opacity 0.3s ease-in-out; /* transition-opacity duration-300 */
  z-index: -10;
}

.input-field:focus + .input-field-focus-effect {
  opacity: 1;
}

.password-focus-effect {
  background: linear-gradient(to right, rgba(126, 34, 206, 0.1), rgba(236, 72, 153, 0.1)); /* from-purple-600/10 to-pink-600/10 */
}

/* Message Box */
.message-container {
  position: relative;
}

.message-box {
  background: rgba(254, 242, 242, 0.9); /* bg-red-50/90 */
  backdrop-filter: blur(0.5rem); /* backdrop-blur-sm */
  border: 1px solid #fecaca; /* border border-red-200 */
  border-radius: 0.5rem; /* rounded-lg */
  padding: 0.75rem; /* p-3 */
  color: #b91c1c; /* text-red-700 */
  font-size: 0.875rem; /* text-sm */
  text-align: center;
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06); /* shadow-inner */
}

.message-success {
  background: rgba(240, 253, 244, 0.9); /* bg-green-50/90 */
  border-color: #bbf7d0; /* border-green-200 */
  color: #15803d; /* text-green-700 */
}

.message-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* gap-2 */
}

.message-icon {
  width: 1rem; /* w-4 */
  height: 1rem; /* h-4 */
}

/* Submit Button */
.button-container {
  position: relative;
}

.submit-button {
  width: 100%;
  position: relative;
  overflow: hidden;
  background: linear-gradient(to right, #2563eb, #7c3aed, #4f46e5); /* from-blue-600 via-purple-600 to-indigo-600 */
  color: #ffffff; /* text-white */
  font-weight: 600; /* font-semibold */
  padding: 0.75rem 1.5rem; /* py-3 px-6 */
  border-radius: 0.75rem; /* rounded-xl */
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); /* shadow-lg */
  transition: all 0.3s ease-in-out; /* transition-all duration-300 */
  border: none;
  cursor: pointer;
}

.submit-button:hover {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05); /* hover:shadow-xl */
  transform: translateY(-0.125rem); /* hover:-translate-y-0.5 */
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.submit-button-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, #1d4ed8, #6d28d9, #4338ca); /* from-blue-700 via-purple-700 to-indigo-700 */
  opacity: 0;
  transition: opacity 0.3s ease-in-out; /* transition-opacity duration-300 */
}

.submit-button:hover .submit-button-bg {
  opacity: 1;
}

.submit-button-content {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* gap-2 */
}

.spinner-icon {
  animation: spin 1s linear infinite;
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.submit-icon {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
}

.submit-button-ripple {
  position: absolute;
  inset: 0;
  border-radius: 0.75rem; /* rounded-xl */
  opacity: 0;
  background: rgba(255, 255, 255, 0.2); /* bg-white/20 */
  transition: opacity 0.15s ease-in-out; /* transition-opacity duration-150 */
}

.submit-button:active .submit-button-ripple {
  opacity: 1;
}

/* Decorative Dots */
.decorative-dots {
  display: flex;
  justify-content: center;
  gap: 1rem; /* space-x-4 */
  margin-top: 2rem; /* mt-8 */
}

.dot {
  width: 0.5rem; /* w-2 */
  height: 0.5rem; /* h-2 */
  border-radius: 9999px; /* rounded-full */
  animation: pulse-dot 1.5s infinite ease-in-out alternate;
}

.dot-1 {
  background-color: #3b82f6; /* bg-blue-500 */
}

.dot-2 {
  background-color: #8b5cf6; /* bg-purple-500 */
}

.dot-3 {
  background-color: #6366f1; /* bg-indigo-500 */
}

@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

/* Custom scrollbar for future use */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #2563eb, #7c3aed);
}
</style>
