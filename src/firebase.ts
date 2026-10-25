import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBWRcxQweru-kkjtJur90e96lF6d35gmeU",
  authDomain: "nabough-platform.firebaseapp.com",
  projectId: "nabough-platform",
  storageBucket: "nabough-platform.firebasestorage.app",
  messagingSenderId: "637214267268",
  appId: "1:637214267268:web:1cdd063d1c0becc406efd1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
