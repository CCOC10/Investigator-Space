import { db } from '../firebase'
import {
  doc, setDoc, getDoc, updateDoc, deleteDoc,
  collection, getDocs, onSnapshot, query, orderBy
} from 'firebase/firestore'
import { loadWorkspace } from './db'

const userRef = (uid) => doc(db, 'users', uid)

export const createUserProfile = (uid, data) =>
  setDoc(userRef(uid), {
    email: data.email || '',
    displayName: data.displayName || '',
    photoURL: data.photoURL || '',
    status: 'pending',
    isAdmin: false,
    createdAt: Date.now(),
  }, { merge: true })

export const getUserProfile = (uid) =>
  getDoc(userRef(uid)).then((snap) => snap.exists() ? { uid, ...snap.data() } : null)

export const subscribeUserProfile = (uid, onChange) =>
  onSnapshot(userRef(uid), (snap) => onChange(snap.exists() ? { uid, ...snap.data() } : null))

export const updateUserStatus = (uid, status, byAdminUid) =>
  updateDoc(userRef(uid), { status, updatedAt: Date.now(), updatedBy: byAdminUid })

export const toggleAdmin = (uid, isAdmin) =>
  updateDoc(userRef(uid), { isAdmin })

export const subscribeAllUsers = (onChange) =>
  onSnapshot(
    query(collection(db, 'users'), orderBy('createdAt', 'desc')),
    (snap) => onChange(snap.docs.map((d) => ({ uid: d.id, ...d.data() })))
  )

export const deleteUserData = async (uid) => {
  await deleteDoc(userRef(uid))
  try { await deleteDoc(doc(db, 'workspaces', uid)) } catch (_) {}
}

export const getAllWorkspaces = () =>
  getDocs(collection(db, 'workspaces')).then((snap) =>
    snap.docs.map((d) => ({ uid: d.id, ...d.data() }))
  )
