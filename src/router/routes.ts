import TrackEditor from '@/screens/editor/TrackEditor.vue'
import Home from '@/screens/home/Home.vue'
import Index from '@/screens/Index.vue'
import Main from '@/layout/Main.vue'

export default () => {
  return [
    {
      path: '/',
      name: 'main',
      redirect: { path: '/index' },
      component: Main,
      children: [
        {
          path: '/index',
          name: 'index',
          meta: {
            requiresAuth: true
          },
          redirect: { path: '/home' },
          component: Index,
          children: [
            {
              path: '/home',
              name: 'home',
              meta: {
                requiresAuth: true,
                transition: ''
              },
              component: Home
            }
          ]
        }
      ]
    }
  ]
}