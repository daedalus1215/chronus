import React from 'react';
import { useNoteEditor } from '../hooks/useNoteEditor';
import styles from './DesktopNoteEditor.module.css';

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

export const DesktopNoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onAppendToDescription,
}) => {
  // Log immediately on render - this should always show
  console.log('🖊️🖊️🖊️ DesktopNoteEditor: Component rendering', {
    noteId: note?.id,
    hasOnAppendToDescription: !!onAppendToDescription,
    onAppendToDescriptionType: typeof onAppendToDescription,
  });

  const { content, handleDescriptionChange, appendToDescription } = useNoteEditor({
    note,
    onSave,
  });

  // Log when appendToDescription is available
  React.useEffect(() => {
    console.log('🖊️ DesktopNoteEditor: appendToDescription available', {
      hasAppendToDescription: !!appendToDescription,
      appendToDescriptionType: typeof appendToDescription,
    });
  }, [appendToDescription]);

  // Set the callback immediately when both are available
  React.useEffect(() => {
    console.log('🖊️ DesktopNoteEditor: useEffect running', {
      hasOnAppendToDescription: !!onAppendToDescription,
      hasAppendToDescription: !!appendToDescription,
      appendToDescriptionType: typeof appendToDescription,
      onAppendToDescriptionType: typeof onAppendToDescription,
    });
    
    if (!onAppendToDescription) {
      console.error('❌❌❌ DesktopNoteEditor: onAppendToDescription is NOT PROVIDED!');
      console.error('This means the prop is not being passed from NotePage');
      return;
    }
    
    if (!appendToDescription) {
      console.warn('⚠️ DesktopNoteEditor: appendToDescription is not available yet, will retry');
      return;
    }
    
    console.log('✅✅✅ DesktopNoteEditor: Setting appendToDescription callback NOW');
    console.log('appendToDescription function preview:', appendToDescription.toString().substring(0, 200));
    try {
      // Call it immediately
      onAppendToDescription(appendToDescription);
      console.log('✅✅✅ DesktopNoteEditor: appendToDescription callback set successfully!');
      console.log('✅✅✅ This should trigger NotePage to update appendToDescriptionFn state');
    } catch (err) {
      console.error('❌ DesktopNoteEditor: Error setting callback:', err);
      console.error('Error stack:', err instanceof Error ? err.stack : 'No stack');
    }
  }, [appendToDescription, onAppendToDescription]);
  
  // Also try to set it on mount if available - use a ref to track if we've set it
  const hasSetCallbackRef = React.useRef(false);
  
  React.useEffect(() => {
    if (onAppendToDescription && appendToDescription && !hasSetCallbackRef.current) {
      console.log('🔄 DesktopNoteEditor: Mount effect - setting callback');
      onAppendToDescription(appendToDescription);
      hasSetCallbackRef.current = true;
    }
  }, [onAppendToDescription, appendToDescription]);

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
