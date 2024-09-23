'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '../lib/contexts/DeepgramContext';
import { addDocument } from '../lib/firebase/firebaseUtils';
import { Mic, MicOff, Activity, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EditNoteModal from './EditNoteModal';
import { useAuth } from '../lib/hooks/useAuth';
import { useNotes } from '../lib/hooks/useNotes';
import { useLanguage, LanguageKey } from '../lib/contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh-CN', name: '简体中文' },
  { code: 'zh-TW', name: '繁体中文' },
];

const translations = {
  en: {
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    selectLanguage: "Select Language",
    editNote: "Edit Note",
    saveNote: "Save Note",
    discardNote: "Discard",
    processingAudio: "Processing audio...",
    errorSaving: "Error saving note. Please try again.",
    recording: "Recording...",
  },
  'zh-CN': {
    startRecording: "开始录音",
    stopRecording: "停止录音",
    selectLanguage: "选择语言",
    editNote: "编辑笔记",
    saveNote: "保存笔记",
    discardNote: "放弃",
    processingAudio: "正在处理音频...",
    errorSaving: "保存笔记时出错。请重试。",
    recording: "录音中...",
  },
  'zh-TW': {
    startRecording: "開始錄音",
    stopRecording: "停止錄音",
    selectLanguage: "選擇語言",
    editNote: "編輯筆記",
    saveNote: "保存筆記",
    discardNote: "放棄",
    processingAudio: "正在處理音頻...",
    errorSaving: "保存筆記時出錯。請重試。",
    recording: "錄音中...",
  },
};

export default function VoiceRecorder() {
  const { language } = useLanguage();
  const t = translations[language];

  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>(language);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const { connectToDeepgram, disconnectFromDeepgram, connectionState, realtimeTranscript } = useDeepgram();
  const { user } = useAuth();
  const { addNote } = useNotes();

  useEffect(() => {
    setTranscription(realtimeTranscript);
  }, [realtimeTranscript]);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  const handleStartRecording = async () => {
    setIsRecording(true);
    setTranscription('');
    await connectToDeepgram(selectedLanguage);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    disconnectFromDeepgram();
    setShowEditModal(true);
  };

  const handleSaveNote = async (text: string) => {
    if (user) {
      setIsProcessing(true);
      try {
        const newNote = {
          id: '',
          text: text,
          timestamp: new Date().toISOString(),
          userId: user.uid
        };

        const docRef = await addDocument('notes', newNote, user.uid);

        if (!docRef || !docRef.id) {
          throw new Error('Failed to get document reference ID');
        }

        newNote.id = docRef.id;
        addNote(newNote);
        setShowEditModal(false);
        setTranscription('');
        setError('');
      } catch (error) {
        console.error("Error saving note:", error);
        setError(t.errorSaving);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          className={`flex items-center justify-center p-4 rounded-full ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-bold transition-colors duration-300`}
        >
          {isRecording ? (
            <>
              <MicOff className="mr-2" />
              {t.stopRecording}
            </>
          ) : (
            <>
              <Mic className="mr-2" />
              {t.startRecording}
            </>
          )}
        </button>
        <div className="flex items-center">
          <Globe className="mr-2 text-gray-400" />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as LanguageKey)}
            className="bg-gray-800 text-white rounded p-2"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gray-800 p-4 rounded-lg shadow-lg"
          >
            <div className="flex items-center mb-2">
              <Activity className="text-green-500 mr-2" />
              <span className="text-white font-semibold">{t.recording}</span>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{transcription}</p>
          </motion.div>
        )}
      </AnimatePresence>
      {showEditModal && (
        <EditNoteModal
          initialText={transcription}
          onSave={handleSaveNote}
          onDiscard={() => setShowEditModal(false)}
        />
      )}
      {isProcessing && <p className="text-yellow-500 mt-2">{t.processingAudio}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}