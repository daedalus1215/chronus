import React from 'react';
import {
  isValidTextForInsertion,
  insertTextAtCursorInTextarea,
  appendTextToEnd,
} from '../../../utils/textInsertion';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
};

type NoteContent = {
  description: string;
};

type UseNoteEditorProps = {
  note: Note;
  onSave: (note: Partial<Note>) => void;
};

type UseNoteEditorReturn = {
  content: NoteContent;
  handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  appendToDescription: (text: string) => void;
};

export const useNoteEditor = ({
  note,
  onSave,
}: UseNoteEditorProps): UseNoteEditorReturn => {
  const [content, setContent] = React.useState<NoteContent>({
    description: note.description || '',
  });
  const timeoutRef = React.useRef<number>();
  const contentRef = React.useRef(content);

  // Update contentRef when content changes
  React.useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const saveChanges = React.useCallback(() => {
    const currentContent = contentRef.current;
    onSave({ description: currentContent.description });
  }, [onSave]);

  const debouncedSave = React.useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(saveChanges, 1000);
  }, [saveChanges]);

  const handleContentChange = React.useCallback(
    (updates: Partial<NoteContent>) => {
      setContent(prev => ({ ...prev, ...updates }));
      debouncedSave();
    },
    [debouncedSave]
  );

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    handleContentChange({ description: e.target.value });
  };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
  React.useEffect(() => {
    const textarea = document.getElementById(
      'note-description'
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content.description]);

  const appendToDescription = React.useCallback(
    (text: string) => {
      console.log('appendToDescription called with:', text);
      
      // Validate text before processing
      if (!isValidTextForInsertion(text)) {
        console.debug('Skipping invalid text in appendToDescription:', text);
        return;
      }

      const currentDescription = contentRef.current.description || '';
      const TEXTAREA_ID = 'note-description';

      // Try to insert at cursor position (for speech-to-text at cursor location)
      const inserted = insertTextAtCursorInTextarea(
        TEXTAREA_ID,
        currentDescription,
        text,
        (newText) => {
          handleContentChange({ description: newText });
        }
      );

      // Fallback to append behavior if textarea not found
      if (!inserted) {
        console.warn('Textarea not found, falling back to append behavior');
        const newDescription = appendTextToEnd(currentDescription, text);
        handleContentChange({
          description: newDescription,
        });
      }
    },
    [handleContentChange]
  );

  return {
    content,
    handleDescriptionChange,
    appendToDescription,
  };
};
