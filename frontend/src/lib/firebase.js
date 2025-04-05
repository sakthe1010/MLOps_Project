// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDMTbM73fjBKJejzvkrffNmbZM5WrwhyfY",
  authDomain: "mlops-a2d26.firebaseapp.com",
  projectId: "mlops-a2d26",
  storageBucket: "mlops-a2d26.firebasestorage.app",
  messagingSenderId: "1088832097160",
  appId: "1:1088832097160:web:586cd126093fa574f2083d",
  measurementId: "G-T4533VBCX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth};