import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '../../auth/useAuth';
import { DesktopNoteListView } from './components/NoteListView/DesktopNoteListView/DesktopNoteListView';
import { useCreateNote } from './hooks/useCreateNote';
import { useImportNote, ImportNoteData } from './hooks/useImportNote';
import { CreateNoteMenu } from './components/CreateNoteMenu/CreateNoteMenu';
import {
  ImportSelectionDialog,
  ParsedMemo,
} from './components/ImportSelectionDialog/ImportSelectionDialog';
import { NOTE_TYPES, NoteTypes } from '../../constant';
import { useLocation, useParams, useNavigate, Outlet } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebar } from '../../hooks/useSidebar';
import { MobileNoteListView } from './components/NoteListView/MobileNoteListVIew/MobileNoteListView';
import { ROUTES } from '../../constants/routes';
import { ParticleField } from '../../components/ParticleField/ParticleField';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { isNoteListOpen } = useSidebar();
  const { createNote, isCreating } = useCreateNote();
  const { importNote, isImporting } = useImportNote();
  const [showMenu, setShowMenu] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [pendingImport, setPendingImport] = React.useState<{
    version: number;
    memo: ParsedMemo;
  } | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeNoteId } = useParams<{ id: string }>();
  const [selectedNoteId, setSelectedNoteId] = React.useState<number | null>(
    routeNoteId ? Number(routeNoteId) : null
  );

  const noteType = location.pathname.split('/')[1];
  const noteTypeParam: NoteTypes | undefined = noteType as
    | NoteTypes
    | undefined;
  const { tagId } = useParams<{ tagId: string }>();

  // Update selectedNoteId when route changes
  useEffect(() => {
    if (routeNoteId) {
      setSelectedNoteId(Number(routeNoteId));
    } else if (
      location.pathname === ROUTES.HOME ||
      location.pathname === ROUTES.MEMOS ||
      location.pathname === ROUTES.CHECKLISTS
    ) {
      setSelectedNoteId(null);
    }
  }, [routeNoteId, location.pathname]);

  useEffect(() => {
    if (importError) {
      toast.error(importError);
      setImportError(null);
    }
  }, [importError]);

  if (!user) {
    return null;
  }

  const handleCreateNote = async (noteTypeParam: keyof typeof NOTE_TYPES) => {
    try {
      await createNote(noteTypeParam);
      setShowMenu(false);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleImportNote = async (file: File) => {
    setImportError(null);
    try {
      const text = await file.text();
      // Export files are nested: { version, exportedAt, memo: { ... } }.
      // The import payload is flat, so lift `memo` up alongside `version`.
      const parsed = JSON.parse(text) as {
        version: number;
        memo: Omit<ImportNoteData, 'version'>;
      };

      // Validate version
      if (parsed.version !== 1) {
        setImportError(`Unsupported file version: ${parsed.version}`);
        return;
      }

      if (!parsed.memo?.name) {
        setImportError('Invalid .chronus file: missing memo name.');
        return;
      }

      // Open the selection picker; the actual import happens on confirm.
      setShowMenu(false);
      setPendingImport({ version: parsed.version, memo: parsed.memo });
    } catch (err) {
      console.error('Failed to import note:', err);
      setImportError('Failed to import note. Please check the file format.');
    }
  };

  const handleConfirmImport = async (payload: ImportNoteData) => {
    setImportError(null);
    try {
      const result = await importNote(payload);
      setPendingImport(null);

      // Navigate to the new note
      if (result.noteId) {
        navigate(`/notes/${result.noteId}`);
      }
    } catch (err) {
      console.error('Failed to import note:', err);
      setImportError('Failed to import note. Please try again.');
    }
  };

  const handleNoteSelect = (noteId: number) => {
    const basePath = location.pathname.split('/notes/')[0];
    const targetPath = basePath.endsWith('/') ? basePath : `${basePath}/`;

    if (isMobile) {
      navigate(`${targetPath}notes/${noteId}`);
    } else {
      // Update both state and route
      setSelectedNoteId(noteId);
      navigate(`${targetPath}notes/${noteId}`, { replace: true });
    }
  };

  const isNoteRoute = !!routeNoteId;

  return (
    <div
      className={styles.homePage}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <ParticleField />
      {isMobile ? (
        <div className="relative z-[1] flex h-full flex-col">
          <div className={cn('flex-1', isNoteRoute && 'hidden')}>
            <MobileNoteListView type={noteTypeParam} tagId={tagId} />
          </div>
          {isNoteRoute && (
            <div className="absolute inset-0 z-[1] bg-card">
              <Outlet />
            </div>
          )}
        </div>
      ) : (
        <div className="relative z-[1] flex h-full min-w-0 w-full">
          {/* Note list and content */}
          <div className="flex min-w-0 flex-1 overflow-hidden">
            <div
              className="shrink-0 overflow-hidden"
              style={{
                maxWidth: isNoteListOpen ? '350px' : '0px',
                transition: 'max-width 0.2s ease',
              }}
            >
              <div className="border-r border-border">
                <DesktopNoteListView
                  type={noteTypeParam}
                  tagId={tagId}
                  onNoteSelect={handleNoteSelect}
                  selectedNoteId={selectedNoteId}
                />
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden" style={{ height: '100%' }}>
              {selectedNoteId && (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
                  <Outlet />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {!isNoteRoute && (
        <Button
          size="icon"
          aria-label="Create new note"
          onClick={() => setShowMenu(true)}
          disabled={isCreating}
          className="fixed bottom-8 right-8 rounded-full"
        >
          {isCreating ? (
            <Loader2 className="size-6 animate-spin" />
          ) : (
            <Plus
              className="transition-transform duration-[280ms]"
              style={{
                transitionTimingFunction: 'var(--ease-spring, ease)',
                transform: showMenu ? 'rotate(135deg)' : 'none',
              }}
            />
          )}
        </Button>
      )}
      {showMenu && (
        <CreateNoteMenu
          onSelect={handleCreateNote}
          onImport={handleImportNote}
          onClose={() => setShowMenu(false)}
        />
      )}
      {pendingImport && (
        <ImportSelectionDialog
          open
          memo={pendingImport.memo}
          version={pendingImport.version}
          isImporting={isImporting}
          onCancel={() => setPendingImport(null)}
          onConfirm={handleConfirmImport}
        />
      )}
    </div>
  );
};
