// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCpxidfwW-pXYxBuGw_SLqWTEphEYn18Zg",
  authDomain: "hirify-94c4f.firebaseapp.com",
  projectId: "hirify-94c4f",
  storageBucket: "hirify-94c4f.appspot.com",
  messagingSenderId: "785640717974",
  appId: "1:785640717974:web:4c0212cb5c0d6ef1b10cb7",
  measurementId: "G-DXGVX6VPKQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
