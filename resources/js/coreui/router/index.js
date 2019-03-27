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

/*
This will check to see if the user is authenticated or not.
*/
function requireAuth (to, from, next) {
    /*
    Determines where we should send the user.
    */
    function proceed () {
        /*
        If the user has been loaded determine where we should
        send the user.
        */
        if ( store.get('user/loadStatus') == 2 ){
            /*
            If the user is not empty, that means there's a user
            authenticated we allow them to continue. Otherwise, we
            send the user back to the home page.
            */
            if ( store.get('user/get') != '' ){
                next();
            } else {
                next('/login');
            }
        } else {
            next('/login');
        }
    }

    /*
    Confirms the user has been loaded
    */
    if ( store.get('user/loadStatus') != 2 ){
        /*
        If not, load the user
        */
        store.dispatch('user/getUser');

        /*
        Watch for the user to be loaded. When it's finished, then
        we proceed.
        */
        store.watch( store.get('user/loadStatus'), function(){
            if( store.get('user/loadStatus') == 2 ){
                proceed();
            }
        });
    } else {
        /*
        User call completed, so we proceed
        */
        proceed()
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
    },
    {
      path     : '/register',
      name     : 'Register',
      component: Register,
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
