import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react'; // Import Loader2 icon for the loading indicator

interface EditNoteModalProps {
  initialText: string;
  onSave: (text: string) => void;
  onDiscard: () => void;
}

export default function EditNoteModal({ initialText, onSave, onDiscard }: EditNoteModalProps) {
  const [text, setText] = useState(initialText);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAIRewrite = async () => {
    setIsRewriting(true);
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
      setIsRewriting(false);
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
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-white">Edit Your Note</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <div className="flex justify-between items-center space-x-2">
          <button
            onClick={handleAIRewrite}
            disabled={isRewriting}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center justify-center"
          >
            {isRewriting ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                Rewriting...
              </>
            ) : (
              'AI Rewrite'
            )}
          </button>
          <button
            onClick={onDiscard}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Discard
          </button>
          <button
            onClick={() => onSave(text)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}