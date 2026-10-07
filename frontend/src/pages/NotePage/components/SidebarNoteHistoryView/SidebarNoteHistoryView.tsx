import React, { useEffect } from 'react';
import { History, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
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
    <div className={styles.sidebarHistory}>
      {/* Header with version count */}
      <div className="flex items-center justify-between border-b border-[var(--color-overlay-stronger)] px-3 py-2">
        <span className="text-[0.8125rem] font-semibold text-foreground">
          {total} / {maxVersions} versions
        </span>
      </div>

      {error && (
        <Alert variant="destructive" className="mx-4 mt-4 w-auto">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : versions.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-1 px-4 py-8 text-center text-muted-foreground">
          <History className="size-10 opacity-50" />
          <p className="m-0 text-sm">No versions yet</p>
          <p className="m-0 text-[0.8125rem] opacity-70">
            Versions are created on each save
          </p>
        </div>
      ) : (
        <ul className={cn(styles.list, 'min-h-0 flex-1 list-none overflow-y-auto p-0')}>
          {versions.map(version => {
            const isLoaded = version.versionNum === loadedFromVersion;

            return (
              <li
                key={version.id}
                onClick={() => handleLoadVersion(version)}
                className="cursor-pointer border-b border-[var(--color-overlay-stronger)] px-4 py-1 hover:bg-[var(--accent-soft)]"
                style={{
                  backgroundColor: isLoaded ? 'var(--color-primary-light)' : 'transparent',
                }}
              >
                <div className="flex-1">
                  <div
                    className={cn(
                      'text-[0.8125rem]',
                      isLoaded ? 'font-semibold' : 'font-normal'
                    )}
                  >
                    v{version.versionNum} — {formatDate(version.createdAt)}
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs text-muted-foreground">
                    {version.description ? truncate(version.description) : '(empty)'}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
