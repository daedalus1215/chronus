import React from 'react';
import { Fab, CircularProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/useAuth';
import { NoteListView } from './components/NoteListView/NoteListView';
import { useCreateNote } from './hooks/useCreateNote';
import { CreateNoteMenu } from './components/CreateNoteMenu/CreateNoteMenu';
import { Header } from '../../components/Header/Header';
import { NOTE_TYPES } from '../../constant';
import { useLocation, useParams } from 'react-router-dom';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { createNote, isCreating } = useCreateNote();
  const [showMenu, setShowMenu] = React.useState(false);
  const location = useLocation();
  let noteType: 'memo' | 'checkList' | undefined;
  if (location.pathname === '/memos') noteType = 'memo';
  if (location.pathname === '/checklists') noteType = 'checkList';
  const { tagId } = useParams<{ tagId: string }>();

  if (!user) {
    return null;
  }

  const handleCreateNote = async (noteTypeParam: keyof typeof NOTE_TYPES) => {
    try {
      await createNote(noteTypeParam);
      setShowMenu(false);
    } catch {
      // Error is already handled in the hook
    }
  };

  return (
    <div className={styles.homePage}>
      <Header />
      <main className={styles.main}>
        <NoteListView type={noteType} tagId={tagId} />
      </main>
      <Fab 
        color="primary"
        aria-label="Create new note"
        onClick={() => setShowMenu(true)}
        disabled={isCreating}
        sx={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
        }}
      >
        {isCreating ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
      </Fab>
      {showMenu && (
        <CreateNoteMenu
          onSelect={handleCreateNote}
          onClose={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}; 