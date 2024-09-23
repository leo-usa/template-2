'use client';

import VoiceRecorder from "@/components/VoiceRecorder";
import NotesList from "@/components/NotesList";
import AuthUI from "@/components/AuthUI";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";

export default function Home() {
  return (
    <LanguageProvider>
      <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 relative">
        <AuthUI />
        <h1 className="text-4xl font-bold mb-2">Mind Memo</h1>
        <p className="text-sm text-gray-400 mb-8 text-center">
          Developed by Elynn Pang and <a href="https://DrPang.AI" className="underline hover:text-gray-300">DrPang.AI</a>, <br />
          Sponsored by <a href="https://www.nacef.org" className="underline hover:text-gray-300">NACEF</a>
        </p>
        <VoiceRecorder />
        <NotesList />
      </main>
    </LanguageProvider>
  );
}
