import React, { useEffect } from 'react';
import { MobileTagListView } from './components/TagListView/MobileTagListView/MobileTagListView';
import { MobileTagNotesListView } from './components/TagListView/MobileTagNotesListView/MobileTagNotesListView';
import { DesktopTagTreePanel } from './components/TagListView/DesktopTagTreePanel/DesktopTagTreePanel';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useResizablePane } from '../../hooks/useResizablePane';
import { useParams, useMatch, useNavigate, Outlet } from 'react-router-dom';
import { useSidebar } from '../../hooks/useSidebar';
import { useTagsWithNotes } from '../../hooks/useTagsWithNotes';
import { ROUTES } from '../../constants/routes';
import styles from './TagPage.module.css';
import { STORAGE_KEYS } from '../../constants/storage';

const TAG_NOTES_NOTE_PATTERN = '/tag-notes/:tagId/notes/:id';

export const TagPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { isNoteListOpen } = useSidebar();
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
    localStorageKey: STORAGE_KEYS.TAGS.TREE_WIDTH_PX,
    min: 10, // allow thin rail
    max: 300, // align with note list width cap
    initial: 300,
    axis: 'x',
    step: 10,
    largeStep: 20,
    snapPoints: [10, 48, 72, 96, 120, 160, 220, 300],
    snapThreshold: 10,
  });

  const navigate = useNavigate();
  const { tags, tagsLoading } = useTagsWithNotes();

  // If the tag in the current route gets deleted (tree, mobile list, or any
  // other surface), fall back to the tag list instead of sitting on a dead
  // /tag-notes/:id page.
  useEffect(() => {
    if (routeTagId == null || tagsLoading) return;
    if (!tags.some(tag => tag.id === Number(routeTagId))) {
      navigate(ROUTES.TAGS, { replace: true });
    }
  }, [tags, tagsLoading, routeTagId, navigate]);

  return (
    <main className={styles.tagPage}>
      <div className="flex h-full min-h-0">
        {isMobile ? (
          <div className="relative flex h-full flex-col">
            <div className={isTagRoute ? 'hidden' : 'flex-1'}>
              <MobileTagListView />
            </div>
            {isTagRoute && !hasNoteOpen && (
              <div className="absolute inset-0 z-[1] bg-card">
                <MobileTagNotesListView />
              </div>
            )}
            {isTagRoute && hasNoteOpen && (
              <div className="absolute inset-0 z-[1] bg-card">
                <Outlet />
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full">
            <div
              className="shrink-0 overflow-hidden"
              style={{
                maxWidth: isNoteListOpen ? '350px' : '0px',
                transition: 'max-width 0.2s ease',
              }}
            >
              <div
                className="relative h-full shrink-0 grow-0 border-r border-border"
                style={{ width: `${treeWidth}px` }}
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
              </div>
            </div>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden" style={{ height: '100%' }}>
              {hasNoteOpen ? (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <Outlet />
                </div>
              ) : (
                <div className="m-auto flex min-h-0 flex-1 items-center justify-center text-muted-foreground">
                  <div className={styles.noNotesSelectedText}>
                    <span className="text-sm">
                      Select a tag or note from the tree
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
