// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";


// ✅ Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBhOAW3M36yjOj6ta3MF99nKW_QFN1XCIQ",
  authDomain: "leishstudio9577.firebaseapp.com",
  projectId: "leishstudio9577",
  storageBucket: "leishstudio9577.firebasestorage.app",
  messagingSenderId: "643573756654",
  appId: "1:643573756654:web:674a0489e1f705537df9ff",
  measurementId: "G-XY1Z425CK0"
};


// Initialize Firebase once
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
