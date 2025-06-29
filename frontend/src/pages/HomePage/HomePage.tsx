import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { NoteListView } from './components/NoteListView/NoteListView';
import { useCreateNote } from './hooks/useCreateNote';
import { CreateNoteMenu } from './components/CreateNoteMenu/CreateNoteMenu';
import styles from './HomePage.module.css';
import { Header } from '../../components/Header/Header';
import { NOTE_TYPES } from '../../constant';
import { useLocation } from 'react-router-dom';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { createNote, isCreating } = useCreateNote();
  const [showMenu, setShowMenu] = React.useState(false);
  const location = useLocation();
  let noteType: 'memo' | 'checkList' | undefined;
  if (location.pathname === '/memos') noteType = 'memo';
  if (location.pathname === '/checklists') noteType = 'checkList';

  if (!user) {
    return null; // This shouldn't happen due to ProtectedRoute, but TypeScript needs it
  }

  const handleCreateNote = async (noteTypeParam: keyof typeof NOTE_TYPES) => {
    try {
      await createNote(noteTypeParam);
      setShowMenu(false);
    } catch {
      // Error is already handled in the hook
      // You might want to show a toast here
    }
  };

  return (
    <div className={styles.homePage}>
      <Header />
      <main className={styles.main}>
        <NoteListView type={noteType} />
      </main>
      <button 
        className={styles.fab} 
        aria-label="Create new note"
        onClick={() => setShowMenu(true)}
        disabled={isCreating}
      >
        {isCreating ? '...' : '+'}
      </button>
      {showMenu && (
        <CreateNoteMenu
          onSelect={handleCreateNote}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}; 