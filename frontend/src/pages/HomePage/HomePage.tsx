import React, { useEffect } from 'react';
import { Fab, CircularProgress, Box, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useAuth } from '../../auth/useAuth';
import { DesktopNoteListView } from './components/NoteListView/DesktopNoteListView/DesktopNoteListView';
import { useCreateNote } from './hooks/useCreateNote';
import { useImportNote, ImportNoteData } from './hooks/useImportNote';
import { CreateNoteMenu } from './components/CreateNoteMenu/CreateNoteMenu';
import { NOTE_TYPES, NoteTypes } from '../../constant';
import { useLocation, useParams, useNavigate, Outlet } from 'react-router-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useSidebar } from '../../hooks/useSidebar';
import { MobileNoteListView } from './components/NoteListView/MobileNoteListVIew/MobileNoteListView';
import { ROUTES } from '../../constants/routes';
import styles from './HomePage.module.css';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { isNoteListOpen } = useSidebar();
  const { createNote, isCreating } = useCreateNote();
  const { importNote } = useImportNote();
  const [showMenu, setShowMenu] = React.useState(false);
  const [importError, setImportError] = React.useState<string | null>(null);
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

      const result = await importNote({
        version: parsed.version,
        ...parsed.memo,
      });
      setShowMenu(false);
      
      // Navigate to the new note
      if (result.noteId) {
        navigate(`/notes/${result.noteId}`);
      }
    } catch (err) {
      console.error('Failed to import note:', err);
      setImportError('Failed to import note. Please check the file format.');
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
              display: isNoteRoute ? 'none' : 'block',
              flex: 1,
            }}
          >
            <MobileNoteListView type={noteTypeParam} tagId={tagId} />
          </Box>
          {isNoteRoute && (
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
        <Box
          sx={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}
        >
          {/* Note list and content */}
          <Box
            sx={{ display: 'flex', flex: 1, overflow: 'hidden', minWidth: 0 }}
          >
            <Box
              sx={{
                overflow: 'hidden',
                flexShrink: 0,
                maxWidth: isNoteListOpen ? '350px' : '0px',
                transition: 'max-width 0.2s ease',
              }}
            >
              <Box sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
                <DesktopNoteListView
                  type={noteTypeParam}
                  tagId={tagId}
                  onNoteSelect={handleNoteSelect}
                  selectedNoteId={selectedNoteId}
                />
              </Box>
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
              {selectedNoteId && (
                <Box
                  sx={{
                    p: 2,
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Outlet />
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
      {!isNoteRoute && (
        <Fab
          color="primary"
          aria-label="Create new note"
          onClick={() => setShowMenu(true)}
          disabled={isCreating}
          sx={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
          }}
        >
          {isCreating ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <AddIcon />
          )}
        </Fab>
      )}
      {showMenu && (
        <CreateNoteMenu
          onSelect={handleCreateNote}
          onImport={handleImportNote}
          onClose={() => setShowMenu(false)}
        />
      )}
      <Snackbar
        open={!!importError}
        autoHideDuration={6000}
        onClose={() => setImportError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={() => setImportError(null)}
          sx={{ width: '100%' }}
        >
          {importError}
        </Alert>
      </Snackbar>
    </div>
  );
};
