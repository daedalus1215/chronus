import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { NoteListView } from './components/NoteListView/NoteListView';
import styles from './HomePage.module.css';

export const HomePage:React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but TypeScript needs it
  }

  return (
    <div className={styles.homePage}>
      <main className={styles.main}>
        <NoteListView userId={user.id} />
      </main>
      <button className={styles.fab} aria-label="Create new note">
        +
      </button>
    </div>
  );
} 