import React from 'react';
import { Box } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { ExplorerNoteItem } from '../../../../api/dtos/note.dtos';
import styles from './ExplorerTree.module.css';

type DragGhostRowProps = {
  id: string;
  folders: FolderDto[];
  notes: ExplorerNoteItem[];
};

export const DragGhostRow: React.FC<DragGhostRowProps> = ({ id, folders, notes }) => {
  let name = '';
  let icon: React.ReactNode;

  if (id.startsWith('folder-')) {
    const folderId = parseInt(id.slice(7), 10);
    const folder = folders.find(f => f.id === folderId);
    name = folder?.name ?? '';
    icon = <FolderIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.55)' }} />;
  } else {
    const noteId = parseInt(id.slice(5), 10);
    const note = notes.find(n => n.id === noteId);
    name = note?.name ?? '';
    icon = note?.isMemo
      ? <StickyNote2Icon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />
      : <CheckBoxIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }} />;
  }

  return (
    <Box
      className={styles.row}
      sx={{
        opacity: 0.85,
        background: 'rgba(255,255,255,0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        pl: '10px',
        pointerEvents: 'none',
      }}
    >
      <span className={styles.rowIcon}>{icon}</span>
      <span className={styles.label}>{name}</span>
    </Box>
  );
};
