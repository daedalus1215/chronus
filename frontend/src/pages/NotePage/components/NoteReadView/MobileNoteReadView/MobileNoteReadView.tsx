import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './MobileNoteReadView.module.css';

type Note = {
  id: number;
  name: string;
  description?: string;
  userId: string;
  isMemo: boolean;
  createdAt?: string;
};

type NoteReadViewProps = {
  note: Note;
};

export const MobileNoteReadView: React.FC<NoteReadViewProps> = ({ note }) => {
  const hasContent = note.description && note.description.trim().length > 0;

  return (
    <div className={styles.readView}>
      {hasContent ? (
        <div className={styles.markdownContent}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {note.description || ''}
          </ReactMarkdown>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.emptyStateText}>
            No content yet. Click edit to start writing.
          </p>
        </div>
      )}
    </div>
  );
};
