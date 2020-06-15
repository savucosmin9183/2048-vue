import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

var firebaseConfig = {
  apiKey: "AIzaSyC_1wuYL4V9VB3u6tPgvixBOGjmy8a47_c",
  authDomain: "real-adbc0.firebaseapp.com",
  databaseURL: "https://real-adbc0.firebaseio.com",
  projectId: "real-adbc0",
  storageBucket: "real-adbc0.appspot.com",
  messagingSenderId: "843097405861",
  appId: "1:843097405861:web:ef962754ffce8d52ddd04c",
  measurementId: "G-HK60GFE22N"
};
  // Initialize Firebase
  const firebaseApp = firebase.initializeApp(firebaseConfig);

  export default firebaseApp.firestore()