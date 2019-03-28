import Vue from 'vue'
import Router from 'vue-router'

// Containers
import Full from '@/containers/Full'

// Views
import Dashboard from '@/views/sample/Dashboard'

// Views - Pages
import Page404 from '@/views/pages/Page404'
import Page500 from '@/views/pages/Page500'
import Login from '@/views/pages/Login'
import Register from '@/views/pages/Register'

import store from '../store/index.js';
import router from '../router';

/*
This will check to see if the user is authenticated or not.
*/
function requireAuth (to, from, next) {
  if (window.localStorage.getItem('access_token')){
    // Verify the stored access token
    store.dispatch('user/getUser')
    store.watch(store.getters['user/getUser'], n => {
      if( store.get('user/loadStatus') == 2 ){
        next()
      }
    })
  } else {
    next('/login')
  }
}

function requireNonAuth (to, from, next) {
  if ( !window.localStorage.getItem('access_token') ){
    next()
  } else {
    router.go(-1)
  }
}

// Sample route
import sample from './sample'

Vue.use(Router)

export default new Router({
  mode           : 'history',
  linkActiveClass: 'open active',
  scrollBehavior : () => ({ y: 0 }),
  routes         : [
    {
      path     : '/',
      redirect : '/dashboard',
      name     : 'Home',
      component: Full,
      children : [
        {
          path     : 'dashboard',
          name     : 'Dashboard',
          component: Dashboard,
          beforeEnter: requireAuth
        },
        ...sample,
      ],
    },
    {
      path     : '/404',
      name     : 'Page404',
      component: Page404,
    },
    {
      path     : '/500',
      name     : 'Page500',
      component: Page500,
    },
    {
      path     : '/login',
      name     : 'Login',
      component: Login,
      beforeEnter: requireNonAuth
    },
    {
      path     : '/register',
      name     : 'Register',
      component: Register,
      beforeEnter: requireNonAuth
    },
    {
      path     : '/pages',
      redirect : '/pages/404',
      name     : 'Pages',
      component: { render (c) { return c('router-view') } },
      children : [
        {
          path     : '404',
          component: Page404,
        },
        {
          path     : '500',
          component: Page500,
        },
        {
          path     : 'login',
          component: Login,
        },
        {
          path     : 'register',
          component: Register,
        },
      ],
    },
    {
      path     : '*',
      name     : '404',
      component: Page404,
    },
  ],
})
