import { useState, useEffect, useCallback } from 'react';
import { listenToNotes } from '../firebase/firebaseUtils';
import { useAuth } from './useAuth';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
}

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (user) {
      unsubscribe = listenToNotes(user.uid, (updatedNotes: Note[]) => {
        setNotes(updatedNotes);
      });
    } else {
      setNotes([]);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const addNote = useCallback((newNote: Note) => {
    setNotes(prevNotes => [newNote, ...prevNotes]);
  }, []);

  return { notes, addNote };
}