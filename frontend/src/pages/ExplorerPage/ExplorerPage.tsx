import React from 'react';
import { Box, Typography } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import { Outlet, useMatch } from 'react-router-dom';
import { ExplorerTree } from './components/ExplorerTree/ExplorerTree';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useResizablePane } from '../../hooks/useResizablePane';
import { useSidebar } from '../../hooks/useSidebar';
import { STORAGE_KEYS } from '../../constants/storage';
import styles from './ExplorerPage.module.css';

const EXPLORER_NOTE_PATTERN = '/explorer/notes/:id';

export const ExplorerPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { isNoteListOpen } = useSidebar();
  const noteMatch = useMatch(EXPLORER_NOTE_PATTERN);
  const hasNoteOpen = Boolean(noteMatch);

  const {
    size: treeWidth,
    startResizing,
    handleKeyDown,
    handleDoubleClick,
  } = useResizablePane({
    localStorageKey: STORAGE_KEYS.EXPLORER.TREE_WIDTH_PX,
    min: 10,
    max: 400,
    initial: 260,
    axis: 'x',
    step: 10,
    largeStep: 20,
    snapPoints: [10, 48, 120, 180, 260, 320, 400],
    snapThreshold: 10,
  });

  if (isMobile) {
    return (
      <Box className={styles.page}>
        {hasNoteOpen ? <Outlet /> : <ExplorerTree />}
      </Box>
    );
  }

  return (
    <Box className={styles.page}>
      {/* left: unified file tree */}
      <Box
        sx={{
          overflow: 'hidden',
          flexShrink: 0,
          maxWidth: isNoteListOpen ? '450px' : '0px',
          transition: 'max-width 0.2s ease',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: `${treeWidth}px`,
            flex: '0 0 auto',
            borderRight: '1px solid',
            borderColor: 'divider',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <ExplorerTree />
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize explorer"
            tabIndex={0}
            className={styles.resizeHandle}
            onMouseDown={startResizing}
            onPointerDown={startResizing}
            onKeyDown={handleKeyDown}
            onDoubleClick={handleDoubleClick}
          />
        </Box>
      </Box>

      {/* right: note detail or empty state */}
      <Box
        sx={{
          flex: 1,
          height: '100%',
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {hasNoteOpen ? (
          <Outlet />
        ) : (
          <Box className={styles.emptyPane}>
            <div className={styles.emptyInner}>
              <AccountTreeOutlinedIcon className={styles.emptyIcon} />
              <Typography className={styles.emptyText}>
                Select a note to open it
              </Typography>
              <Typography className={styles.emptyHint}>
                Browse folders on the left, or create a new note
              </Typography>
            </div>
          </Box>
        )}
      </Box>
    </Box>
  );
};
