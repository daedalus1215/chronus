import React, { useMemo, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
  Stack,
  Typography,
  Divider,
  Box,
  List,
  ListItem,
} from '@mui/material';
import { ImportNoteData } from '../../hooks/useImportNote';

export type ParsedMemo = Omit<ImportNoteData, 'version'>;

type ImportSelectionDialogProps = {
  open: boolean;
  memo: ParsedMemo;
  version: number;
  isImporting?: boolean;
  onCancel: () => void;
  onConfirm: (payload: ImportNoteData) => void;
};

const statusLabels: Record<string, string> = {
  ready: 'ready',
  in_progress: 'in progress',
  review: 'review',
  done: 'done',
};

export const ImportSelectionDialog: React.FC<ImportSelectionDialogProps> = ({
  open,
  memo,
  version,
  isImporting,
  onCancel,
  onConfirm,
}) => {
  const tags = useMemo(() => memo.tags ?? [], [memo.tags]);
  const checkItems = useMemo(() => memo.checkItems ?? [], [memo.checkItems]);
  const timeTracks = useMemo(() => memo.timeTracks ?? [], [memo.timeTracks]);

  const hasDescription = !!memo.description?.trim();

  // Title is always imported (a new memo requires a name); this toggle
  // only controls whether the description comes along.
  const [includeDescription, setIncludeDescription] = useState(hasDescription);
  const [selectedTags, setSelectedTags] = useState<boolean[]>(() =>
    tags.map(() => true)
  );
  const [selectedCheckItems, setSelectedCheckItems] = useState<boolean[]>(() =>
    checkItems.map(() => true)
  );
  const [selectedTimeTracks, setSelectedTimeTracks] = useState<boolean[]>(() =>
    timeTracks.map(() => true)
  );

  const toggleAt = (
    setter: React.Dispatch<React.SetStateAction<boolean[]>>,
    index: number
  ) => {
    setter(prev => prev.map((v, i) => (i === index ? !v : v)));
  };

  const setAll = (
    setter: React.Dispatch<React.SetStateAction<boolean[]>>,
    length: number,
    value: boolean
  ) => {
    setter(Array.from({ length }, () => value));
  };

  const handleConfirm = () => {
    const payload: ImportNoteData = {
      version,
      name: memo.name,
    };

    if (includeDescription && hasDescription) {
      payload.description = memo.description ?? undefined;
    }

    const pickedTags = tags.filter((_, i) => selectedTags[i]);
    if (pickedTags.length > 0) {
      payload.tags = pickedTags;
    }

    const pickedCheckItems = checkItems.filter((_, i) => selectedCheckItems[i]);
    if (pickedCheckItems.length > 0) {
      payload.checkItems = pickedCheckItems;
    }

    const pickedTimeTracks = timeTracks.filter((_, i) => selectedTimeTracks[i]);
    if (pickedTimeTracks.length > 0) {
      payload.timeTracks = pickedTimeTracks;
    }

    onConfirm(payload);
  };

  const allTagsSelected = tags.length > 0 && selectedTags.every(Boolean);
  const allCheckItemsSelected =
    checkItems.length > 0 && selectedCheckItems.every(Boolean);
  const allTimeTracksSelected =
    timeTracks.length > 0 && selectedTimeTracks.every(Boolean);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="import-selection-dialog-title"
    >
      <DialogTitle id="import-selection-dialog-title">
        Import “{memo.name}”
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Title & description */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeDescription}
                  disabled={!hasDescription}
                  onChange={e => setIncludeDescription(e.target.checked)}
                />
              }
              label={
                hasDescription
                  ? 'Title & description'
                  : 'Title (no description in file)'
              }
            />
          </Box>

          {/* Tags */}
          {tags.length > 0 && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2">
                  Tags ({tags.length})
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={allTagsSelected}
                      indeterminate={
                        !allTagsSelected && selectedTags.some(Boolean)
                      }
                      onChange={e =>
                        setAll(setSelectedTags, tags.length, e.target.checked)
                      }
                    />
                  }
                  label="Select all"
                />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {tags.map((tag, i) => (
                  <Chip
                    key={`${tag}-${i}`}
                    label={tag}
                    color={selectedTags[i] ? 'primary' : 'default'}
                    variant={selectedTags[i] ? 'filled' : 'outlined'}
                    onClick={() => toggleAt(setSelectedTags, i)}
                    clickable
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Checklists */}
          {checkItems.length > 0 && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2">
                  Checklists ({checkItems.length})
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={allCheckItemsSelected}
                      indeterminate={
                        !allCheckItemsSelected &&
                        selectedCheckItems.some(Boolean)
                      }
                      onChange={e =>
                        setAll(
                          setSelectedCheckItems,
                          checkItems.length,
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Select all"
                />
              </Stack>
              <List dense disablePadding>
                {checkItems.map((item, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0 }}>
                    <FormControlLabel
                      sx={{ flex: 1 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedCheckItems[i]}
                          onChange={() => toggleAt(setSelectedCheckItems, i)}
                        />
                      }
                      label={
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ width: '100%' }}
                        >
                          <Typography variant="body2">{item.name}</Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {statusLabels[item.status] ?? item.status}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Time logs */}
          {timeTracks.length > 0 && (
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle2">
                  Time logs ({timeTracks.length})
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={allTimeTracksSelected}
                      indeterminate={
                        !allTimeTracksSelected &&
                        selectedTimeTracks.some(Boolean)
                      }
                      onChange={e =>
                        setAll(
                          setSelectedTimeTracks,
                          timeTracks.length,
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Select all"
                />
              </Stack>
              <List dense disablePadding>
                {timeTracks.map((track, i) => (
                  <ListItem key={i} disableGutters sx={{ py: 0 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={selectedTimeTracks[i]}
                          onChange={() => toggleAt(setSelectedTimeTracks, i)}
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {track.date} &nbsp; {track.startTime} &nbsp;{' '}
                          {track.durationMinutes}m
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
        <Divider sx={{ mt: 2 }} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary" disabled={isImporting}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={isImporting}
        >
          {isImporting ? 'Importing…' : 'Import selected'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
