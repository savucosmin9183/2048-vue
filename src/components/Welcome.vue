<template>
  <div class="welcome">
    <div class="container">
      <p class="maintitle">2048</p>
      <div class="choose_mode">
        <div @click="single_click" :class="{'selected': singleplayer == true,
                                    'not_selected': singleplayer == false}">
          <p class="single"> Singleplayer </p>
        </div>
        <div @click="multi_click" :class="{'selected': multiplayer == true,
                                    'not_selected': multiplayer == false}">
          <p class="multi"> Multiplayer </p>
        </div>
      </div>
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
      feedback: null,
      singleplayer: true,
      multiplayer: false
    }
  },
  methods: {
    join_game(){
      if(this.name){
        if(this.multiplayer){
          db.collection('online-users').doc(this.name).set({});
          this.$router.push({ name: 'GameMulti', params: { name: this.name } })
        }
        else{
          this.$router.push({ name: 'GameSingle', params: { name: this.name } })
        }
      }else{
        this.feedback = 'You must enter a name to join'
      }
    },
    single_click(){
      this.singleplayer = true;
      this.multiplayer = false;
    },
    multi_click(){
      this.singleplayer = false;
      this.multiplayer = true;
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


.container .input_label{
  font-family: sans-serif;
  font-size: 40px;
  color: #776e65;
  margin-top: 40px;
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

.choose_mode{
  width: 300px;
  height: 150px;
  display: flex;
  flex-direction: row;
  margin-top: 40px;
  font-size: 25px;
}

.choose_mode .selected{
  width: 50%;
  height: 100%;
  background-color: #776e65;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 15px 6px -6px black;
}

.choose_mode .not_selected{
  width: 50%;
  height: 100%;
  background-color: white;
  color: #776e65;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor:pointer;
  }

</style>
