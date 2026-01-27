import { createRouter, createWebHistory } from 'vue-router';

// Auth
import Login from '../views/login.vue';

// Admin views
import AdminDashboard from '../views/admin/adminDashboard.vue';
import AdminPOS from '../views/admin/adminPOS.vue';
import InventoryManagement from '../views/admin/inventoryManagement.vue';
import AdminPayroll from '../views/admin/payrollManagement.vue';
import ShiftAssignment from '../views/admin/shiftAssignment.vue';

// Staff views
import StaffDashboard from '../views/staff/staffDashboard.vue';
import StaffPOS from '../views/staff/staffPOS.vue';
import StaffPayroll from '../views/staff/payrollManagement.vue';
import ShiftViewing from '../views/staff/shiftViewing.vue';

// -----------------------------
// Helper: decode user from JWT
// -----------------------------
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

// -----------------------------
// Routes
// -----------------------------
const routes = [
  // Login
  {
    path: '/',
    name: 'Login',
    component: Login,
  },

  // ================= ADMIN =================
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/pos',
    name: 'AdminPOS',
    component: AdminPOS,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/inventory',
    name: 'InventoryManagement',
    component: InventoryManagement,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/payroll',
    name: 'AdminPayroll',
    component: AdminPayroll,
    meta: { requiresAuth: true, role: 'admin' },
  },
  {
    path: '/admin/shift-assignment',
    name: 'ShiftAssignment',
    component: ShiftAssignment,
    meta: { requiresAuth: true, role: 'admin' },
  },

  // ================= STAFF =================
  {
    path: '/staff/dashboard',
    name: 'StaffDashboard',
    component: StaffDashboard,
    meta: { requiresAuth: true, role: 'staff' },
  },
  {
    path: '/staff/pos',
    name: 'StaffPOS',
    component: StaffPOS,
    meta: { requiresAuth: true, role: 'staff' },
  },
  {
    path: '/staff/payroll',
    name: 'StaffPayroll',
    component: StaffPayroll,
    meta: { requiresAuth: true, role: 'staff' },
  },
  {
    path: '/staff/shifts',
    name: 'ShiftViewing',
    component: ShiftViewing,
    meta: { requiresAuth: true, role: 'staff' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// -----------------------------
// Global Route Guard
// -----------------------------
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const user = getUserFromToken();

    if (!user) {
      console.log('Access Denied: No token');
      return next({ name: 'Login' });
    }

    if (to.meta.role && user.role !== to.meta.role) {
      console.log('Access Denied: Wrong role');
      return next({ name: 'Login' });
    }
  }

  next();
});

export default router;
