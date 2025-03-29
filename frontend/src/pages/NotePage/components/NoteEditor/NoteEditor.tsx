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

type NoteContent = {
  title: string;
  description: string;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ 
  note, 
  onSave,
  isLoading = false 
}) => {
  const [content, setContent] = React.useState<NoteContent>({
    title: note.name,
    description: note.description || ''
  });
  const [isDirty, setIsDirty] = React.useState(false);
  const timeoutRef = React.useRef<number>();
  const contentRef = React.useRef(content);

  // Update contentRef when content changes
  React.useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const saveChanges = React.useCallback(() => {
    const currentContent = contentRef.current;
    onSave({
      ...note,
      name: currentContent.title,
      description: currentContent.description
    });
    setIsDirty(false);
  }, [note, onSave]);

  const debouncedSave = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(saveChanges, 1000);
  }, [saveChanges]);

  const handleContentChange = React.useCallback((updates: Partial<NoteContent>) => {
    setContent(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
    debouncedSave();
  }, [debouncedSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleContentChange({ title: e.target.value });
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleContentChange({ description: e.target.value });
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const textarea = document.getElementById('note-description') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content.description]);

  return (
    <div className={styles.editor}>
      <input
        type="text"
        value={content.title}
        onChange={handleTitleChange}
        className={styles.titleInput}
        placeholder="Note title"
        aria-label="Note title"
      />
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