import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      name: 'Ecommerce',
      component: () => import('../views/Ecommerce.vue'),
      meta: {
        title: 'SFC System',
      },
    },
    {
      path: '/calendar',
      name: 'Calendar',
      component: () => import('../views/Others/Calendar.vue'),
      meta: {
        title: 'Calendar',
      },
    },
    {
      path: '/cnc',
      name: 'CNC Tables',
      component: () => import('../views/Tables/CNCTables.vue'),
      meta: {
        title: 'CNC Tables',
      },
    },
    {
      path: '/mo-rework',
      // name: 'CNC Tables',
      component: () => import('../views/Tables/MO_REWORK.vue'),
      meta: {
        title: 'MO REWORK',
      },
    },
    // {
    //   path: '/SFC/barcode/history',
    //   name: 'SN履歷',
    //   component: () => import('../views/Tables/WipTrackingT.vue'),
    //   meta: {
    //     title: 'SN履歷',
    //   },
    // },
    {
      path: '/templates',
      name: 'TEMPLATES',
      component: () => import('../views/Tables/BasicTables.vue'),
      meta: {
        title: 'CNC Tables',
      },
    },
    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Signin',
      },
    },
    // {
    //   path: '/signup',
    //   name: 'Signup',
    //   component: () => import('../views/Auth/Signup.vue'),
    //   meta: {
    //     title: 'Signup',
    //   },
    // },
  ],
})

export default router

router.beforeEach((to, from, next) => {
  document.title = `Vue.js ${to.meta.title}`
  next()
})
