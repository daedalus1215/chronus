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
  Box,
  List,
  ListItem,
  Tooltip,
} from '@mui/material';
import { ParsedMemo } from '../ImportSelectionDialog/ImportSelectionDialog';
import { MergeIntoNoteData } from '../../hooks/useMergeIntoNote';

type ExistingTimeTrack = {
  date: string;
  startTime: string;
  durationMinutes: number;
};

type MergeSelectionDialogProps = {
  open: boolean;
  memo: ParsedMemo;
  version: number;
  /** The target memo's current time logs, used to flag possible duplicates. */
  existingTimeTracks: ExistingTimeTrack[];
  isMerging?: boolean;
  onCancel: () => void;
  onConfirm: (payload: MergeIntoNoteData) => void;
};

const statusLabels: Record<string, string> = {
  ready: 'ready',
  in_progress: 'in progress',
  review: 'review',
  done: 'done',
};

const timeTrackKey = (t: ExistingTimeTrack) =>
  `${t.date}|${t.startTime}|${t.durationMinutes}`;

export const MergeSelectionDialog: React.FC<MergeSelectionDialogProps> = ({
  open,
  memo,
  version,
  existingTimeTracks,
  isMerging,
  onCancel,
  onConfirm,
}) => {
  const tags = useMemo(() => memo.tags ?? [], [memo.tags]);
  const checkItems = useMemo(() => memo.checkItems ?? [], [memo.checkItems]);
  const timeTracks = useMemo(() => memo.timeTracks ?? [], [memo.timeTracks]);

  const hasDescription = !!memo.description?.trim();

  // Which incoming time logs already exist on the target memo.
  const existingKeys = useMemo(
    () => new Set(existingTimeTracks.map(timeTrackKey)),
    [existingTimeTracks]
  );
  const duplicateFlags = useMemo(
    () => timeTracks.map(t => existingKeys.has(timeTrackKey(t))),
    [timeTracks, existingKeys]
  );

  // Description replace is opt-in (overwrites the existing memo body).
  const [replaceDescription, setReplaceDescription] = useState(false);
  const [selectedTags, setSelectedTags] = useState<boolean[]>(() =>
    tags.map(() => true)
  );
  const [selectedCheckItems, setSelectedCheckItems] = useState<boolean[]>(() =>
    checkItems.map(() => true)
  );
  // Possible duplicates start unchecked; the user can opt them back in.
  const [selectedTimeTracks, setSelectedTimeTracks] = useState<boolean[]>(() =>
    timeTracks.map((_, i) => !duplicateFlags[i])
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
    const payload: MergeIntoNoteData = { version };

    if (replaceDescription && hasDescription) {
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

  const nothingSelected =
    !replaceDescription &&
    !selectedTags.some(Boolean) &&
    !selectedCheckItems.some(Boolean) &&
    !selectedTimeTracks.some(Boolean);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      aria-labelledby="merge-selection-dialog-title"
    >
      <DialogTitle id="merge-selection-dialog-title">
        Import “{memo.name}” into this memo
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {/* Description (replace) */}
          {hasDescription && (
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={replaceDescription}
                    onChange={e => setReplaceDescription(e.target.checked)}
                  />
                }
                label="Replace description"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', ml: 4 }}
              >
                Overwrites this memo’s current description.
              </Typography>
            </Box>
          )}

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
                          <Typography variant="caption" color="text.secondary">
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
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2">
                            {track.date} &nbsp; {track.startTime} &nbsp;{' '}
                            {track.durationMinutes}m
                          </Typography>
                          {duplicateFlags[i] && (
                            <Tooltip title="A matching log already exists on this memo">
                              <Chip
                                label="possible duplicate"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="secondary" disabled={isMerging}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={isMerging || nothingSelected}
        >
          {isMerging ? 'Importing…' : 'Import selected'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
