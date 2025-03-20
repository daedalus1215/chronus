import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { NoteListView } from './components/NoteListView';

export const HomePage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        <button onClick={handleLogout} className="logout-button">
          Sign out
        </button>
      </header>
      <main>
        <NoteListView userId={user.id} />
      </main>
    </div>
  );
}; 