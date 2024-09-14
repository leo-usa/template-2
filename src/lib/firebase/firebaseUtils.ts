import { auth, db, storage } from "./firebase";
import {
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Auth functions
export const logoutUser = () => signOut(auth);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password);

// Firestore functions
export const addDocument = (collectionName: string, data: any, userId: string) =>
  addDoc(collection(db, collectionName), { ...data, userId });

// Listen to notes
export const listenToNotes = (userId: string | null, callback: (notes: any[]) => void) => {
  let q;
  if (userId) {
    q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );
  } else {
    q = query(collection(db, 'notes'), orderBy('timestamp', 'desc'));
  }

  return onSnapshot(q, (querySnapshot) => {
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notes);
  });
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
