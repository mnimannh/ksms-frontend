import { createRouter, createWebHistory } from 'vue-router';
import Login from '../views/login.vue';
import AdminDashboard from '../views/adminDashboard.vue';
import StudentDashboard from '../views/studentDashboard.vue';

// Helper to get user role from token
const getUserFromToken = () => {
  const token = localStorage.getItem('userToken');
  if (!token) return null;

  try {
    // Decode JWT payload (without verifying signature)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (err) {
    return null;
  }
};

const routes = [
  { path: '/', name: 'Login', component: Login },
  {
    path: '/adminDashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/studentDashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
    meta: { requiresAuth: true, role: 'student' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = getUserFromToken();

    if (!user) {
      console.log('Access Denied: No token');
      return next({ name: 'Login' });
    }

    // Check role
    if (to.meta.role && to.meta.role !== user.role) {
      console.log('Access Denied: Wrong role');
      return next({ name: 'Login' });
    }

    next();
  } else {
    next();
  }
});

export default router;
