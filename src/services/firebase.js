import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBIrTGDk84DC9FLXXBsm3qD88pey7cGNNw",
  authDomain: "studentmart-web.firebaseapp.com",
  projectId: "studentmart-web",
  storageBucket: "studentmart-web.firebasestorage.app",
  messagingSenderId: "1032686035225",
  appId: "1:1032686035225:web:071256d68b91fe0a56e588"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
