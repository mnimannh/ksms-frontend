import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login.vue'; // Path to your Login.vue component

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
  },
  // The /register route has been removed for now.
  // {
  //   path: '/register',
  //   name: 'Register',
  //   component: Register,
  // },
];

const router = createRouter({
  history: createWebHistory(), // Uses HTML5 History API for clean URLs
  routes, // The array of route definitions
});

// Optional: Global Navigation Guards
// router.beforeEach((to, from, next) => {
//   next();
// });

export default router;
