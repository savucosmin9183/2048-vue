import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyCa6Ky3UA4A9fW6IY6mePzWOysXZ1K9c1g",
  authDomain: "project-638744809026533914.firebaseapp.com",
  databaseURL: "https://project-638744809026533914.firebaseio.com",
  projectId: "project-638744809026533914",
  storageBucket: "project-638744809026533914.appspot.com",
  messagingSenderId: "1060452624467",
  appId: "1:1060452624467:web:089a49aacf5ca9cedffea6",
  measurementId: "G-F6ZLZMGT79"
};
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);

  export default firebaseApp.firestore()