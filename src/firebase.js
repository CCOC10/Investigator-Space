import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBgiaP0nEdk0Ai_13cra0_oHOL2YmEoiIY",
  authDomain: "evidence-checklist-1d402.firebaseapp.com",
  projectId: "evidence-checklist-1d402",
  storageBucket: "evidence-checklist-1d402.firebasestorage.app",
  messagingSenderId: "298331541895",
  appId: "1:298331541895:web:0de7344848ea74ed9e4322",
  measurementId: "G-HZ88094N89",
}

export const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const auth = getAuth(firebaseApp)
