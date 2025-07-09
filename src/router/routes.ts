export default () => {
  return [
    {
      path: '/',
      name: 'main',
      redirect: { path: '/index' },
      component: () => import('../layout/Main.vue'),
      children: [
        {
          path: '/auth',
          name: 'auth',
          meta: {
            requiresAuth: false
          },
          component: () => import('../screens/login/Start.vue')
        },
        {
          path: '/index',
          name: 'index',
          meta: {
            requiresAuth: true
          },
          redirect: { path: '/home' },
          component: () => import('../screens/Index.vue'),
          children: [
            {
              path: '/home',
              name: 'home',
              meta: {
                requiresAuth: true,
                transition: ''
              },
              component: () => import('../screens/home/Home.vue')
            },
          ]
        }
      ]
    }
  ]
}