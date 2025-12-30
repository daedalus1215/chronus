import React from 'react';
import { useNoteEditor } from '../hooks/useNoteEditor';
import styles from './MobileNoteEditor.module.css';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
};

type NoteEditorProps = {
  note: Note;
  onSave: (note: Partial<Note>) => void;
  onAppendToDescription?: (appendFn: (text: string) => void) => void;
};

export const MobileNoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onAppendToDescription,
}) => {
  const { content, handleDescriptionChange, appendToDescription } = useNoteEditor({
    note,
    onSave,
  });

  React.useEffect(() => {
    if (onAppendToDescription) {
      onAppendToDescription(appendToDescription);
    }
  }, [appendToDescription, onAppendToDescription]);

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
