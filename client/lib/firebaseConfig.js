// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDfpTA2iVzhrtDkBXLUyfyh5V73dE88kOA",
    authDomain: "ecom-d0c7c.firebaseapp.com",
    projectId: "ecom-d0c7c",
    storageBucket: "ecom-d0c7c.firebasestorage.app",
    messagingSenderId: "876219140012",
    appId: "1:876219140012:web:a8c44565401be09cae5c09",
    measurementId: "G-4V7EPZ07S7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const auth = getAuth(app);

export { app, analytics, auth };