const admin = require('firebase-admin');
const firebase =  require('firebase')
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  }
);

const firebaseConfig = {
    apiKey: "AIzaSyC2-ncQWL3XnA5xoEqmyw4JarLnvyCcyT4",
    authDomain: "opsc7312-98eec.firebaseapp.com",
    projectId: "opsc7312-98eec",
    storageBucket: "opsc7312-98eec.appspot.com",
    messagingSenderId: "878297246219",
    appId: "1:878297246219:web:92920a7b48ac845957b50e",
    measurementId: "G-H0MRF6N798"
  };

  firebase.initializeApp(firebaseConfig)

  const auth = firebase.auth();
  const db = firebase.firestore()
  
  const User = db.collection('Users')
  const Expense = db.collection('Expenses')
  const Category = db.collection('Categories')
  const Transaction = db.collection('Transactions')


  module.exports = { auth, admin, User, Expense, Category, db, Transaction };