import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { RightSheet } from '@components/RightSheet/RightSheet';
import { Note } from '../../api/responses';
import { SidebarChecklistView } from '../SidebarChecklistView/SidebarChecklistView';
import { SidebarFolderView } from '../SidebarFolderView/SidebarFolderView';
import { SidebarTagsView } from '../SidebarTagsView/SidebarTagsView';
import { SidebarAudioHistoryView } from '../SidebarAudioHistoryView/SidebarAudioHistoryView';
import { TimeTrackHistoryView } from '../TimeTrackHistoryView/TimeTrackHistoryView';
import { SidebarNoteHistoryView } from '../SidebarNoteHistoryView/SidebarNoteHistoryView';

type Tab = {
  id: string;
  icon: React.ReactNode;
};

type MobileTagsViewProps = {
  note: Note;
  noteId: number;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOpen: boolean;
  onClose: () => void;
  loadedFromVersion?: number | null;
  onVersionLoaded?: (versionNum: number, description: string) => void;
};

export const MobileTagsView: React.FC<MobileTagsViewProps> = ({
  note,
  noteId,
  tabs,
  activeTab,
  onTabChange,
  isOpen,
  onClose,
  loadedFromVersion,
  onVersionLoaded,
}) => (
  <RightSheet isOpen={isOpen} onClose={onClose}>
    <div className="-m-4 flex min-h-0 flex-1 flex-col">
      <ToggleGroup
        type="single"
        value={activeTab}
        onValueChange={value => {
          if (value) {
            onTabChange(value);
          }
        }}
        className="w-full border-b border-[var(--color-overlay-stronger)] [&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-[var(--color-overlay-stronger)]"
      >
        {tabs.map(tab => (
          <ToggleGroupItem
            key={tab.id}
            value={tab.id}
            className="rounded-none border-0 px-3 py-1.5 data-[state=on]:bg-[var(--accent-soft)] data-[state=on]:text-primary"
          >
            {tab.icon}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="min-h-0 flex-1 overflow-hidden">
        {activeTab === 'checklist' && <SidebarChecklistView note={note} />}
        {activeTab === 'tags' && <SidebarTagsView noteId={noteId} />}
        {activeTab === 'folder' && (
          <SidebarFolderView noteId={noteId} folderId={note.folderId} />
        )}
        {activeTab === 'audio' && <SidebarAudioHistoryView noteId={noteId} />}
        {activeTab === 'time' && <TimeTrackHistoryView noteId={noteId} />}
        {activeTab === 'history' && noteId && onVersionLoaded && (
          <SidebarNoteHistoryView
            noteId={noteId}
            loadedFromVersion={loadedFromVersion ?? null}
            onVersionLoaded={onVersionLoaded}
          />
        )}
      </div>
    </div>
  </RightSheet>
);
