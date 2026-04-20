import { createRouter, createWebHistory } from 'vue-router';

// Auth
import Login from '../views/login.vue';

// Admin views
import AdminDashboard from '../views/admin/adminDashboard.vue';
import AdminPOS from '../views/admin/adminPOS.vue';
import AdminInventory from '../views/admin/adminInventory.vue';
import AdminPayroll from '../views/admin/adminPayroll.vue';
import AdminShift from '../views/admin/adminShift.vue';
import AdminAlarm from '../views/admin/adminAlarm.vue';
import adminInventoryReport from '../views/admin/adminInventoryReport.vue';
import adminShiftPayrollReport from '../views/admin/adminShiftPayrollReport.vue';
import adminUser from '../views/admin/adminUser.vue';

// Staff views
import StaffDashboard from '../views/staff/staffDashboard.vue';
import StaffPOS from '../views/staff/staffPOS.vue';
import StaffPayroll from '../views/staff/staffPayroll.vue';
import ShiftViewing from '../views/staff/staffShift.vue';
import AdminShiftPayrollReport from '../views/admin/adminShiftPayrollReport.vue';

// -----------------------------
// Helper: decode user from JWT
// -----------------------------
// Helper to get user role from token
const getUserFromToken = () => {
  const token = localStorage.getItem('userToken');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Reject if expired (exp is in seconds)
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      return null;
    }
    return payload;
  } catch {
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
  path: '/admin',
  redirect: '/admin/dashboard',
  meta: { requiresAuth: true, role: 'admin' },
},
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
  name: 'AdminInventory',
  component: AdminInventory,
  meta: { requiresAuth: true, role: 'admin' },
},
  {
    path: '/admin/payroll',
    name: 'AdminPayroll',
    component: AdminPayroll,
    meta: { requiresAuth: true, role: 'admin' },
  },
{
  path: '/admin/shift',
  name: 'AdminShift',
  component: AdminShift,
  meta: { requiresAuth: true, role: 'admin' },
},
  {
  path: '/admin/alarm',
  name: 'AdminAlarm',
  component: AdminAlarm,
  meta: { requiresAuth: true, role: 'admin' },
},
{
  path: '/admin/inventoryreport',
  name: 'AdminInventoryReport',
  component: adminInventoryReport,
  meta: { requiresAuth: true, role: 'admin' },
},

{
  path: '/admin/shiftpayrollreport',
  name: 'AdminShiftPayrollReport',
  component: AdminShiftPayrollReport,
  meta: { requiresAuth: true, role: 'admin' },
},

{
  path: '/admin/user',
  name: 'AdminUser',
  component: adminUser,
  meta: { requiresAuth: true, role: 'admin' },
},

  // ================= STAFF =================
  {
  path: '/staff',
  redirect: '/staff/dashboard',
  meta: { requiresAuth: true, role: 'staff' },
},
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

  { 
  path: '/inventory/barcodes', 
  name: 'BarcodeSheet',  
  component: () => import('@/views/BarcodeSheet.vue') 
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
