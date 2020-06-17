<template>
  <div>
    <button @click="start_new_game(true, true)" class="new_game">New Game</button>
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
</template>

<script>
import db from "@/firebase/init";
export default {
  name: "GameGridMulti",
  props: ["name"],
  data() {
    return {
      table: [],
      copy_table: null,
      tiles: [],
      sync: true
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
                debugger
                was_merged[k] = true;
                let new_val = this.copy_table[i][k] * 2;
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


      if (my_move)
        db.collection("moves")
          .doc()
          .set({
            move: "left",
            author: this.name
          });
      else{
        let bool;
        db.collection('available').get().then(res => {
          res.forEach(doc => {
            bool = doc.data().value;
          })
        })
        setTimeout(() => {
          db.collection('available').doc('available').set({
            value: !bool
          })
        }, 240);
      }
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

      if (my_move)
        db.collection("moves")
          .doc()
          .set({
            move: "right",
            author: this.name
          });
      else{
        let bool;
        db.collection('available').get().then(res => {
          res.forEach(doc => {
            bool = doc.data().value;
          })
        })
        setTimeout(() => {
          db.collection('available').doc('available').set({
            value: !bool
          })
        }, 240);
      }
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

      if (my_move)
        db.collection("moves")
          .doc()
          .set({
            move: "up",
            author: this.name
          });
      else{
        let bool;
        db.collection('available').get().then(res => {
          res.forEach(doc => {
            bool = doc.data().value;
          })
        })
        setTimeout(() => {
          db.collection('available').doc('available').set({
            value: !bool
          })
        }, 240);
      }
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

      if (my_move)
        db.collection("moves")
          .doc()
          .set({
            move: "down",
            author: this.name
          });
      else{
        let bool;
        db.collection('available').get().then(res => {
          res.forEach(doc => {
            bool = doc.data().value;
          })
        })
        setTimeout(() => {
          db.collection('available').doc('available').set({
            value: !bool
          })
        }, 240);
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
        this.update_db();
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
        this.update_db();
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
        setTimeout(() => {
          this.update_db();
        }, 250);
      } else if (e.keyCode == 38 && this.sync) {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.up_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      } else if (e.keyCode == 39 && this.sync) {
        this.copy_table = JSON.parse(JSON.stringify(this.table));
        this.right_arrow(true);
        setTimeout(() => {
          this.update_db();
        }, 250);
      } else if (e.keyCode == 40 && this.sync) {
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
              delete: tile[2].delete
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

      if (my_move)
        db.collection("moves")
          .doc()
          .set({
            move: "new",
            author: this.name
          });
    }
  },
  created() {
    window.addEventListener("keydown", this.key_pressed);


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

    db.collection("tiles")
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.tiles.push([
            doc.data().valuex,
            doc.data().valuey,
            { delete: doc.data().delete }
          ]);
        });
      });

    var initial_state = true;
    db.collection("moves").onSnapshot(snapshot => {
      if (initial_state) {
        initial_state = false;
      } else {
        if (!snapshot.docChanges().empty) {
          snapshot.docChanges().forEach(change => {
            if (change.type == "added") {
              if (change.doc.data().author != this.name) {  
                if (change.doc.data().move == "left" && this.sync){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.left_arrow(false);
                } 
                if (change.doc.data().move == "right" && this.sync){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.right_arrow(false);
                } 
                if (change.doc.data().move == "up" && this.sync){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.up_arrow(false);
                } 
                if (change.doc.data().move == "down" && this.sync){
                  this.copy_table = JSON.parse(JSON.stringify(this.table));
                  this.down_arrow(false);
                } 
                if (change.doc.data().move == "new")
                  this.start_new_game(false, true);
              }
            }
          });
        }
      }
    });
    initial_state = true;
    db.collection("available").onSnapshot(snapshot => {
      if (initial_state) {
        initial_state = false;
      } else {
        if (!snapshot.docChanges().empty) {
          snapshot.docChanges().forEach(change => {
            if (change.type == "modified") {
              this.sync = true;
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
  position: absolute;
  left: calc(40% - 250px);
  top: calc(50% - 250px);
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
  position: absolute;
  right: 20%;
  top: 20%;
}
</style>