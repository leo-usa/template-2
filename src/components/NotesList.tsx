'use client';

import { useState, useEffect } from 'react';
import { getDocuments, listenToNotes } from '../lib/firebase/firebaseUtils';
import { format } from 'date-fns';

interface Note {
  id: string;
  text: string;
  timestamp: string;
}

export default function NotesList() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const unsubscribe = listenToNotes((updatedNotes: Note[]) => {
      setNotes(updatedNotes);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Notes</h2>
      <ul className="space-y-4">
        {notes.map((note) => (
          <li key={note.id} className="bg-gray-800 shadow rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">
              {format(new Date(note.timestamp), 'MMMM d, yyyy h:mm a')}
            </p>
            <p className="text-white">{note.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}