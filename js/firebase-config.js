// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getDatabase, ref as dbRef, set, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbNa5ID6uB-yWPE1HXPL6b2fS7Bkxa1qo",
  authDomain: "planetcare-6460f.firebaseapp.com",
  databaseURL: "https://planetcare-6460f-default-rtdb.firebaseio.com",
  projectId: "planetcare-6460f",
  storageBucket: "planetcare-6460f.firebasestorage.app",
  messagingSenderId: "744773599560",
  appId: "1:744773599560:web:2d5d2ae016a2996ead337d"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const rtdb = getDatabase(firebaseApp);

export { firebaseApp, auth, db, rtdb, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, doc, setDoc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, deleteDoc, serverTimestamp, dbRef, set, onValue };
