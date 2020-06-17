<template>
    <div>
        <div class="online_users">
            <p>Online users:</p>
            <p v-for="user in online_users">{{ user }}</p>
        </div>
        <GameGridMulti :name="name"/>
    </div>
</template>

<script>
import db from '@/firebase/init'
import GameGridMulti from './GameGrid_multi'

export default {
    name: 'GameMulti',
    props: ['name'],
    data() {
        return {
            online_users: []
        }
    },
    methods: {
        exit(){
            db.collection('online-users').doc(this.name).delete();
        }
    },
    created() {
        window.addEventListener('beforeunload', this.exit);
        window.addEventListener('popstate', this.exit);

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
    },
    beforeDestroy() {
        window.removeEventListener('beforeunload', this.exit)
        window.removeEventListener('popstate', this.exit)
    },
    components: {
        GameGridMulti
    }
}
</script>

<style>
   
   .online_users p{
       margin: 0;
}
</style>