import React from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import ChecklistIcon from '@mui/icons-material/Checklist';
import AddNoteIcon from '@mui/icons-material/NoteAdd';
import styles from './ExplorerTree.module.css';

type ExplorerTreeHeaderProps = {
  selectionCount: number;
  pickItemsMode: boolean;
  onMoveSelected: () => void;
  onClearSelection: () => void;
  onTogglePickItems: () => void;
  onNewFolder: () => void;
  onNewMemo: () => void;
};

export const ExplorerTreeHeader: React.FC<ExplorerTreeHeaderProps> = ({
  selectionCount,
  pickItemsMode,
  onMoveSelected,
  onClearSelection,
  onTogglePickItems,
  onNewFolder,
  onNewMemo,
}) => {
  return (
    <Box className={styles.header}>
      <span className={styles.heading}>vault</span>
      <Box
        className={styles.headerActions}
        sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}
      >
        {selectionCount > 0 && (
          <>
            <Typography
              component="span"
              sx={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {selectionCount} selected
            </Typography>
            <IconButton
              size="small"
              className={styles.headerBtn}
              title="Move to folder (Ctrl+M)"
              onClick={onMoveSelected}
            >
              <DriveFileMoveIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton size="small" className={styles.headerBtn} title="Clear selection" onClick={onClearSelection}>
              <CloseRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </>
        )}
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<ChecklistIcon sx={{ fontSize: 16, opacity: 0.85 }} />}
          title={
            pickItemsMode
              ? 'Exit select mode (clears selection)'
              : 'Select notes & folders to move'
          }
          aria-pressed={pickItemsMode}
          onClick={onTogglePickItems}
          sx={{
            flexShrink: 0,
            minWidth: 'max-content',
            px: 0.5,
            py: 0.25,
            fontSize: 11,
            lineHeight: 1.2,
            textTransform: 'none',
            letterSpacing: 0.01,
            whiteSpace: 'nowrap',
            color: pickItemsMode ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.45)',
            backgroundColor: pickItemsMode ? 'rgba(255,255,255,0.1)' : 'transparent',
          }}
        >
          {pickItemsMode ? 'Done' : 'Select'}
        </Button>
        <IconButton
          size="small"
          className={styles.headerBtn}
          title="New folder"
          onClick={onNewFolder}
        >
          <CreateNewFolderIcon sx={{ fontSize: 14 }} />
        </IconButton>
        <IconButton
          size="small"
          className={styles.headerBtn}
          title="New memo"
          onClick={onNewMemo}
        >
          <AddNoteIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

