import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

  const selectAllState = (
    all: boolean,
    some: boolean[]
  ): boolean | 'indeterminate' => (all ? true : some.some(Boolean) ? 'indeterminate' : false);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-md">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Import &ldquo;{memo.name}&rdquo; into this memo</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto border-y border-border px-6 py-4">
          {/* Description (replace) */}
          {hasDescription && (
            <div>
              <Label className="flex items-center gap-2 font-normal">
                <Checkbox
                  checked={replaceDescription}
                  onCheckedChange={(checked) => setReplaceDescription(checked === true)}
                />
                Replace description
              </Label>
              <p className="ml-6 text-xs text-muted-foreground">
                Overwrites this memo&rsquo;s current description.
              </p>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Tags ({tags.length})</p>
                <Label className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox
                    checked={selectAllState(allTagsSelected, selectedTags)}
                    onCheckedChange={(checked) =>
                      setAll(setSelectedTags, tags.length, checked === true)
                    }
                  />
                  Select all
                </Label>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <Badge
                    key={`${tag}-${i}`}
                    variant={selectedTags[i] ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleAt(setSelectedTags, i)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Checklists */}
          {checkItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Checklists ({checkItems.length})
                </p>
                <Label className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox
                    checked={selectAllState(allCheckItemsSelected, selectedCheckItems)}
                    onCheckedChange={(checked) =>
                      setAll(setSelectedCheckItems, checkItems.length, checked === true)
                    }
                  />
                  Select all
                </Label>
              </div>
              <div className="mt-1">
                {checkItems.map((item, i) => (
                  <Label
                    key={i}
                    className="flex items-center gap-2 py-0.5 font-normal"
                  >
                    <Checkbox
                      checked={selectedCheckItems[i]}
                      onCheckedChange={() => toggleAt(setSelectedCheckItems, i)}
                    />
                    <span className="flex items-center gap-2 text-sm">
                      <span>{item.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {statusLabels[item.status] ?? item.status}
                      </span>
                    </span>
                  </Label>
                ))}
              </div>
            </div>
          )}

          {/* Time logs */}
          {timeTracks.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Time logs ({timeTracks.length})
                </p>
                <Label className="flex items-center gap-2 text-sm font-normal">
                  <Checkbox
                    checked={selectAllState(allTimeTracksSelected, selectedTimeTracks)}
                    onCheckedChange={(checked) =>
                      setAll(setSelectedTimeTracks, timeTracks.length, checked === true)
                    }
                  />
                  Select all
                </Label>
              </div>
              <div className="mt-1">
                {timeTracks.map((track, i) => (
                  <Label
                    key={i}
                    className="flex items-center gap-2 py-0.5 font-normal"
                  >
                    <Checkbox
                      checked={selectedTimeTracks[i]}
                      onCheckedChange={() => toggleAt(setSelectedTimeTracks, i)}
                    />
                    <span className="flex items-center gap-2 text-sm">
                      <span>
                        {track.date} &nbsp; {track.startTime} &nbsp;{' '}
                        {track.durationMinutes}m
                      </span>
                      {duplicateFlags[i] && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className="border-[var(--color-warning)] text-[var(--color-warning-dark)]"
                            >
                              possible duplicate
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            A matching log already exists on this memo
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </span>
                  </Label>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isMerging}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isMerging || nothingSelected}
          >
            {isMerging ? 'Importing…' : 'Import selected'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
