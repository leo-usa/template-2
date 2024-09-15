'use client';

import { format } from 'date-fns';
import { useAuth } from '../lib/hooks/useAuth';
import { useNotes } from '../lib/hooks/useNotes';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
}

export default function NotesList() {
  const { user } = useAuth();
  const { notes } = useNotes();

  console.log("Rendering NotesList, notes:", notes); // Debug log

  if (!user) {
    return (
      <div className="w-full max-w-md mt-8 text-center">
        <p className="text-white">Please sign in to view your notes.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">Your Notes</h2>
      {notes.length === 0 ? (
        <p className="text-white text-center">You haven't created any notes yet.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note: Note) => (
            <li key={`${note.id}-${note.timestamp}`} className="bg-gray-800 shadow rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">
                {format(new Date(note.timestamp), 'MMMM d, yyyy h:mm a')}
              </p>
              <p className="text-white">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}