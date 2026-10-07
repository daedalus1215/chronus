import React from 'react';
import { Waypoints } from 'lucide-react';
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
      <div className={styles.page}>
        {hasNoteOpen ? <Outlet /> : <ExplorerTree />}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* left: unified file tree */}
      <div
        className="shrink-0 overflow-hidden"
        style={{
          maxWidth: isNoteListOpen ? '450px' : '0px',
          transition: 'max-width 0.2s ease',
        }}
      >
        <div
          className="relative h-full shrink-0 grow-0 overflow-hidden border-r border-border"
          style={{ width: `${treeWidth}px` }}
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
        </div>
      </div>

      {/* right: note detail or empty state */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ height: '100%' }}>
        {hasNoteOpen ? (
          <Outlet />
        ) : (
          <div className={styles.emptyPane}>
            <div className={styles.emptyInner}>
              <Waypoints className={styles.emptyIcon} />
              <span className={styles.emptyText}>Select a note to open it</span>
              <span className={styles.emptyHint}>
                Browse folders on the left, or create a new note
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
