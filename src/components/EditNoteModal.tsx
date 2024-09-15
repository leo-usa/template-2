import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface EditNoteModalProps {
  initialText: string;
  onSave: (text: string) => void;
  onDiscard: () => void;
}

export default function EditNoteModal({ initialText, onSave, onDiscard }: EditNoteModalProps) {
  const [text, setText] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAIRewrite = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/openai/rewrite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rewrite text');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let rewrittenText = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        rewrittenText += chunk;
      }
      setText(rewrittenText.trim());
    } catch (error) {
      console.error('Error rewriting text:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranslate = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/openai/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to translate text');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let translatedText = '';
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        translatedText += chunk;
      }
      setText(translatedText.trim());
    } catch (error) {
      console.error('Error translating text:', error);
      // Optionally, show an error message to the user
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Edit Note</h2>
          <button onClick={onDiscard} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-48 p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <div className="flex justify-between">
          <div>
            <button
              onClick={handleAIRewrite}
              disabled={isProcessing}
              className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600 disabled:opacity-50"
            >
              AI Rewrite
            </button>
            <button
              onClick={handleTranslate}
              disabled={isProcessing}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
            >
              Translate
            </button>
          </div>
          <div>
            <button
              onClick={() => onSave(text)}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={onDiscard}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Discard
            </button>
          </div>
        </div>
        {isProcessing && (
          <div className="mt-4 text-center text-white">
            Processing...
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}