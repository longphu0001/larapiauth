import Vue from 'vue'
import Router from 'vue-router'

// Containers
import Full from '@/containers/Full'

// Tools
import Dashboard from '@/views/tools/Dashboard'
import Users from '@/views/tools/Users'

// Views - Pages
import Page404 from '@/views/pages/Page404'
import Page500 from '@/views/pages/Page500'
import Login from '@/views/pages/Login'
import Register from '@/views/pages/Register'
import ForgotPassword from '@/views/pages/ForgotPassword'

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
      if( store.get('user/userLoadStatus') == 2 ){
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
      path     : '/admin',
      redirect : '/admin/dashboard',
      name     : 'Home',
      component: Full,
      beforeEnter: requireAuth,
      children : [
        {
          path     : 'dashboard',
          name     : 'Dashboard',
          component: Dashboard,
        },
        {
          path     : 'users',
          name     : 'Users',
          component: Users,
        },
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
      path     : '/forgot-password',
      name     : 'ForgotPassword',
      component: ForgotPassword,
      beforeEnter: requireNonAuth
    },
    {
      path     : '*',
      name     : '404',
      component: Page404,
    },
  ],
})
