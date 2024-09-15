'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { Mic, MicOff, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditNoteModal from './EditNoteModal';
import { useAuth } from '../lib/hooks/useAuth';
import { useNotes } from '../lib/hooks/useNotes'; // We'll create this hook

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁体中文' },
];

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript } = useDeepgram();
  const { user } = useAuth();
  const { addNote } = useNotes(); // Use the new hook

  useEffect(() => {
    if (realtimeTranscript) {
      setCurrentTranscript(realtimeTranscript);
    }
  }, [realtimeTranscript]);

  const handleToggleRecording = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const handleStartRecording = async () => {
    setCurrentTranscript('');
    await connectToDeepgram(selectedLanguage);
    setIsRecording(true);
  };

  const handleStopRecording = async () => {
    disconnectFromDeepgram();
    setIsRecording(false);
    
    if (currentTranscript) {
      setShowEditModal(true);
    }
  };

  const handleSaveNote = async (text: string) => {
    if (user) {
      try {
        const newNote = {
          id: '', // This will be set by Firebase
          text: text,
          timestamp: new Date().toISOString(),
          userId: user.uid
        };
        const docRef = await addDocument('notes', newNote, user.uid);
        newNote.id = docRef.id; // Set the id from the newly created document
        addNote(newNote); // Update local state immediately
        setShowEditModal(false);
        setCurrentTranscript('');
      } catch (error) {
        console.error("Error saving note:", error);
        // Optionally, show an error message to the user
      }
    }
  };

  const handleDiscardNote = () => {
    setShowEditModal(false);
    setCurrentTranscript('');
  };

  return (
    <>
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-lg">
        {user ? (
          <>
            <div className="flex justify-center mb-4">
              <div className="relative">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="appearance-none bg-gray-700 text-white py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-gray-600"
                  disabled={isRecording}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                  <Globe className="h-4 w-4" />
                </div>
              </div>
            </div>
            <div className="flex justify-center mb-6">
              <motion.button
                onClick={handleToggleRecording}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isRecording ? 'bg-red-500' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                whileTap={{ scale: 0.95 }}
                animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                transition={isRecording ? { repeat: Infinity, duration: 1.5 } : {}}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </motion.button>
            </div>
            
            <div className="text-center mb-4 text-white">
              {isRecording ? (
                <div className="flex items-center justify-center space-x-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <span>Recording...</span>
                </div>
              ) : (
                <span>Press the microphone to start</span>
              )}
            </div>
            
            <div className="bg-gray-700 rounded p-4 h-48 overflow-auto">
              {currentTranscript ? (
                <p className="text-white">{currentTranscript}</p>
              ) : (
                <p className="text-gray-400 text-center">
                  Your transcription will appear here...
                </p>
              )}
            </div>
          </>
        ) : (
          <p className="text-white text-center">Please sign in to use the voice recorder.</p>
        )}
      </div>

      <AnimatePresence>
        {showEditModal && (
          <EditNoteModal
            initialText={currentTranscript}
            onSave={handleSaveNote}
            onDiscard={handleDiscardNote}
          />
        )}
      </AnimatePresence>
    </>
  );
}