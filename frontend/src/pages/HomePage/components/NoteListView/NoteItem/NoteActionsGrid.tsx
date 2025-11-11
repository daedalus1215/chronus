import React from 'react';
import { BottomSheet } from '../../../../../components/BottomSheet/BottomSheet';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ShareIcon from '@mui/icons-material/Share';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import ArchiveIcon from '@mui/icons-material/Archive';
import EditIcon from '@mui/icons-material/Edit';
import LabelIcon from '@mui/icons-material/Label';
import PushPinIcon from '@mui/icons-material/PushPin';
import StarIcon from '@mui/icons-material/Star';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BarChartIcon from '@mui/icons-material/BarChart';

interface NoteActionsProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onArchive: () => void;
  onTimeTracking: () => void;
  onViewTimeEntries: () => void;
  onPin: () => void;
  onStar: () => void;
  onTextToSpeech: () => void;
  onDownloadAudio: () => void;
  onEdit: () => void;
  onLabel: () => void;
}

export const NoteActionsGrid: React.FC<NoteActionsProps> = ({
  isOpen,
  onClose,
  onShare,
  onDuplicate,
  onDelete,
  onArchive,
  onTimeTracking,
  onViewTimeEntries,
  onPin,
  onStar,
  onTextToSpeech,
  onDownloadAudio,
  onEdit,
  onLabel,
}) => {
  const actions = [
    { icon: <ShareIcon />, label: 'Share', onClick: onShare },
    { icon: <FileCopyIcon />, label: 'Duplicate', onClick: onDuplicate },
    { icon: <DeleteIcon />, label: 'Delete', onClick: onDelete },
    { icon: <ArchiveIcon />, label: 'Archive', onClick: onArchive },
    { icon: <AccessTimeIcon />, label: 'Track Time', onClick: onTimeTracking },
    { icon: <BarChartIcon />, label: 'View Time', onClick: onViewTimeEntries },
    { icon: <PushPinIcon />, label: 'Pin', onClick: onPin },
    { icon: <StarIcon />, label: 'Star', onClick: onStar },
    { icon: <RecordVoiceOverIcon />, label: 'Convert to Speech', onClick: onTextToSpeech },
    { icon: <CloudDownloadIcon />, label: 'Download Audio', onClick: onDownloadAudio },
    { icon: <EditIcon />, label: 'Edit', onClick: onEdit },
    { icon: <LabelIcon />, label: 'Label', onClick: onLabel },
  ];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      <Grid container spacing={2} sx={{ p: 2 }}>
        {actions.map((action, index) => (
          <Grid component="div" item xs={3} key={index}>
            <Button
              onClick={action.onClick}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                textTransform: 'none',
              }}
            >
              {action.icon}
              <Typography variant="caption" sx={{ mt: 1 }}>
                {action.label}
              </Typography>
            </Button>
          </Grid>
        ))}
      </Grid>
    </BottomSheet>
  );
};
