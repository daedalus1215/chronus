import React from 'react';
import { MobileTagListView } from './components/TagListView/MobileTagListView/MobileTagListView';
import { MobileTagNotesListView } from './components/TagListView/MobileTagNotesListView/MobileTagNotesListView';
import { DesktopTagTreePanel } from './components/TagListView/DesktopTagTreePanel/DesktopTagTreePanel';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useResizablePane } from '../../hooks/useResizablePane';
import { useParams, useMatch, Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import styles from './TagPage.module.css';

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
    min: 10, // allow thin rail
    max: 300, // align with note list width cap
    initial: 300,
    axis: 'x',
    step: 10,
    largeStep: 20,
    snapPoints: [10, 48, 72, 96, 120, 160, 220, 300],
    snapThreshold: 10,
  });

  return (
    <main className={styles.tagPage}>
      <Box sx={{ display: 'flex', height: '100%', minHeight: 0 }}>
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
                borderRight: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <DesktopTagTreePanel />
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
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {hasNoteOpen ? (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Outlet />
                </Box>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    margin: 'auto',
                    minHeight: 0,
                  }}
                >
                  <div className={styles.noNotesSelectedText}>
                    <Typography variant="body2">
                      Select a tag or note from the tree
                    </Typography>
                  </div>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    </main>
  );
};
