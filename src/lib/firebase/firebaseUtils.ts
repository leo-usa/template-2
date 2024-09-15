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

// Add this interface at the top of the file
interface Note {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
  [key: string]: any; // This allows for any additional properties
}

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
  addDoc(collection(db, collectionName), { 
    ...data, 
    userId, 
    timestamp: new Date().toISOString()
  });

// Listen to notes
export const listenToNotes = (userId: string, callback: (notes: Note[]) => void) => {
  console.log("Setting up listener for user:", userId);
  const q = query(
    collection(db, 'notes'),
    where('userId', '==', userId),
    orderBy('timestamp', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    console.log("Snapshot received");
    const notes: Note[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Note));
    console.log("Processed notes:", notes);
    callback(notes);
  }, (error) => {
    console.error("Error fetching notes:", error);
    console.log("Falling back to unordered query.");
    const fallbackQuery = query(
      collection(db, 'notes'),
      where('userId', '==', userId)
    );
    onSnapshot(fallbackQuery, (fallbackSnapshot) => {
      const fallbackNotes: Note[] = fallbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Note));
      console.log("Fallback notes:", fallbackNotes);
      fallbackNotes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(fallbackNotes);
    }, (fallbackError) => {
      console.error("Fallback query error:", fallbackError);
      callback([]);
    });
  });
};

// Storage functions
export const uploadFile = async (file: File, path: string) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};
