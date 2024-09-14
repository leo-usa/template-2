'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { Mic, MicOff, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditNoteModal from './EditNoteModal';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript } = useDeepgram();

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
    await connectToDeepgram();
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
    await addDocument('notes', {
      text: text,
      timestamp: new Date().toISOString(),
    });
    setShowEditModal(false);
    setCurrentTranscript('');
  };

  const handleDiscardNote = () => {
    setShowEditModal(false);
    setCurrentTranscript('');
  };

  return (
    <>
      <div className="w-full max-w-md bg-gray-800 rounded-lg p-6 shadow-lg">
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