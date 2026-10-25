import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAgImckC3OINwifYmwVckKB_584f5P1smU",
  authDomain: "nabough-educational-platform.firebaseapp.com",
  projectId: "nabough-educational-platform",
  storageBucket: "nabough-educational-platform.appspot.com",
  messagingSenderId: "960221317099",
  appId: "1:960221317099:web:ffc7161ad2a34ebcd1fbae",
  measurementId: "G-VHSV1CDTEH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
