import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import HistoryIcon from '@mui/icons-material/History';
import { useNoteVersions } from '../../hooks/useNoteVersions/useNoteVersions';
import { NoteVersion } from '../../hooks/useNoteVersions/useNoteVersions';
import styles from './SidebarNoteHistoryView.module.css';

type SidebarNoteHistoryViewProps = {
  noteId: number;
  loadedFromVersion: number | null;
  onVersionLoaded: (versionNum: number, description: string) => void;
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const truncate = (text: string, maxLen = 50): string =>
  text.length > maxLen ? text.slice(0, maxLen) + '…' : text;

export const SidebarNoteHistoryView: React.FC<
  SidebarNoteHistoryViewProps
> = ({ noteId, loadedFromVersion, onVersionLoaded }) => {
  const {
    versions,
    total,
    maxVersions,
    isLoading,
    error,
    refetch,
  } = useNoteVersions(noteId);

  // Lazy fetch when the tab becomes visible
  useEffect(() => {
    void refetch();
  }, [refetch, noteId]);

  const handleLoadVersion = async (version: NoteVersion): Promise<void> => {
    // Just notify parent with version info - no API call, no save
    // The editor will show this as "dirty" preview state
    onVersionLoaded(version.versionNum, version.description);
  };

  return (
    <Box className={styles.sidebarHistory}>
      {/* Header with version count */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          borderBottom: '1px solid var(--color-overlay-stronger)',
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {total} / {maxVersions} versions
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {error.message}
        </Alert>
      )}

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <CircularProgress size={24} />
        </Box>
      ) : versions.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 0.5,
            px: 2,
            py: 4,
            color: 'text.secondary',
          }}
        >
          <HistoryIcon sx={{ fontSize: 40, opacity: 0.5 }} />
          <p style={{ margin: 0, fontSize: '0.875rem' }}>
            No versions yet
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '0.8125rem',
              opacity: 0.7,
            }}
          >
            Versions are created on each save
          </p>
        </Box>
      ) : (
        <List
          className={styles.list}
          sx={{
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {versions.map(version => {
            const isLoaded = version.versionNum === loadedFromVersion;

            return (
              <ListItem
                key={version.id}
                disableGutters
                onClick={() => handleLoadVersion(version)}
                sx={{
                  borderBottom: '1px solid var(--color-overlay-stronger)',
                  py: 0.5,
                  px: 2,
                  cursor: 'pointer',
                  backgroundColor: isLoaded
                    ? 'var(--color-primary-light)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isLoaded
                      ? 'var(--accent-soft)'
                      : 'action.hover',
                  },
                }}
              >
                <ListItemText
                  primary={`v${version.versionNum} — ${formatDate(
                    version.createdAt
                  )}`}
                  secondary={
                    version.description
                      ? truncate(version.description)
                      : '(empty)'
                  }
                  sx={{
                    flex: 1,
                    '& .MuiListItemText-primary': {
                      fontSize: '0.8125rem',
                      fontWeight: isLoaded ? 600 : 400,
                    },
                    '& .MuiListItemText-secondary': {
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );
};
