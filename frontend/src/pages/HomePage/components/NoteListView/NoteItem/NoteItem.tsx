import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NoteItem.module.css';

interface Note {
  id: number;
  name: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
}

interface NoteItemProps {
  note: Note;
}

export const NoteItem:React.FC<NoteItemProps> = ({ note }) => {
  const navigate = useNavigate();
  const timeAgo = note.createdAt ? '39m' : ''; // This should be calculated from note.createdAt

  const handleClick = () => {
    navigate(`/notes/${note.id}`);
  };

  return (
    <div 
      className={`${styles.noteListItem} ${note.isMemo ? styles.memo : styles.note}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div>
        <div className={styles.noteName}>{note.name}</div>
        <div className={styles.noteTime}>{timeAgo}</div>
      </div>
      <div className={styles.noteActions}>
        <div className={styles.noteType}>
          {note.isMemo ? 'Memo' : 'Note'}
        </div>
        <button 
          className={styles.actionButton} 
          aria-label="More options"
          onClick={(e) => {
            e.stopPropagation();
            // Handle more options click
          }}
        >
          •••
        </button>
      </div>
    </div>
  );
}
