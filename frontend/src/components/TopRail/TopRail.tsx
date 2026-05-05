import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { SidebarToggleIcon } from '../Header/Sidebar/SidebarToggleIcon';
import { useSidebar } from '../../hooks/useSidebar';

export const TOP_RAIL_HEIGHT_PX = 36;

export const TopRail: React.FC = () => {
  const { isNoteListOpen, setIsNoteListOpen } = useSidebar();

  return (
    <Box
      sx={{
        height: TOP_RAIL_HEIGHT_PX,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        px: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: '#111',
        zIndex: 10,
      }}
    >
      <Tooltip
        title={isNoteListOpen ? 'Collapse note list' : 'Expand note list'}
        placement="bottom"
        arrow
      >
        <IconButton
          onClick={() => setIsNoteListOpen(!isNoteListOpen)}
          size="small"
          aria-label={isNoteListOpen ? 'Collapse note list' : 'Expand note list'}
          sx={{
            color: 'text.secondary',
            borderRadius: 1,
            '&:hover': { color: 'text.primary' },
          }}
        >
          <SidebarToggleIcon isOpen={isNoteListOpen} size={18} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
