import React from 'react';

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
    onSave({
      ...note,
      description: currentContent.description,
    });
  }, [note, onSave]);

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
      // Strict validation - only append valid, non-empty strings
      if (
        !text ||
        text === undefined ||
        text === null ||
        typeof text !== 'string' ||
        text.trim() === '' ||
        text === 'undefined' ||
        text === 'null'
      ) {
        console.debug('Skipping invalid text in appendToDescription:', text);
        return;
      }

      const textarea = document.getElementById(
        'note-description'
      ) as HTMLTextAreaElement;
      
      if (!textarea) {
        console.warn('Textarea not found, falling back to append behavior');
        const currentDescription = contentRef.current.description || '';
        const separator = currentDescription ? ' ' : '';
        const newDescription = `${currentDescription}${separator}${text.trim()}`;
        handleContentChange({
          description: newDescription,
        });
        return;
      }

      const currentDescription = contentRef.current.description || '';
      const cursorPosition = textarea.selectionStart;
      const textBeforeCursor = currentDescription.substring(0, cursorPosition);
      const textAfterCursor = currentDescription.substring(cursorPosition);
      
      // Add a space before the new text if there's text before the cursor and it doesn't end with a space
      const separator = textBeforeCursor && !textBeforeCursor.endsWith(' ') ? ' ' : '';
      const trimmedText = text.trim();
      const newDescription = `${textBeforeCursor}${separator}${trimmedText}${textAfterCursor}`;
      
      // Calculate new cursor position (after the inserted text)
      const newCursorPosition = cursorPosition + separator.length + trimmedText.length;
      
      console.log(
        `Inserting text at cursor position ${cursorPosition}. Current length: ${currentDescription.length}, New length: ${newDescription.length}`
      );
      
      handleContentChange({
        description: newDescription,
      });
      
      // Restore cursor position after React updates the DOM
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (textarea) {
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
          textarea.focus();
        }
      }, 0);
    },
    [handleContentChange]
  );

  return {
    content,
    handleDescriptionChange,
    appendToDescription,
  };
};
