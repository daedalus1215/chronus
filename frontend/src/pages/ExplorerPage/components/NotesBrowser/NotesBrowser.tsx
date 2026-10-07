import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  X,
  StickyNote,
  SquareCheck,
  MoreHorizontal,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import {
  getNotesForExplorer,
  moveNoteToFolder,
} from '../../../../api/requests/notes.requests';
import { FolderDto } from '../../../../api/dtos/folder.dtos';
import { MoveNoteDialog } from '@components/MoveNoteDialog/MoveNoteDialog';
import styles from './NotesBrowser.module.css';

type Props = {
  folderId: string | undefined;
  folderLabel: string;
};

export const NotesBrowser: React.FC<Props> = ({ folderId, folderLabel }) => {
  const navigate = useNavigate();

  const [allNotes, setAllNotes] = useState<
    { name: string; id: number; isMemo: number; folderId: number | null }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    const data = await getNotesForExplorer(folderId);
    setAllNotes(data);
    setIsLoading(false);
  }, [folderId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const notes = allNotes.filter(
    n =>
      !searchQuery || n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [openMenuNoteId, setOpenMenuNoteId] = useState<number | null>(null);
  const [moveDialogNoteId, setMoveDialogNoteId] = useState<number | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value),
    []
  );

  const handleMoveConfirm = async (folder: FolderDto | null) => {
    if (moveDialogNoteId === null) return;
    await moveNoteToFolder(moveDialogNoteId, folder?.id ?? null);
    setMoveDialogNoteId(null);
    fetchNotes();
  };

  return (
    <div className={styles.browser}>
      {/* top bar */}
      <div className={styles.topBar}>
        <div className={styles.breadcrumb}>
          <ChevronRight size={11} className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>{folderLabel}</span>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--color-text-muted)' }}
          />
          <input
            placeholder="Filter notes…"
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 border-0 bg-transparent p-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={13} />
            </button>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <div className={styles.center}>
          <Loader2 className="size-[18px] animate-spin text-muted-foreground" />
        </div>
      ) : notes.length === 0 ? (
        <div className={styles.center}>
          <span className={styles.emptyText}>
            {searchQuery ? `No results for "${searchQuery}"` : 'Empty folder'}
          </span>
        </div>
      ) : (
        <div className={styles.list}>
          {notes.map(note => (
            <div
              key={note.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/notes/${note.id}`)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/notes/${note.id}`);
                }
              }}
              className={styles.noteRow}
            >
              <span className={styles.noteIcon}>
                {note.isMemo ? (
                  <StickyNote size={13} style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <SquareCheck size={13} style={{ color: 'var(--color-text-muted)' }} />
                )}
              </span>
              <span className={styles.noteLabel}>{note.name}</span>
              <DropdownMenu
                open={openMenuNoteId === note.id}
                onOpenChange={open => setOpenMenuNoteId(open ? note.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={styles.noteMenuBtn}
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreHorizontal size={13} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[150px]"
                  onClick={e => e.stopPropagation()}
                >
                  <DropdownMenuItem onClick={() => setMoveDialogNoteId(note.id)}>
                    Move to folder…
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate(`/notes/${note.id}`)}>
                    Open
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      {moveDialogNoteId !== null && (
        <MoveNoteDialog
          open
          onClose={() => setMoveDialogNoteId(null)}
          onConfirm={handleMoveConfirm}
        />
      )}
    </div>
  );
};
