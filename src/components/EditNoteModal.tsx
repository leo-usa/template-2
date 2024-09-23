import { useState } from 'react';
import { Button } from './ui/button';
import { useLanguage } from '../lib/contexts/LanguageContext';

interface EditNoteModalProps {
  initialText: string;
  onSave: (text: string) => void;
  onDiscard: () => void;
}

const translations = {
  en: {
    editNote: "Edit Note",
    save: "Save",
    discard: "Discard",
    processing: "Processing...",
    aiRewrite: "AI Rewrite",
    translate: "Translate",
  },
  'zh-CN': {
    editNote: "编辑笔记",
    save: "保存",
    discard: "放弃",
    processing: "处理中...",
    aiRewrite: "AI重写",
    translate: "翻译成英文",
  },
  'zh-TW': {
    editNote: "編輯筆記",
    save: "保存",
    discard: "放棄",
    processing: "處理中...",
    aiRewrite: "AI重寫",
    translate: "翻譯成英文",
  },
};

export default function EditNoteModal({ initialText, onSave, onDiscard }: EditNoteModalProps) {
  const [text, setText] = useState(initialText);
  const [isProcessing, setIsProcessing] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-white">{t.editNote}</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-64 p-2 mb-4 bg-gray-700 text-white rounded"
        />
        <div className="flex justify-between">
          <div>
            <Button onClick={handleAIRewrite} className="mr-2 bg-purple-500 hover:bg-purple-600" disabled={isProcessing}>
              {t.aiRewrite}
            </Button>
            <Button onClick={handleTranslate} className="bg-green-500 hover:bg-green-600" disabled={isProcessing}>
              {t.translate}
            </Button>
          </div>
          <div>
            <Button onClick={() => onSave(text)} className="mr-2 bg-blue-500 hover:bg-blue-600" disabled={isProcessing}>
              {isProcessing ? t.processing : t.save}
            </Button>
            <Button onClick={onDiscard} variant="outline" className="bg-red-500 hover:bg-red-600" disabled={isProcessing}>
              {t.discard}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}