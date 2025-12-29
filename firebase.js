// firebase.js
// Load Firebase compat modules from CDN in your HTML, not here.
// This file just initializes Firebase with your config.

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase (global firebase object comes from CDN scripts)
firebase.initializeApp(firebaseConfig);

// Export references
export const auth = firebase.auth();
export const db = firebase.firestore();