<template>
  <div>
    <h2>Register User</h2>
    <form @submit.prevent="registerUser">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="fullName" type="text" placeholder="Full Name" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      fullName: '',
      password: '',
      message: ''
    };
  },
  methods: {
    registerUser() {
      fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.email,
          fullName: this.fullName,
          password: this.password
        })
      })
        .then(res => res.json())
        .then(data => {
          this.message = data.message;
          this.email = '';
          this.fullName = '';
          this.password = '';
        })
        .catch(err => console.error(err));
    }
  }
};
</script>
