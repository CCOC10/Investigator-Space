import { db } from '../firebase'
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'

const userDoc = (uid) => doc(db, 'workspaces', uid)

export const saveWorkspace = (uid, cases) =>
  setDoc(userDoc(uid), { cases, savedAt: Date.now() })

export const loadWorkspace = (uid) =>
  getDoc(userDoc(uid)).then((snap) => (snap.exists() ? snap.data() : null))

export const subscribeWorkspace = (uid, onData) =>
  onSnapshot(userDoc(uid), (snap) => {
    if (snap.exists()) onData(snap.data())
  })
