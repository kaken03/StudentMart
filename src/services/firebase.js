import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyB-FspOJriVdJjIHVADtrPgQO4IjUirLPM",
  authDomain: "greennest-eco.firebaseapp.com",
  projectId: "greennest-eco",
  storageBucket: "greennest-eco.firebasestorage.app",
  messagingSenderId: "793338899659",
  appId: "1:793338899659:web:a0bb658ca6fcfc7a02bf4e"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
