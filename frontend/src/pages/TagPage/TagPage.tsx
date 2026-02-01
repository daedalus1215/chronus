import React, { useState } from 'react';
import { MobileTagListView } from './components/TagListView/MobileTagListView/MobileTagListView';
import { MobileTagNotesListView } from './components/TagListView/MobileTagNotesListView/MobileTagNotesListView';
import { SearchBar } from './components/TagListView/SearchBar/SearchBar';
import { TagTreeNavigation } from '../../components/TreeNavigation/TagTreeNavigation';
import styles from './TagPage.module.css';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useResizablePane } from '../../hooks/useResizablePane';
import { useParams, useMatch, Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

const TAG_NOTES_NOTE_PATTERN = '/tag-notes/:tagId/notes/:id';

export const TagPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const noteMatch = useMatch(TAG_NOTES_NOTE_PATTERN);
  const isTagRoute = routeTagId != null;
  const hasNoteOpen = !!noteMatch;

  const {
    size: treeWidth,
    startResizing,
    handleKeyDown,
    handleDoubleClick,
  } = useResizablePane({
    localStorageKey: 'tagTreeWidthPx',
    min: 2,
    max: 400,
    initial: 280,
    axis: 'x',
    step: 10,
    largeStep: 20,
    snapPoints: [160, 220, 280, 340, 400],
    snapThreshold: 10,
  });

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div
      className={styles.tagPage}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {isMobile ? (
        <Box
          sx={{
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: isTagRoute ? 'none' : 'block',
              flex: 1,
            }}
          >
            <MobileTagListView />
          </Box>
          {isTagRoute && !hasNoteOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'background.paper',
                zIndex: 1,
              }}
            >
              <MobileTagNotesListView />
            </Box>
          )}
          {isTagRoute && hasNoteOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'background.paper',
                zIndex: 1,
              }}
            >
              <Outlet />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <Box
            sx={{
              position: 'relative',
              width: `${treeWidth}px`,
              flex: '0 0 auto',
            }}
          >
            <Box
              sx={{
                height: '100%',
                borderRight: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                placeholder="Search tags and notes..."
              />
              <TagTreeNavigation searchQuery={searchQuery} />
            </Box>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize tag tree"
              tabIndex={0}
              className={styles.resizeHandle}
              onMouseDown={startResizing}
              onPointerDown={startResizing}
              onKeyDown={handleKeyDown}
              onDoubleClick={handleDoubleClick}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              height: '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {hasNoteOpen ? (
              <Outlet />
            ) : (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                }}
              >
                <Typography variant="body2">
                  Select a tag or note from the tree
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      )}
    </div>
  );
};
