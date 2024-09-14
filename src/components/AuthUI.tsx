'use client';

import { useAuth } from '../lib/hooks/useAuth';
import AuthPage from './AuthPage';

export default function AuthUI() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="absolute top-4 right-4">
      <div className="flex items-center space-x-4">
        <span className="text-white">{user.displayName || user.email}</span>
        <button
          onClick={signOut}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}