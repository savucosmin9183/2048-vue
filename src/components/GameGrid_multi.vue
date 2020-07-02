<template>
  <div class = "wrapper_multi">
      <div class="cont">
        <div class="container_multi">
            <div class="header_multi">
                <p class="title_multi">2048</p>
                <div class="score_multi">
                    <p class="title_score_multi">Score</p>
                    <p class="actual_score_multi">{{ score }}</p>
                </div>
                <button @click="start_new_game(true,true)" class="new_game_multi">New Game</button>
            </div>
            <div class="gamegrid" 
            v-touch:swipe.prevent="swipe_handler">
              <div v-for="index in 36" :key="index" class="square"></div>
              <div
                  v-for="(tile, index) in tiles"
                  :key="index + 40"
                  class="square"
                  :class="['tile' + table[tile[0]-1][tile[1]-1] ,'tile' + tile[0] + '_' + tile[1]]"
              >{{table[tile[0]-1][tile[1]-1]}}</div>
            <div v-if="sync" class="game_status">
              <p class="status">Game Status: </p> <div class="ready"/> <p class="status">Ready</p>
            </div>
            <div v-else class="game_status">
              <p class="status">Game Status: </p> <div class="waiting"/> <p class="status">Waiting</p>
            </div>
          </div>
        </div>
        <div class="chat_block">
          <div class="chat_title">
            <p>2048 chat</p>
          </div>
          <div class="msg_container">
            <div class="messages" v-chat-scroll>
              <ul class="msgs">
                <li class="message__item" v-for="message in messages" :key="message.id"
                :class="{'my_name_multi': message.name == name}">
                  <span class="name">{{message.name}}</span>
                  <span class="message">{{message.content}}</span>
                  <span class="timestamp">{{message.timestamp}}</span>
                </li>
              </ul>
            </div>
            <div class="online_users">
              <p class="title">Online players:</p>
              <div v-for="user in online_users" class="user__item">
                <div class="green_circle"></div>
                <p>{{user}}</p>
              </div>
            </div>
          </div>
          <input
          class="form_input"
          @keydown.enter="send_message"
          type="text"
          name="msg"
          v-model="new_msg"
          />
          <button @click="send_message" class="send_button">Send</button>
        </div>
      </div>
  </div>
</template>

<script>
import db from "@/firebase/init";
import moment from "moment";
export default {
  name: "GameGridMulti",
  props: ["name"],
  data() {
    return {
      table: [],
      copy_table: null,
      tiles: [],
      score: 0,
      messages: [],
      new_msg: null,
      online_users: [],
      sync: true
    };
  },
  methods: {
    exit(){
      db.collection('online-users').doc(this.name).delete();
    },
    set_sync(bool){
      localStorage.setItem('sync', bool);
      this.sync = bool;
      db.collection('sync').doc('sync').set({
        value: bool
      })
    },
    send_message() {
      if (this.new_msg) {
        db.collection("messages")
          .add({
            content: `: ${this.new_msg}`,
            name: this.name,
            timestamp: Date.now()
          })
          .catch(err => {
            console.log(err);
          });
        this.new_msg = null;

      }
    },
    swipe_handler(direction){
      if(direction == 'top'){
        this.up_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      }
      else if(direction == 'bottom'){
        this.down_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      }
      else if(direction == 'left'){
        this.left_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      }
      else if(direction == 'right'){
        this.right_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      }
        
    },

    left_arrow(my_move) {
      this.set_sync(false);
      let test_move = JSON.parse(JSON.stringify(this.copy_table));
      let k;
      for (let i = 0; i < 6; i++) {
        var was_merged = [false, false, false, false, false, false];
        for (let j = 1; j < 6; j++) {
          let last_move = JSON.parse(JSON.stringify(this.copy_table[i]));
          let ok = 0;
          if (this.copy_table[i][j] != 0) {
            for (k = j - 1; k >= 0; k--) {
              if (this.copy_table[i][k] != 0 || k == 0) {
                break;
              }
            }
            if (this.copy_table[i][k] == 0) {
              let val = this.copy_table[i][j];
              this.table[i][j] = 0;
              this.table[i][k] = val;
              this.copy_table[i][j] = 0;
              this.copy_table[i][k] = val;

              this.tiles.forEach(tile => {
                if (tile[0] == i + 1 && tile[1] == j + 1) {
                  this.$set(tile, 0, i + 1);
                  this.$set(tile, 1, k + 1);
                  tile[2] = { delete: false };
                }
              });
            } else if (this.copy_table[i][k] != 0) {
              if (
                this.copy_table[i][k] == this.copy_table[i][j] &&
                was_merged[k] == false
              )
                ok = 0;
              else ok = 1;
              if (this.copy_table[i][k] == this.copy_table[i][j] && ok == 0) {
                was_merged[k] = true;
                let new_val = this.copy_table[i][k] * 2;
                this.update_score(new_val, my_move);
                this.table[i][j] = 0;
                this.copy_table[i][j] = 0;
                this.copy_table[i][k] = new_val;
                this.set_delay(i, k, new_val);
                this.tiles.forEach(tile => {
                  if (tile[0] == i + 1 && tile[1] == j + 1) {
                    this.$set(tile, 0, i + 1);
                    this.$set(tile, 1, k + 1);
                    tile[2] = { delete: true };
                  }
                });
              } else {
                let val = this.copy_table[i][j];
                this.table[i][j] = 0;
                this.table[i][k + 1] = val;
                this.copy_table[i][j] = 0;
                this.copy_table[i][k + 1] = val;

                this.tiles.forEach(tile => {
                  if (tile[0] == i + 1 && tile[1] == j + 1) {
                    this.$set(tile, 0, i + 1);
                    this.$set(tile, 1, k + 2);
                    tile[2] = { delete: false };
                  }
                });
              }
            }
          }
        }
      }
      if(JSON.stringify(test_move) == JSON.stringify(this.copy_table)){
        this.set_sync(true);
        return;
      }  
      this.spawn_new_tile(my_move, false);


      if (my_move){
        db.collection("moves")
          .doc()
          .set({
            move: "left",
            author: this.name,
            time: Date.now()
          });
        db.collection("messages")
          .add({
            content: 'moved left',
            name: this.name,
            timestamp: Date.now()
          })
          .catch(err => {
            console.log(err);
          });
        let online_members = 0;
        db.collection('online-users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            online_members += 1;
          })
          if(online_members == 1){
            setTimeout(() => {
              this.set_sync(true);
            }, 250);
          }
        })
      }
      else{
        setTimeout(() => {
          this.set_sync(true);
        }, 250);
      }
    },
    right_arrow(my_move) {
      this.set_sync(false);
      let test_move = JSON.parse(JSON.stringify(this.copy_table));
      let k;
      //i is row index
      for (let i = 0; i < 6; i++) {
        var was_merged = [false, false, false, false, false, false];
        //j is column index, starts from 1 because first element cant be left shifted
        for (let j = 4; j >= 0; j--) {
          let ok = 0;
          //if we found an element that is not 0
          if (this.copy_table[i][j] != 0) {
            for (k = j + 1; k < 6; k++) {
              if (this.copy_table[i][k] != 0 || k == 5) {
                break;
              }
            }
            if (this.copy_table[i][k] == 0) {
              let val = this.table[i][j];
              this.table[i][j] = 0;
              this.table[i][k] = val;
              this.copy_table[i][j] = 0;
              this.copy_table[i][k] = val;

              this.tiles.forEach(tile => {
                if (tile[0] == i + 1 && tile[1] == j + 1) {
                  this.$set(tile, 0, i + 1);
                  this.$set(tile, 1, k + 1);
                  tile[2] = { delete: false };
                }
              });
            } else if (this.copy_table[i][k] != 0) {
              if (
                this.copy_table[i][k] == this.copy_table[i][j] &&
                was_merged[k] == false
              )
                ok = 0;
              else ok = 1;
              if (this.copy_table[i][k] == this.copy_table[i][j] && ok == 0) {
                was_merged[k] = true;
                let new_val = this.copy_table[i][k] * 2;
                this.update_score(new_val, my_move);
                this.table[i][j] = 0;
                this.copy_table[i][j] = 0;
                this.copy_table[i][k] = new_val;
                this.set_delay(i, k, new_val);
                this.tiles.forEach(tile => {
                  if (tile[0] == i + 1 && tile[1] == j + 1) {
                    this.$set(tile, 0, i + 1);
                    this.$set(tile, 1, k + 1);
                    tile[2] = { delete: true };
                  }
                });
              } else {
                let val = this.copy_table[i][j];
                this.table[i][j] = 0;this.copy_table = JSON.parse(JSON.stringify(this.table));
                this.table[i][k - 1] = val;
                this.copy_table[i][j] = 0;
                this.copy_table[i][k - 1] = val;

                this.tiles.forEach(tile => {
                  if (tile[0] == i + 1 && tile[1] == j + 1) {
                    this.$set(tile, 0, i + 1);
                    this.$set(tile, 1, k);
                    tile[2] = { delete: false };
                  }
                });
              }
            }
          }
        }
      }
      if(JSON.stringify(test_move) == JSON.stringify(this.copy_table)){
        this.set_sync(true);
        return;
      }  
      this.spawn_new_tile(my_move, false);

      if (my_move){
        db.collection("moves")
          .doc()
          .set({
            move: "right",
            author: this.name,
            time: Date.now()
          });
        db.collection("messages")
          .add({
            content: 'moved right',
            name: this.name,
            timestamp: Date.now()
          })
          .catch(err => {
            console.log(err);
          });
        let online_members = 0;
        db.collection('online-users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            online_members += 1;
          })
          if(online_members == 1){
            setTimeout(() => {
              this.set_sync(true);
            }, 250);
          }
        })
      }
      else{
        setTimeout(() => {
              this.set_sync(true);
            }, 250);
      }
    },
    up_arrow(my_move) {
      this.set_sync(false);
      let test_move = JSON.parse(JSON.stringify(this.copy_table));
      let made_move = 0;
      let k;
      for (let i = 0; i < 6; i++) {
        var was_merged = [false, false, false, false, false, false];
        for (let j = 1; j < 6; j++) {
          let ok = 0;
          if (this.copy_table[j][i] != 0) {
            for (k = j - 1; k >= 0; k--) {
              if (this.copy_table[k][i] != 0 || k == 0) {
                break;
              }
            }
            if (this.copy_table[k][i] == 0) {
              let val = this.copy_table[j][i];
              this.table[j][i] = 0;
              this.table[k][i] = val;
              this.copy_table[j][i] = 0;
              this.copy_table[k][i] = val;

              this.tiles.forEach(tile => {
                if (tile[0] == j + 1 && tile[1] == i + 1) {
                  this.$set(tile, 0, k + 1);
                  this.$set(tile, 1, i + 1);
                  tile[2] = { delete: false };
                }
              });
            } else if (this.copy_table[k][i] != 0) {
              if (
                this.copy_table[k][i] == this.copy_table[j][i] &&
                was_merged[k] == false
              )
                ok = 0;
              else ok = 1;
              if (this.copy_table[k][i] == this.copy_table[j][i] && ok == 0) {
                was_merged[k] = true;
                let new_val = this.copy_table[k][i] * 2;
                this.update_score(new_val, my_move);
                this.table[j][i] = 0;
                this.copy_table[j][i] = 0;
                this.copy_table[k][i] = new_val;
                this.set_delay(k, i, new_val);
                this.tiles.forEach(tile => {
                  if (tile[0] == j + 1 && tile[1] == i + 1) {
                    this.$set(tile, 0, k + 1);
                    this.$set(tile, 1, i + 1);
                    tile[2] = { delete: true };
                  }
                });
              } else {
                let val = this.copy_table[j][i];
                this.table[j][i] = 0;
                this.table[k + 1][i] = val;
                this.copy_table[j][i] = 0;
                this.copy_table[k + 1][i] = val;

                this.tiles.forEach(tile => {
                  if (tile[0] == j + 1 && tile[1] == i + 1) {
                    this.$set(tile, 0, k + 2);
                    this.$set(tile, 1, i + 1);
                    tile[2] = { delete: false };
                  }
                });
              }
            }
          }
        }
      }
      if(JSON.stringify(test_move) == JSON.stringify(this.copy_table)){
        this.set_sync(true);
        return;
      }  
        
      this.spawn_new_tile(my_move, false);

      if (my_move){
        db.collection("moves")
          .doc()
          .set({
            move: "up",
            author: this.name,
            time: Date.now()
          });
        db.collection("messages")
          .add({
            content: 'moved up',
            name: this.name,
            timestamp: Date.now()
          })
          .catch(err => {
            console.log(err);
          });
        let online_members = 0;
        db.collection('online-users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            online_members += 1;
          })
          if(online_members == 1){
            setTimeout(() => {
              this.set_sync(true);
            }, 250);
          }
        })
      }
      else{
        setTimeout(() => {
              this.set_sync(true);
            }, 250);
      }
    },
    down_arrow(my_move) {
      this.set_sync(false);
      let test_move = JSON.parse(JSON.stringify(this.copy_table));
      let made_move = 0;
      let k;
      for (let i = 0; i < 6; i++) {
        var was_merged = [false, false, false, false, false, false];
        for (let j = 4; j >= 0; j--) {
          let ok = 0;
          if (this.copy_table[j][i] != 0) {
            for (k = j + 1; k < 6; k++) {
              if (this.copy_table[k][i] != 0 || k == 5) {
                break;
              }
            }
            if (this.copy_table[k][i] == 0) {
              let val = this.copy_table[j][i];
              this.table[j][i] = 0;
              this.table[k][i] = val;
              this.copy_table[j][i] = 0;
              this.copy_table[k][i] = val;

              this.tiles.forEach(tile => {
                if (tile[0] == j + 1 && tile[1] == i + 1) {
                  this.$set(tile, 0, k + 1);
                  this.$set(tile, 1, i + 1);
                  tile[2] = { delete: false };
                }
              });
              made_move = 1;
            } else if (this.copy_table[k][i] != 0) {
              if (
                this.copy_table[k][i] == this.copy_table[j][i] &&
                was_merged[k] == false
              )
                ok = 0;
              else ok = 1;
              if (this.copy_table[k][i] == this.copy_table[j][i] && ok == 0) {
                was_merged[k] = true;
                let new_val = this.copy_table[k][i] * 2;
                this.update_score(new_val, my_move);
                this.table[j][i] = 0;
                this.copy_table[j][i] = 0;
                this.copy_table[k][i] = new_val;
                this.set_delay(k, i, new_val);
                this.tiles.forEach(tile => {
                  if (tile[0] == j + 1 && tile[1] == i + 1) {
                    this.$set(tile, 0, k + 1);
                    this.$set(tile, 1, i + 1);
                    tile[2] = { delete: true };
                  }
                });
                made_move = 1;
              } else {
                let val = this.copy_table[j][i];
                this.table[j][i] = 0;
                this.table[k - 1][i] = val;
                this.copy_table[j][i] = 0;
                this.copy_table[k - 1][i] = val;

                this.tiles.forEach(tile => {
                  if (tile[0] == j + 1 && tile[1] == i + 1) {
                    this.$set(tile, 0, k);
                    this.$set(tile, 1, i + 1);
                    tile[2] = { delete: false };
                  }
                });
                made_move = 1;
              }
            }
          }
        }
      }

      if(JSON.stringify(test_move) == JSON.stringify(this.copy_table)){
        this.set_sync(true);
        return;
      }  
      
      this.spawn_new_tile(my_move, false);

      if (my_move){
        db.collection("moves")
          .doc()
          .set({
            move: "down",
            author: this.name,
            time: Date.now()
          });
        db.collection("messages")
          .add({
            content: 'moved down',
            name: this.name,
            timestamp: Date.now()
          })
          .catch(err => {
            console.log(err);
          });
        let online_members = 0;
        db.collection('online-users').get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            online_members += 1;
          })
          if(online_members == 1){
            setTimeout(() => {
              this.set_sync(true);
            }, 250);
          }
        })
      }
      else{
        setTimeout(() => {
              this.set_sync(true);
            }, 250);
      }
    },
    update_score(new_val, my_move){
        if(my_move){
            this.score += new_val;
            db.collection('score').doc('score').set({
              value: this.score
            })
        }
    },
    set_delay(i, k, new_val) {
      setTimeout(() => {
        this.tiles.forEach(tile => {
          if (tile[0] == i + 1 && tile[1] == k + 1 && tile[2].delete == false) {
            this.$set(tile, 0, 7);
            this.$set(tile, 1, 0);
          }
          this.table[i][k] = new_val;
        });
      }, 240);
    },
    spawn_new_tile(my_move, new_game) {
      if (my_move && !new_game) {
        let a, b;
        a = Math.floor(Math.random() * 6);
        b = Math.floor(Math.random() * 6);

        while (this.copy_table[a][b] != 0) {
          a = Math.floor(Math.random() * 6);
          b = Math.floor(Math.random() * 6);
        }
        setTimeout(() => {
          this.tiles.push([a + 1, b + 1, { delete: false }]);
          this.table[a][b] = 2;
        }, 240);
        this.copy_table[a][b] = 2;
        localStorage.setItem("a", a);
        localStorage.setItem("b", b);
      } else if (!my_move && !new_game) {
        let a = parseInt(localStorage.getItem("a"));
        let b = parseInt(localStorage.getItem("b"));
        setTimeout(() => {
          this.tiles.push([a + 1, b + 1, { delete: false }]);
          this.table[a][b] = 2;
        }, 240);
        this.copy_table[a][b] = 2;
      } else if (my_move && new_game) {
        let a, b, c, d;
        a = Math.floor(Math.random() * 6);
        b = Math.floor(Math.random() * 6);
        c = Math.floor(Math.random() * 6);
        d = Math.floor(Math.random() * 6);

        while (a == c && b == d) {
          a = Math.floor(Math.random() * 6);
          b = Math.floor(Math.random() * 6);
        }
        setTimeout(() => {
          this.tiles.push([a + 1, b + 1, { delete: false }]);
          this.table[a][b] = 2;
        }, 240);
        this.copy_table[a][b] = 2;
        localStorage.setItem("a", a);
        localStorage.setItem("b", b);
        setTimeout(() => {
          this.tiles.push([c + 1, d + 1, { delete: false }]);
          this.table[c][d] = 2;
        }, 240);
        this.copy_table[c][d] = 2;
        localStorage.setItem("c", c);
        localStorage.setItem("d", d);
      } else {
        let a = parseInt(localStorage.getItem("a"));
        let b = parseInt(localStorage.getItem("b"));
        setTimeout(() => {
          this.tiles.push([a + 1, b + 1, { delete: false }]);
          this.table[a][b] = 2;
        }, 240);
        this.copy_table[a][b] = 2;
        let c = parseInt(localStorage.getItem("c"));
        let d = parseInt(localStorage.getItem("d"));
        setTimeout(() => {
          this.tiles.push([c + 1, d + 1, { delete: false }]);
          this.table[c][d] = 2;
        }, 240);
        this.copy_table[c][d] = 2;
      }
    },
    key_pressed(e) {
      let sync = localStorage.getItem('sync')
      if (e.keyCode == 37 && sync == 'true') {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.left_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      } else if (e.keyCode == 38 && sync == 'true') {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.up_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      } else if (e.keyCode == 39 && sync == 'true') {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.right_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      } else if (e.keyCode == 40 && sync == 'true') {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.down_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      }
    },
    update_db() {
      let ref = db.collection("table");

      for (let i = 0; i < 6; i++) {
        ref.doc("line" + (i + 1)).set({
          values: this.copy_table[i]
        });
      }
      db.collection("tiles")
        .get()
        .then(res => {
          res.forEach(element => {
            element.ref.delete();
          });
          let ref2 = db.collection("tiles");
          this.tiles.forEach(tile => {
            ref2.doc("tile" + tile[0] + "_" + tile[1]).set({
              valuex: tile[0],
              valuey: tile[1],
              deletez: tile[2].delete
            });
          });
        });
    },
    start_new_game(my_move, new_game) {
      this.table = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0]
      ];
      this.copy_table = JSON.parse(JSON.stringify(this.table));
      let ref = db.collection("tiles");
      this.tiles.forEach(tile => {
        ref.doc("tile" + tile[0] + "_" + tile[1]).delete();
      });
      this.tiles = [];
      this.spawn_new_tile(my_move, new_game);
      setTimeout(() => {
          this.update_db();
        }, 250);

      db.collection('score').doc('score').set({
        value: 0
      })

      if (my_move){
        db.collection("moves")
          .doc()
          .set({
            move: "new",
            author: this.name,
            time: Date.now()
          });
        db.collection("messages")
          .add({
            content: 'started a new game',
            name: this.name,
            timestamp: Date.now()
          })
          .catch(err => {
            console.log(err);
          });
      }
        
    }
  },
  created() {
    window.addEventListener("keydown", this.key_pressed);
    window.addEventListener('beforeunload', this.exit);
    window.addEventListener('popstate', this.exit);
    this.set_sync(true);


    db.collection("table")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          let line = [];
          for (let i = 0; i < 6; i++) {
            line[i] = doc.data().values[i];
          }
          this.table.push(line);
        });
        this.table.push([0]);
        this.copy_table = JSON.parse(JSON.stringify(this.table));
      });

    db.collection('tiles')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        this.tiles.push([
          doc.data().valuex,
          doc.data().valuey,
          {
            delete: doc.data().deletez
          }
        ])
      })
    })
    
    db.collection('score').get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        this.score = doc.data().value
      })
    })

    db.collection('moves').get()
    .then(snapshot => {
      snapshot.forEach(doc => {

      })
    })

    var initial_state = true;
    var time_now = Date.now();
    db.collection("moves").onSnapshot(snapshot => {
      if (initial_state) {
        initial_state = false;
      } else {
        if (!snapshot.docChanges().empty) {
          snapshot.docChanges().forEach(change => {
            if (change.type == "added" && change.doc.data().time > time_now) {
              if (change.doc.data().author != this.name) {  
                if (change.doc.data().move == "left"){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.left_arrow(false);
                } 
                if (change.doc.data().move == "right"){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.right_arrow(false);
                } 
                if (change.doc.data().move == "up"){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.up_arrow(false);
                } 
                if (change.doc.data().move == "down"){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.down_arrow(false);
                } 
                if (change.doc.data().move == "new"){
                  this.start_new_game(false, true);
                }
              }
            }
          });
        }
      }
    });

    db.collection('online-users')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach(change => {
                if(change.type == 'added'){
                    this.online_users.push(change.doc.id)
                }
                if(change.type == 'removed'){
                    this.online_users = this.online_users.filter(user => {
                        return user != change.doc.id;
                    })
                }
            })    
        })


    initial_state = true;
    db.collection('score').onSnapshot(snapshot => {
      if(initial_state){
        initial_state = false;
      }
      else{
        if(!snapshot.docChanges().empty){
          snapshot.docChanges().forEach(change => {
            if(change.type == "modified"){
              this.score = change.doc.data().value
            }
          })
        }
      }
    })

    initial_state = true;
    db.collection('sync').onSnapshot(snapshot => {
      if(initial_state){
        initial_state = false;
      }
      else{
        if(!snapshot.docChanges().empty){
          snapshot.docChanges().forEach(change => {
            if(change.type == "modified"){
              this.sync = change.doc.data().value;
            }
          })
        }
      }
    })

    let ref = db.collection("messages").orderBy("timestamp");
        ref.onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type == "added") {
              let doc = change.doc;
              this.messages.push({
                id: doc.id,
                name: doc.data().name,
                content: doc.data().content,
                timestamp: moment(doc.data().timestamp).format("LT")
              });
            }
          });
        });
  },
  beforeDestroy(){
    window.removeEventListener("keydown", this.key_pressed);
    window.removeEventListener('beforeunload', this.exit)
    window.removeEventListener('popstate', this.exit)
  }
};
</script>

<style>
@import "../styles/tiles.css";
@import "../styles/tiles_mobile.css";
@import "../styles/chat_style.css";

.gamegrid {
  width: 480px;
  height: 480px;
  background-color: #776e65;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  padding-left: 10px;
  padding-bottom: 10px;
}


.square {
  width: 70px;
  height: 70px;
  margin-top: 10px;
  margin-right: 10px;
  background-color: grey;
  color: whitesmoke;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 55px;
  font-weight: bold;
  box-shadow: 0 0 30px 10px rgba(243, 215, 116, 0),
    inset 0 0 0 1px rgba(255, 255, 255, 0);
  transition: 0.25s ease-out;
}

.wrapper_multi{
  height: 100%;
  width: 100%;
}

.new_game_multi {
  height: 40px;
  width: 110px;
  background-color: #776e65;
  color: #e2dddd;
  border-radius: 5px;
  padding: 0 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
}

.container_multi{
    width: 500px;
    height: 650px;
    margin-top: 50px;
}



.score_multi{
    width: 80px;
    height: 60px;
    background-color: #776e65;
    border-radius: 5px;
    display:flex;
    flex-direction: column;
    align-items: center;
}

.score_multi .title_score_multi{
    margin: 0;
    color: #e2dddd;
    font-size: 22px;
    font-weight: 600;
}

.score_multi .actual_score_multi{
    color: white;
    font-size: 25px;
    font-weight: 500;
    margin: 0;
}


.header_multi{
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: space-around;
}
.header_multi .title_multi{
  font-family: sans-serif;
  font-size: 70px;
  font-weight: 900;
  color: #776e65;
  margin: 0;
}

.cont{
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.my_name_multi{
  color: #f2b179;
  font-weight: 700;
}

@media only screen and (max-width: 1130px){

html{
  height: 1300px;
}

.cont{
  flex-direction: column;
}

.chat_block{
  margin:0;
  
}


@media only screen and (max-width: 600px){

  html{
  height: 1100px;
}

.msg_container{
  width:90vw;
}

.send_button{
  margin-left: calc(50% - 40px);
  margin-top: 15px;
}

.messages{
  width: 70%;
}
.online_users{
  width: 30%;
}

.form_input{
  width: 100%;
}

  .gamegrid {
  width: 300px;
  height: 300px;
  padding-left: 5px;
  padding-bottom: 5px;
}


  .square {
  width: 45px;
  height: 45px;
  margin-top: 5px;
  margin-right: 5px;
  font-size: 40px;
  box-shadow: 0 0 15px 10px rgba(243, 215, 116, 0),
    inset 0 0 0 1px rgba(255, 255, 255, 0);
}
.cont{
  justify-content: flex-start;
}

.container_multi{
    width: 310px;
    height: 500px;
    margin-top: 50px;
    
}
.container_multi .header_multi{
  margin-bottom: 10px;
  height: 60px;
}

.header_multi .title_multi{
  font-size: 40px;
}

.score_multi{
    width: 80px;
    height: 45px;
    background-color: #776e65;
    border-radius: 5px;
    display:flex;
    flex-direction: column;
    align-items: center;
}

.score_multi .title_score_multi{
    margin: 0;
    color: #e2dddd;
    font-size: 18px;
    font-weight: 600;
}

.score_multi .actual_score_multi{
    color: white;
    font-size: 22px;
    font-weight: 500;
    margin: 0;
}

}
}
</style>