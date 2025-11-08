<template>
  <div>
    <h2>Users</h2>
    <ul>
      <li v-for="user in users" :key="user.userID">
        {{ user.fullName }} ({{ user.email }})
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      users: []
    };
  },
  mounted() {
    fetch('http://localhost:3000/users') // backend endpoint
      .then(res => res.json())
      .then(data => this.users = data)
      .catch(err => console.error(err));
  }
};
</script>
