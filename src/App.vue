<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import db from '@/firebase/init'
export default {
  name: 'App',
  watch:{
    $route (to, from){
        if(from.name == 'GameMulti' && to.name == 'Welcome'){
          console.log(from);
          let name = from.params.name;
          db.collection('online-users').doc(name).delete();
        }
      }
    }
}

</script>

<style>
html, body {
  margin: 0;
}

#app {
  width: 100%;
  height: 100%;
  background-color: #e2dddd;
}

html{
  height: 100%;
}

body{
  height: 100%;
}
</style>
