import React from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import { RightSheet } from '@components/RightSheet/RightSheet';
import { Note } from '../../api/responses';
import { SidebarChecklistView } from '../SidebarChecklistView/SidebarChecklistView';
import { SidebarTagsView } from '../SidebarTagsView/SidebarTagsView';
import { AudioHistoryView } from '../AudioHistoryView/AudioHistoryView';
import { TimeTrackHistoryView } from '../TimeTrackHistoryView/TimeTrackHistoryView';

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
};

export const MobileTagsView: React.FC<MobileTagsViewProps> = ({
  note,
  noteId,
  tabs,
  activeTab,
  onTabChange,
  isOpen,
  onClose,
}) => (
  <RightSheet isOpen={isOpen} onClose={onClose}>
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        margin: -2,
      }}
    >
      <ToggleButtonGroup
        value={activeTab}
        exclusive
        onChange={(_, value) => {
          if (value) {
            onTabChange(value);
          }
        }}
        sx={{
          borderBottom: '1px solid var(--color-overlay-stronger)',
          '& .MuiToggleButtonGroup-grouped': {
            margin: 0,
            border: 0,
            borderRadius: 0,
            py: 0.75,
            px: 1.5,
          },
          '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
            borderLeft: '1px solid var(--color-overlay-stronger)',
          },
          '& .Mui-selected': {
            backgroundColor: 'rgba(99,102,241,0.12)',
            color: 'primary.main',
          },
        }}
      >
        {tabs.map(tab => (
          <ToggleButton key={tab.id} value={tab.id}>
            {tab.icon}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {activeTab === 'checklist' && <SidebarChecklistView note={note} />}
        {activeTab === 'tags' && <SidebarTagsView noteId={noteId} />}
        {activeTab === 'audio' && <AudioHistoryView noteId={noteId} />}
        {activeTab === 'time' && <TimeTrackHistoryView noteId={noteId} />}
      </Box>
    </Box>
  </RightSheet>
);
