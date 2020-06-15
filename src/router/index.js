import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/components/Welcome'
import Game from '@/components/Game'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Welcome',
      component: Welcome
    },
    {
      path: '/game',
      name: 'Game',
      component: Game,
      props: true,
      beforeEnter: (to, from, next) => {
        if(to.params.name){
          next();
        }
        else{
          next({name: 'Welcome'})
        }
      }
    }
  ]
})
