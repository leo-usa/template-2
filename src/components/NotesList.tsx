'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { useNotes } from '../lib/hooks/useNotes';
import EditNoteModal from './EditNoteModal';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { useLanguage, LanguageKey } from '../lib/contexts/LanguageContext';

interface Note {
  id: string;
  text: string;
  timestamp: string;
  userId: string;
}

const translations = {
  en: {
    yourNotes: "Your Notes",
    selectAll: "Select All",
    summarize: "Summarize to Medical Note",
    processing: "Processing...",
    noNotes: "Couldn't load notes. Please try again.",
    signInToView: "Please sign in to view your notes.",
  },
  'zh-CN': {
    yourNotes: "您的笔记",
    selectAll: "全选",
    summarize: "总结为医疗笔记",
    processing: "处理中...",
    noNotes: "无法加载笔记。请重试。",
    signInToView: "请登录以查看您的笔记。",
  },
  'zh-TW': {
    yourNotes: "您的筆記",
    selectAll: "全選",
    summarize: "總結為醫療筆記",
    processing: "處理中...",
    noNotes: "無法加載筆記。請重試。",
    signInToView: "請登錄以查看您的筆記。",
  },
};

export default function NotesList() {
  const { language } = useLanguage();
  const t = translations[language];

  const { user } = useAuth();
  const { notes, addNote } = useNotes();
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language, options).format(date);
  };

  if (!user) {
    return (
      <div className="w-full max-w-md mt-8 text-center">
        <p className="text-white">{t.signInToView}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-white">{t.yourNotes}</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onChange={(e) => setSelectAll(e.target.checked)}
          />
          <label htmlFor="select-all" className="ml-2 text-white">{t.selectAll}</label>
        </div>
        <Button 
          onClick={handleSummarize} 
          disabled={isProcessing || (notes.length === 0)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          {isProcessing ? t.processing : t.summarize}
        </Button>
      </div>
      {notes.length === 0 ? (
        <p>{t.noNotes}</p>
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
                  {formatDate(note.timestamp)}
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