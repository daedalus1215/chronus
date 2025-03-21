import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { NoteListView } from './components/NoteListView';

export const HomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but TypeScript needs it
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <div>
          <h1>Chronus Notes</h1>
          <p className="welcome-text">Welcome, {user.username}!</p>
        </div>
      </header>
      <main>
        <NoteListView userId={user.id} />
      </main>
    </div>
  );
}; 