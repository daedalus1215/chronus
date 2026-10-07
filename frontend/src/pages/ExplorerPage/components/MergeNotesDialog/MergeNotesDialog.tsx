import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Merge {notes.length} Notes</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto border-y border-border px-6 py-4">
          {/* Target selection */}
          <div>
            <Label className="mb-2 block text-sm font-medium">
              Select Primary Note (target)
            </Label>
            <RadioGroup
              value={String(targetNoteId)}
              onValueChange={v => setTargetNoteId(Number(v))}
            >
              {notes.map(note => (
                <Label
                  key={note.id}
                  htmlFor={`merge-target-${note.id}`}
                  className="flex items-center gap-2 font-normal"
                >
                  <RadioGroupItem value={String(note.id)} id={`merge-target-${note.id}`} />
                  <span className="flex items-center gap-2">
                    <span>{note.name}</span>
                    <Badge variant="outline">{note.isMemo ? 'memo' : 'checklist'}</Badge>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-1 text-xs text-muted-foreground">
              The primary note keeps its title, folder, and creation date. Other
              notes will be archived.
            </p>
          </div>

          {/* Warning about audio deletion */}
          <Alert>
            <AlertDescription>
              Audio files from source notes will be deleted (not moved to the
              target).
            </AlertDescription>
          </Alert>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Source content selection */}
          {sourceNotes.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-semibold">
                Select content to merge from each note
              </p>
              <div className="space-y-4">
                {sourceNotes.map(note => (
                  <div key={note.id} className="rounded-md border border-border p-4">
                    <p className="mb-2 text-sm font-semibold">{note.name}</p>

                    {/* Description */}
                    {note.description?.trim() && (
                      <div className="mb-4">
                        <Label className="flex items-center gap-2 font-normal">
                          <Checkbox
                            checked={selectedDescriptions.has(note.id)}
                            onCheckedChange={() => handleToggleDescription(note.id)}
                          />
                          Description
                        </Label>
                        <p className="ml-6 max-h-[60px] overflow-hidden text-ellipsis text-xs text-muted-foreground">
                          {note.description.substring(0, 150)}
                          {note.description.length > 150 ? '...' : ''}
                        </p>
                      </div>
                    )}

                    {/* Tags */}
                    {note.tags.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Tags ({note.tags.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {note.tags.map(tag => (
                            <Badge
                              key={tag}
                              variant={selectedTags.get(note.id)?.has(tag) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => handleToggleTag(note.id, tag)}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Check items */}
                    {note.checkItems.length > 0 && (
                      <div className="mb-4">
                        <p className="mb-1 text-xs text-muted-foreground">
                          Check items ({note.checkItems.length})
                        </p>
                        <div>
                          {note.checkItems.map((item, i) => (
                            <Label
                              key={i}
                              className="flex items-center gap-2 py-0.5 font-normal"
                            >
                              <Checkbox
                                checked={selectedCheckItems.get(note.id)?.has(i) ?? false}
                                onCheckedChange={() => handleToggleCheckItem(note.id, i)}
                              />
                              <span className="flex items-center gap-2 text-sm">
                                <span>{item.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {statusLabels[item.status]}
                                </span>
                              </span>
                            </Label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Time tracks */}
                    {note.timeTracks.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs text-muted-foreground">
                          Time tracks ({note.timeTracks.length})
                        </p>
                        <div>
                          {note.timeTracks.map((track, i) => (
                            <Label
                              key={i}
                              className="flex items-center gap-2 py-0.5 font-normal"
                            >
                              <Checkbox
                                checked={selectedTimeTracks.get(note.id)?.has(i) ?? false}
                                onCheckedChange={() => handleToggleTimeTrack(note.id, i)}
                              />
                              <span className="text-sm">
                                {track.date} {track.startTime} {track.durationMinutes}m
                                {track.note && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge className="ml-2">note</Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>{track.note}</TooltipContent>
                                  </Tooltip>
                                )}
                              </span>
                            </Label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isMerging}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isMerging || !hasSelection}>
            {isMerging ? 'Merging…' : 'Merge notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
