import React from 'react';
import { useNotes } from '../../../../hooks/useNotes';
import { NoteItem } from './NoteItem';

interface NoteListViewProps {
  userId: string;
}

export const NoteListView: React.FC<NoteListViewProps> = ({ userId }) => {
  const { notes, isLoading, error } = useNotes(userId);

  if (isLoading) {
    return <div className="note-list-loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="note-list-error">{error}</div>;
  }

  if (notes.length === 0) {
    return <div className="note-list-empty">No notes found</div>;
  }

  return (
    <div className="note-list">
      <h2>Your Notes</h2>
      <ul>
        {notes.map((note, index) => (
          <NoteItem key={index} note={note} />
        ))}
      </ul>
    </div>
  );
};
