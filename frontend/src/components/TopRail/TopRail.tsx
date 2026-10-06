import React from 'react';
import { useMatch, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    <div
      className="z-10 flex shrink-0 items-center justify-between border-b border-border bg-card px-1"
      style={{ height: TOP_RAIL_HEIGHT_PX }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleLeftButtonClick}
            variant="ghost"
            size="icon-sm"
            aria-label={leftButtonLabel}
            className="rounded-sm text-muted-foreground hover:text-foreground"
          >
            {kanbanMatch ? (
              <ArrowLeft className="size-[18px]" />
            ) : (
              <SidebarToggleIcon isOpen={isNoteListOpen} size={18} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">{leftButtonTooltip}</TooltipContent>
      </Tooltip>

      {pageActions && (
        <div className="flex items-center gap-1">{pageActions}</div>
      )}
    </div>
  );
};
