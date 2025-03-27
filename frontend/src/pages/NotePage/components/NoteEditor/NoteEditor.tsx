import React from 'react';
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
  isLoading?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSave,
  isLoading = false 
}) => {
  const [title, setTitle] = React.useState(note.name);
  const [description, setDescription] = React.useState(note.description || '');
  const [isDirty, setIsDirty] = React.useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave({
      ...note,
      name: title,
      description
    });
    setIsDirty(false);
  };

  // Auto-resize textarea as content grows
  React.useEffect(() => {
    const textarea = document.getElementById('note-description') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [description]);

  return (
    <div className={styles.editor}>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
      />
      <textarea
        id="note-description"
        value={description}
        onChange={handleDescriptionChange}
        className={styles.descriptionInput}
        placeholder="Start typing your note..."
        aria-label="Note description"
      />
      {isDirty && (
        <button 
          className={styles.saveButton}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save changes'}
        </button>
      )}
    </div>
  );
}; 