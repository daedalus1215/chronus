import React from 'react';
import { Folder, StickyNote, SquareCheck } from 'lucide-react';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import styles from './ExplorerTree.module.css';

type DragGhostRowProps = {
  id: string;
  folders: FolderDto[];
  notes: ExplorerNoteItem[];
};

export const DragGhostRow: React.FC<DragGhostRowProps> = ({
  id,
  folders,
  notes,
}) => {
  let name = '';
  let icon: React.ReactNode;

  if (id.startsWith('folder-')) {
    const folderId = parseInt(id.slice(7), 10);
    const folder = folders.find(f => f.id === folderId);
    name = folder?.name ?? '';
    icon = <Folder size={14} style={{ color: 'var(--color-text-secondary)' }} />;
  } else {
    const noteId = parseInt(id.slice(5), 10);
    const note = notes.find(n => n.id === noteId);
    name = note?.name ?? '';
    icon = note?.isMemo ? (
      <StickyNote size={13} style={{ color: 'var(--color-text-muted)' }} />
    ) : (
      <SquareCheck size={13} style={{ color: 'var(--color-text-muted)' }} />
    );
  }

  return (
    <div
      className={styles.row}
      style={{
        opacity: 0.85,
        background: 'var(--color-overlay-stronger)',
        boxShadow: 'var(--elevation-2)',
        paddingLeft: '10px',
        pointerEvents: 'none',
      }}
    >
      <span className={styles.rowIcon}>{icon}</span>
      <span className={styles.label}>{name}</span>
    </div>
  );
};
