'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../lib/hooks/useAuth';
import { useNotes } from '../lib/hooks/useNotes';
import EditNoteModal from './EditNoteModal';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { addDocument } from '../lib/firebase/firebaseUtils';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
}

export default function NotesList() {
  const { user } = useAuth();
  const { notes, addNote } = useNotes();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState(''); // Add this line

  useEffect(() => {
    if (selectAll) {
      setSelectedNotes(notes.map(note => note.id));
    } else {
      setSelectedNotes([]);
    }
  }, [selectAll, notes]);

  const handleNoteSelect = (noteId: string) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) ? prev.filter(id => id !== noteId) : [...prev, noteId]
    );
  };

  const handleSummarize = async () => {
    setIsProcessing(true);
    const notesToSummarize = selectedNotes.length > 0 
      ? notes.filter(note => selectedNotes.includes(note.id))
      : [notes[0]];

    const notesText = notesToSummarize.map(note => note.text).join('\n\n');

    try {
      const response = await fetch('/api/openai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: notesText }),
      });

      if (!response.ok) {
        throw new Error('Failed to summarize notes');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let summary = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        summary += chunk;
      }

      setSummaryText(summary.trim());
      setShowEditModal(true);
    } catch (error) {
      console.error('Error summarizing notes:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSummary = async (text: string) => {
    if (user) {
      try {
        console.log("Attempting to save summary...");
        const newNote = {
          id: '',
          text: text,
          timestamp: new Date().toISOString(),
          userId: user.uid
        };
        console.log("New note object:", newNote);

        // Check if addDocument is defined
        if (typeof addDocument !== 'function') {
          throw new Error('addDocument is not a function');
        }

        const docRef = await addDocument('notes', newNote, user.uid);
        console.log("Document added, reference:", docRef);

        if (!docRef || !docRef.id) {
          throw new Error('Failed to get document reference ID');
        }

        newNote.id = docRef.id;
        console.log("Updated note with ID:", newNote);

        addNote(newNote);
        setShowEditModal(false);
        setSummaryText('');
        setError(''); // Clear any previous errors
        console.log("Summary saved successfully");
      } catch (error) {
        console.error("Error saving summary note:", error);
        setError("Failed to save the summary. Please try again.");
      }
    } else {
      console.error("No user found when trying to save summary");
      setError("You must be logged in to save notes.");
    }
  };

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
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>} {/* Add this line to display errors */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onChange={(e) => setSelectAll(e.target.checked)}
          />
          <label htmlFor="select-all" className="ml-2 text-white">Select All</label>
        </div>
        <Button 
          onClick={handleSummarize} 
          disabled={isProcessing || (notes.length === 0)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isProcessing ? 'Processing...' : 'Summarize to Medical Note'}
        </Button>
      </div>
      {notes.length === 0 ? (
        <p>Couldn&apos;t load notes. Please try again.</p>
      ) : (
        <ul className="space-y-4">
          {notes.map((note: Note) => (
            <li key={`${note.id}-${note.timestamp}`} className="bg-gray-800 shadow rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Checkbox
                  id={`note-${note.id}`}
                  checked={selectedNotes.includes(note.id)}
                  onChange={() => handleNoteSelect(note.id)}
                />
                <label htmlFor={`note-${note.id}`} className="ml-2 text-sm text-gray-400">
                  {format(new Date(note.timestamp), 'MMMM d, yyyy h:mm a')}
                </label>
              </div>
              <p className="text-white whitespace-pre-line">{note.text}</p>
            </li>
          ))}
        </ul>
      )}
      {showEditModal && (
        <EditNoteModal
          initialText={summaryText}
          onSave={handleSaveSummary}
          onDiscard={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}