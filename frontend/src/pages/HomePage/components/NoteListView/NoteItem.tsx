import React from 'react';

interface Note {
  name: string;
  userId: string;
  isMemo: boolean;
}

interface NoteItemProps {
  note: Note;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note }) => {
  return (
    <li className={`note-list-item ${note.isMemo ? 'memo' : 'note'}`}>
      <div className="note-name">{note.name}</div>
      <div className="note-type">{note.isMemo ? 'Memo' : 'Note'}</div>
    </li>
  );
};
