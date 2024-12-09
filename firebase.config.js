import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyDzXWlkPtV1OyiSoHoTxhTCy8S8c-xZau0",
	authDomain: "logi-chat-3638c.firebaseapp.com",
	databaseURL: "https://logi-chat-3638c-default-rtdb.firebaseio.com",
	projectId: "logi-chat-3638c",
	storageBucket: "logi-chat-3638c.appspot.com",
	messagingSenderId: "1068546392819",
	appId: "1:1068546392819:web:adcc0fedb7ebdb93c02d86",
	measurementId: "G-7919RP571J"
  };

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
export { db, auth };
