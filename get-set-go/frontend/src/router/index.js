import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Tracker from '../views/Tracker.vue';
import Login from '../views/Login.vue';
import Reports from '../views/Reports.vue';
import Settings from '../views/Settings.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Tracker', component: Tracker, meta: { requiresAuth: true } },
  { path: '/reports', name: 'Reports', component: Reports, meta: { requiresAuth: true } },
  { path: '/settings', name: 'Settings', component: Settings, meta: { requiresAuth: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.token) {
    return { name: 'Login' };
  } else if (to.name === 'Login' && authStore.token) {
    return { name: 'Tracker' };
  }
});

export default router;
