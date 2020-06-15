<template>
  <div class="welcome">
    <div class="container">
      <p class="maintitle">2048</p>
      <p class="subtitle">multiplayer</p>
      <p class="input_label">Enter your name:</p>
      <input type="text" class="input" v-model="name">
      <p v-if="feedback" class="feedback">{{ feedback }}</p>
      <button @click.prevent="join_game" class="join">Join Game!</button>
    </div>
  </div>
</template>

<script>
import db from '@/firebase/init'

export default {
  name: 'Welcome',
  data () {
    return {
      name: null,
      feedback: null
    }
  },
  methods: {
    join_game(){
      if(this.name){
       db.collection('online-users').doc(this.name).set({});
        this.$router.push({ name: 'Game', params: { name: this.name } })
      }else{
        this.feedback = 'You must enter a name to join'
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

.welcome{
  display: flex;
  justify-content: center;
}

.container{
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.container .maintitle{
  font-family: sans-serif;
  font-size: 100px;
  font-weight: 900;
  color: #776e65;
  margin-bottom: 0;
}
.container .subtitle{
  font-family: sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #776e65;
  margin-top: 0;
}

.container .input_label{
  font-family: sans-serif;
  font-size: 40px;
  color: #776e65;
  margin-top: 80px;
  margin-bottom: 20px;
}

.container .input{
  height: 35px;
  width: 200px;
  color: #776e65;
  font-family: sans-serif;
  font-size: 25px;
  margin-bottom: 20px;
}

.container .join{
  background-color: #776e65;
  color: white;
  display: block;
  font-size: 15px;
  width: 100px;
  height: 40px;
  cursor: pointer;
}
.container .feedback{
  color: red;
  font-family: sans-serif;
  font-size: 15px;
}


</style>
