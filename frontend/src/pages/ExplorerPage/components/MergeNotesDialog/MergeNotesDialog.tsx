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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Alert,
} from '@mui/material';
import { SourceNoteSelection } from '../../hooks/useMergeNotes';

export type NoteToMerge = {
  id: number;
  name: string;
  isMemo: boolean;
  description?: string;
  tags: string[];
  checkItems: Array<{
    name: string;
    description?: string | null;
    status: 'ready' | 'in_progress' | 'review' | 'done';
    order: number;
    doneDate?: string | null;
    archiveDate?: string | null;
  }>;
  timeTracks: Array<{
    date: string;
    startTime: string;
    durationMinutes: number;
    note?: string;
  }>;
};

type MergeNotesDialogProps = {
  open: boolean;
  notes: NoteToMerge[];
  isMerging?: boolean;
  error?: string | null;
  onCancel: () => void;
  onConfirm: (targetNoteId: number, sources: SourceNoteSelection[]) => void;
};

const statusLabels: Record<string, string> = {
  ready: 'ready',
  in_progress: 'in progress',
  review: 'review',
  done: 'done',
};

export const MergeNotesDialog: React.FC<MergeNotesDialogProps> = ({
  open,
  notes,
  isMerging,
  error,
  onCancel,
  onConfirm,
}) => {
  // Target selection (primary note)
  const [targetNoteId, setTargetNoteId] = useState<number>(
    () => notes[0]?.id ?? 0
  );

  // Selection states for each source note's content
  const [selectedDescriptions, setSelectedDescriptions] = useState<Set<number>>(
    () => {
      const hasDescription = notes
        .filter(n => n.description?.trim())
        .map(n => n.id);
      return new Set(hasDescription);
    }
  );

  const [selectedTags, setSelectedTags] = useState<Map<number, Set<string>>>(
    () => {
      const map = new Map<number, Set<string>>();
      notes.forEach(note => {
        if (note.tags.length > 0) {
          map.set(note.id, new Set(note.tags));
        }
      });
      return map;
    }
  );

  const [selectedCheckItems, setSelectedCheckItems] = useState<
    Map<number, Set<number>>
  >(() => {
    const map = new Map<number, Set<number>>();
    notes.forEach(note => {
      if (note.checkItems.length > 0) {
        map.set(note.id, new Set(note.checkItems.map((_, i) => i)));
      }
    });
    return map;
  });

  const [selectedTimeTracks, setSelectedTimeTracks] = useState<
    Map<number, Set<number>>
  >(() => {
    const map = new Map<number, Set<number>>();
    notes.forEach(note => {
      if (note.timeTracks.length > 0) {
        map.set(note.id, new Set(note.timeTracks.map((_, i) => i)));
      }
    });
    return map;
  });

  // Filter out target from sources
  const sourceNotes = useMemo(
    () => notes.filter(n => n.id !== targetNoteId),
    [notes, targetNoteId]
  );

  const handleToggleDescription = (noteId: number) => {
    setSelectedDescriptions(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  };

  const handleToggleTag = (noteId: number, tag: string) => {
    setSelectedTags(prev => {
      const next = new Map(prev);
      const current = new Set(next.get(noteId) ?? []);
      if (current.has(tag)) current.delete(tag);
      else current.add(tag);
      next.set(noteId, current);
      return next;
    });
  };

  const handleToggleCheckItem = (noteId: number, index: number) => {
    setSelectedCheckItems(prev => {
      const next = new Map(prev);
      const current = new Set(next.get(noteId) ?? []);
      if (current.has(index)) current.delete(index);
      else current.add(index);
      next.set(noteId, current);
      return next;
    });
  };

  const handleToggleTimeTrack = (noteId: number, index: number) => {
    setSelectedTimeTracks(prev => {
      const next = new Map(prev);
      const current = new Set(next.get(noteId) ?? []);
      if (current.has(index)) current.delete(index);
      else current.add(index);
      next.set(noteId, current);
      return next;
    });
  };

  const handleConfirm = () => {
    const sources: SourceNoteSelection[] = sourceNotes.map(note => {
      const selection: SourceNoteSelection = {
        noteId: note.id,
        name: note.name,
      };

      if (selectedDescriptions.has(note.id) && note.description) {
        selection.description = note.description;
      }

      const selectedNoteTags = selectedTags.get(note.id);
      if (selectedNoteTags && selectedNoteTags.size > 0) {
        selection.tags = note.tags.filter(t => selectedNoteTags.has(t));
      }

      const selectedNoteCheckItems = selectedCheckItems.get(note.id);
      if (selectedNoteCheckItems && selectedNoteCheckItems.size > 0) {
        selection.checkItems = note.checkItems.filter((_, i) =>
          selectedNoteCheckItems.has(i)
        );
      }

      const selectedNoteTimeTracks = selectedTimeTracks.get(note.id);
      if (selectedNoteTimeTracks && selectedNoteTimeTracks.size > 0) {
        selection.timeTracks = note.timeTracks.filter((_, i) =>
          selectedNoteTimeTracks.has(i)
        );
      }

      return selection;
    });

    onConfirm(targetNoteId, sources);
  };

  // Check if anything is selected
  const hasSelection = sourceNotes.some(note => {
    if (selectedDescriptions.has(note.id) && note.description) return true;
    if ((selectedTags.get(note.id)?.size ?? 0) > 0) return true;
    if ((selectedCheckItems.get(note.id)?.size ?? 0) > 0) return true;
    if ((selectedTimeTracks.get(note.id)?.size ?? 0) > 0) return true;
    return false;
  });

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="merge-notes-dialog-title"
    >
      <DialogTitle id="merge-notes-dialog-title">
        Merge {notes.length} Notes
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Target selection */}
          <Box>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">
                Select Primary Note (target)
              </FormLabel>
              <RadioGroup
                value={targetNoteId}
                onChange={e => setTargetNoteId(Number(e.target.value))}
              >
                {notes.map(note => (
                  <FormControlLabel
                    key={note.id}
                    value={note.id}
                    control={<Radio />}
                    label={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography>{note.name}</Typography>
                        <Chip
                          size="small"
                          label={note.isMemo ? 'memo' : 'checklist'}
                          variant="outlined"
                        />
                      </Stack>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mt: 1, display: 'block' }}
            >
              The primary note keeps its title, folder, and creation date. Other
              notes will be archived.
            </Typography>
          </Box>

          {/* Warning about audio deletion */}
          <Alert severity="info" sx={{ fontSize: 13 }}>
            Audio files from source notes will be deleted (not moved to the
            target).
          </Alert>

          {/* Error display */}
          {error && (
            <Alert severity="error" sx={{ fontSize: 13 }}>
              {error}
            </Alert>
          )}

          {/* Source content selection */}
          {sourceNotes.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select content to merge from each note
              </Typography>
              <Stack spacing={2}>
                {sourceNotes.map(note => (
                  <Box
                    key={note.id}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {note.name}
                    </Typography>

                    {/* Description */}
                    {note.description?.trim() && (
                      <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedDescriptions.has(note.id)}
                              onChange={() => handleToggleDescription(note.id)}
                            />
                          }
                          label="Description"
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            ml: 4,
                            maxHeight: 60,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {note.description.substring(0, 150)}
                          {note.description.length > 150 ? '...' : ''}
                        </Typography>
                      </Box>
                    )}

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          Tags ({note.tags.length})
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {note.tags.map(tag => (
                            <Chip
                              key={tag}
                              label={tag}
                              size="small"
                              color={
                                selectedTags.get(note.id)?.has(tag)
                                  ? 'primary'
                                  : 'default'
                              }
                              variant={
                                selectedTags.get(note.id)?.has(tag)
                                  ? 'filled'
                                  : 'outlined'
                              }
                              onClick={() => handleToggleTag(note.id, tag)}
                              clickable
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Check items */}
                    {note.checkItems.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          Check items ({note.checkItems.length})
                        </Typography>
                        <List dense disablePadding>
                          {note.checkItems.map((item, i) => (
                            <ListItem key={i} disableGutters sx={{ py: 0 }}>
                              <FormControlLabel
                                sx={{ flex: 1 }}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={
                                      selectedCheckItems.get(note.id)?.has(i) ??
                                      false
                                    }
                                    onChange={() =>
                                      handleToggleCheckItem(note.id, i)
                                    }
                                  />
                                }
                                label={
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    <Typography variant="body2">
                                      {item.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {statusLabels[item.status]}
                                    </Typography>
                                  </Stack>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}

                    {/* Time tracks */}
                    {note.timeTracks.length > 0 && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          Time tracks ({note.timeTracks.length})
                        </Typography>
                        <List dense disablePadding>
                          {note.timeTracks.map((track, i) => (
                            <ListItem key={i} disableGutters sx={{ py: 0 }}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={
                                      selectedTimeTracks.get(note.id)?.has(i) ??
                                      false
                                    }
                                    onChange={() =>
                                      handleToggleTimeTrack(note.id, i)
                                    }
                                  />
                                }
                                label={
                                  <Typography variant="body2">
                                    {track.date} {track.startTime}{' '}
                                    {track.durationMinutes}m
                                    {track.note && (
                                      <Tooltip title={track.note}>
                                        <Chip
                                          label="note"
                                          size="small"
                                          sx={{ ml: 1 }}
                                        />
                                      </Tooltip>
                                    )}
                                  </Typography>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
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
          disabled={isMerging || !hasSelection}
        >
          {isMerging ? 'Merging…' : 'Merge notes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
