import VoiceRecorder from "@/components/VoiceRecorder";
import NotesList from "@/components/NotesList";
import AuthUI from "@/components/AuthUI";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 relative">
      <AuthUI />
      <h1 className="text-4xl font-bold mb-8">Dr. Pang&apos;s Voice Notes App</h1>
      <VoiceRecorder />
      <NotesList />
    </main>
  );
}
