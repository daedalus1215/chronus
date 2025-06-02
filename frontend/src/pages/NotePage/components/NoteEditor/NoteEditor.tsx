import React from 'react';
import { useNoteEditor } from './hooks/useNoteEditor';
import styles from './NoteEditor.module.css';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
}

type NoteEditorProps = {
  note: Note;
  onSave: (note: Partial<Note>) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSave
}) => {
  const { content, handleDescriptionChange } = useNoteEditor({
    note,
    onSave
  });

  return (
    <div className={styles.editor}>
      <textarea
        id="note-description"
        value={content.description}
        onChange={handleDescriptionChange}
        className={styles.descriptionInput}
        placeholder="Start typing your note..."
        aria-label="Note description"
      />
    </div>
  );
}; 