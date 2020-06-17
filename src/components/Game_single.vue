<template>
    <div class = "wrapper">
        <div class="container">
            <div class="header">
                <p class="title">2048</p>
                <div class="score">
                    <p class="title_score">Score</p>
                    <p class="actual_score">{{ score }}</p>
                </div>
                <button @click="start_new_game(true,true)" class="new_game">New Game</button>
            </div>
            <div class="gamegrid">
            <div v-for="index in 36" :key="index" class="square"></div>
            <div
                v-for="(tile, index) in tiles"
                :key="index + 40"
                class="square"
                :class="['tile' + table[tile[0]-1][tile[1]-1] ,'tile' + tile[0] + '_' + tile[1]]"
            >{{table[tile[0]-1][tile[1]-1]}}</div>
            </div>
        </div>
        <div class="hall_of_fame">
            <p class = 'title'>Hall of fame</p>
            <p v-for="(item, index) in hall_of_fame" v-if="item.score > 0 && index < 10" class="hall_item"
            :class="{'my_name': item.name == name}">
            {{index+1}}. {{item.name}}      {{item.score}}
            </p>
        </div>
    </div>
</template>

<script>
import db from "@/firebase/init";
export default {
  name: "GameSingle",
  props: ["name"],
  data() {
    return {
      table: [],
      copy_table: null,
      tiles: [],
      sync: true,
      score: 0,
      hall_of_fame: []
    };
  },
  methods: {
    left_arrow(my_move) {
      this.sync = false;
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
                this.update_score(new_val);
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
      if(JSON.stringify(test_move) != JSON.stringify(this.copy_table))
        this.spawn_new_tile(my_move, false);
      setTimeout(() => {
        this.sync = true;
      }, 240);
    },
    right_arrow(my_move) {
      this.sync = false;
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
                this.update_score(new_val);
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
      if(JSON.stringify(test_move) != JSON.stringify(this.copy_table))
        this.spawn_new_tile(my_move, false);
      setTimeout(() => {
        this.sync = true;
      }, 240);
    },
    up_arrow(my_move) {
      this.sync = false;
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
                this.update_score(new_val);
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
      if(JSON.stringify(test_move) != JSON.stringify(this.copy_table))
        this.spawn_new_tile(my_move, false);
      setTimeout(() => {
        this.sync = true;
      }, 240);
    },
    down_arrow(my_move) {
      this.sync = false;
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
                this.update_score(new_val);
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

      if(JSON.stringify(test_move) != JSON.stringify(this.copy_table))
        this.spawn_new_tile(my_move, false);
      setTimeout(() => {
        this.sync = true;
      }, 240);
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
    update_score(new_val){
        this.score = this.score + new_val;
        let hallref = db.collection('hall-of-fame');
        hallref.doc(this.name).get()
        .then(doc => {
            if(doc.data().score < this.score){
                hallref.doc(this.name).set({
                    score: this.score
                })
            }
        })
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
        this.tiles.push([a + 1, b + 1, { delete: false }]);
        this.table[a][b] = 2;
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
      if (e.keyCode == 37 && this.sync) {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.left_arrow(true);
      } else if (e.keyCode == 38 && this.sync) {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.up_arrow(true);
      } else if (e.keyCode == 39 && this.sync) {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.right_arrow(true);
      } else if (e.keyCode == 40 && this.sync) {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.down_arrow(true);
      }
    },
    start_new_game(my_move, new_game) {
      this.score = 0;
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

      this.tiles = [];
      this.spawn_new_tile(my_move, new_game);
    },

  },
  created() {
    window.addEventListener("keydown", this.key_pressed);
    this.start_new_game(true,true);

    let hallref = db.collection('hall-of-fame');
    hallref.doc(this.name).get()
    .then(doc => {
        if(!doc.exists)
            hallref.doc(this.name).set({
                score: 0
            })
    })
    setTimeout(() => {
        db.collection('hall-of-fame').orderBy('score').get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                this.hall_of_fame.unshift({name: doc.id, score: doc.data().score});
            })
        })
    }, 100);

    var initial_state = true;
    db.collection("hall-of-fame").onSnapshot(snapshot => {
      if (initial_state) {
        initial_state = false;
      } else {
        if (!snapshot.docChanges().empty) {
          snapshot.docChanges().forEach(change => {
            if (change.type == "modified") {
              this.hall_of_fame.forEach(entry => {
                if(entry.name == change.doc.id)
                    entry.score = change.doc.data().score;
                
              })
              this.hall_of_fame.sort(function(a,b){
                  if(a.score < b.score) return 1;
                  if(a.score > b.score) return -1;
                  return 0;
              })
            }
          });
        }
      }
    });

    initial_state = true;
    db.collection("hall-of-fame").onSnapshot(snapshot => {
      if (initial_state) {
        initial_state = false;
      } else {
        if (!snapshot.docChanges().empty) {
          snapshot.docChanges().forEach(change => {
            if (change.type == "added") {
                if(this.name != change.doc.id)
                    this.hall_of_fame.unshift({name: change.doc.id}, {score: 0})
            }
          });
        }
      }
    });

  },
  beforeDestroy(){
    window.removeEventListener("keydown", this.key_pressed);
  }
};
</script>

<style>
@import "../styles/tiles.css";

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

.new_game {
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

.container{
    width: 500px;
    height: 650px;
    margin-top: 50px;
}

.hall_of_fame .hall_item.my_name{
    color: #f2b179;
    font-weight: 700;
}

.score{
    width: 80px;
    height: 60px;
    background-color: #776e65;
    border-radius: 5px;
    display:flex;
    flex-direction: column;
    align-items: center;
}

.score .title_score{
    margin: 0;
    color: #e2dddd;
    font-size: 22px;
    font-weight: 600;
}

.score .actual_score{
    color: white;
    font-size: 25px;
    font-weight: 500;
    margin: 0;
}

.hall_of_fame{
    background-color: #776e65;
    height: 400px;
    width: 300px;
    margin-left: 50px;
    margin-top: 120px;
    box-shadow: inset 0 3px 6px rgba(0,0,0,0.45), 0 4px 6px rgba(0,0,0,0.45);
    border-radius: 10px;

}

.hall_of_fame .title{
    color: #ede0c8;
    font-size: 30px;
    font-weight: 900;
    margin-left: 70px;
    margin-bottom: 5px;
    margin-top: 15px;

}
.hall_of_fame .hall_item{
    color: #e2dddd;
    margin-left: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    font-size: 20px;
}

.header{
    display: flex;
    flex-direction: row;
    width: 100%;
    align-items: center;
    justify-content: space-around;
}
.header .title{
  font-family: sans-serif;
  font-size: 70px;
  font-weight: 900;
  color: #776e65;
  margin: 0;
}

.wrapper{
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>