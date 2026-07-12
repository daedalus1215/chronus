import React from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { Box, IconButton, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SidebarToggleIcon } from '../Header/Sidebar/SidebarToggleIcon';
import { useSidebar } from '../../hooks/useSidebar';
import { useTopRailActionsSlot } from '../../hooks/useTopRailActionsSlot';

export const TOP_RAIL_HEIGHT_PX = 36;

export const TopRail: React.FC = () => {
  const { isNoteListOpen, setIsNoteListOpen } = useSidebar();
  const pageActions = useTopRailActionsSlot();
  const kanbanMatch = useMatch('/notes/:id/kanban');
  const navigate = useNavigate();

  const handleLeftButtonClick = () => {
    if (kanbanMatch) {
      navigate(`/notes/${kanbanMatch.params.id}`);
    } else {
      setIsNoteListOpen(!isNoteListOpen);
    }
  };

  const leftButtonTooltip = kanbanMatch
    ? 'Back to note'
    : isNoteListOpen
      ? 'Collapse note list'
      : 'Expand note list';

  const leftButtonLabel = kanbanMatch ? 'Back to note' : leftButtonTooltip;

  return (
    <Box
      sx={{
        height: TOP_RAIL_HEIGHT_PX,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: '#111',
        zIndex: 10,
      }}
    >
      <Tooltip title={leftButtonTooltip} placement="bottom" arrow>
        <IconButton
          onClick={handleLeftButtonClick}
          size="small"
          aria-label={leftButtonLabel}
          sx={{
            color: 'text.secondary',
            borderRadius: 1,
            '&:hover': { color: 'text.primary' },
          }}
        >
          {kanbanMatch ? (
            <ArrowBackIcon sx={{ fontSize: 18 }} />
          ) : (
            <SidebarToggleIcon isOpen={isNoteListOpen} size={18} />
          )}
        </IconButton>
      </Tooltip>

      {pageActions && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {pageActions}
        </Box>
      )}
    </Box>
  );
};
