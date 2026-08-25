// ==========================================
// CHEF APP - FIREBASE.JS
// ==========================================


/* =========================
   FIREBASE APP
========================= */

import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


/* =========================
   FIRESTORE
========================= */

import {

  getFirestore,

  collection,

  addDoc,

  getDocs,

  getDoc,

  setDoc,

  updateDoc,

  deleteDoc,

  doc,

  onSnapshot,

  query,

  orderBy,

  serverTimestamp

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyDi40oL-JtE9XF8CPGFHHLL6Hqe4p_GDA",

  authDomain:
    "restaurant-63230.firebaseapp.com",

  projectId:
    "restaurant-63230",

  storageBucket:
    "restaurant-63230.firebasestorage.app",

  messagingSenderId:
    "624519670365",

  appId:
    "1:624519670365:web:f23d10079a9adf2c51bbb4"

};


/* =========================
   INITIALIZE FIREBASE
========================= */

const app =
  initializeApp(
    firebaseConfig
  );


/* =========================
   FIRESTORE DATABASE
========================= */

const db =
  getFirestore(app);


/* =========================
   GLOBAL DATABASE
========================= */

window.db =
  db;


/* =========================
   GLOBAL FIREBASE FUNCTIONS
========================= */

window.fb = {

  collection,

  addDoc,

  getDocs,

  getDoc,

  setDoc,

  updateDoc,

  deleteDoc,

  doc,

  onSnapshot,

  query,

  orderBy,

  serverTimestamp

};


/* =========================
   CONNECTION CHECK
========================= */

console.log(
  "Chef Firebase Connected Successfully"
);
