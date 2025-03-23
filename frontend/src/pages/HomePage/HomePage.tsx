import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { NoteListView } from './components/NoteListView';
import styles from './HomePage.module.css';

export function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but TypeScript needs it
  }

  return (
    <div className={styles.homePage}>
      <header className={styles.homeHeader}>
        <p className={styles.welcomeText}>Welcome, {user.username}!</p>
      </header>
      <main className={styles.main}>
        <NoteListView userId={user.id} />
      </main>
      <button className={styles.fab} aria-label="Create new note">
        +
      </button>
    </div>
  );
} 