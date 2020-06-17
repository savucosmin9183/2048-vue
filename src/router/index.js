import Vue from 'vue'
import Router from 'vue-router'
import Welcome from '@/components/Welcome'
import GameMulti from '@/components/Game_multi'
import GameSingle from '@/components/Game_single'

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
      path: '/game-multi',
      name: 'GameMulti',
      component: GameMulti,
      props: true,
      beforeEnter: (to, from, next) => {
        if(to.params.name){
          next();
        }
        else{
          next({name: 'Welcome'})
        }
      }
    },
    {
      path: '/game-single',
      name: 'GameSingle',
      component: GameSingle,
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
