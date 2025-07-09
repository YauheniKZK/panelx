import { createRouter, createWebHistory } from 'vue-router';
import getRoutes from '@/router/routes';

const router = createRouter({
  history: createWebHistory(),
  routes: getRoutes(),
});

// router.beforeEach(async (to) => {
//   if (
//     to.meta.requiresAuth &&
//     to.name !== 'start' &&
//     to.name !== 'login' &&
//     (!accessTokenGetters.value || accessTokenGetters.value === '')
//   ) {
//     return '/start';
//   }
//   if (!to.meta.requiresAuth && token) {
//     return '/';
//   }
//   return;
// });

export default router;
