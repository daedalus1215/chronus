import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import api from '../../../../api/axios.interceptor';
import Fuse from 'fuse.js';

export type Tag = { id: string; name: string };

export type AddTagFormProps = {
  noteId: number;
  tags: Tag[];
  onTagAdded: () => void;
  onClose?: () => void; // optional — only used in dialog mode
};

export const AddTagForm: React.FC<AddTagFormProps> = ({
  noteId,
  tags,
  onTagAdded,
  onClose,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Set up fuzzy search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(tags, {
        keys: ['name'],
        threshold: 0.3, // 0 = exact match, 1 = match anything
        ignoreLocation: true,
        includeScore: true,
      }),
    [tags]
  );

  // Filter tags based on input using fuzzy search
  const filteredTags = useMemo(() => {
    if (!newTagName.trim()) {
      return tags;
    }
    const results = fuse.search(newTagName);
    return results.map(result => result.item);
  }, [fuse, newTagName, tags]);

  // Reset selected index when filtered tags change
  useEffect(() => {
    setSelectedIndex(-1);
    tagRefs.current = [];
  }, [filteredTags]);

  // Scroll selected tag into view
  useEffect(() => {
    if (selectedIndex >= 0 && tagRefs.current[selectedIndex]) {
      tagRefs.current[selectedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTagName(e.target.value);
    setError(null);
  };

  const handleKeyNavigation = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only handle navigation if there are filtered tags
    if (filteredTags.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredTags.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredTags.length) {
          handleAddExistingTag(filteredTags[selectedIndex].id);
        } else {
          handleAddTag();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(-1);
        break;
    }
  };

  const handleAddTag = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newTagName.trim()) {
      setError('Tag name cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/notes/${noteId}/add-tag`, {
        tagName: newTagName,
        noteId,
      });
      setNewTagName('');
      onTagAdded();
    } catch (err: unknown) {
      let message = 'Failed to add tag. Please try again.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === 'string'
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExistingTag = async (tagId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.patch(`/notes/${noteId}/add-tag`, { tagId, noteId });
      onTagAdded();
    } catch (err: unknown) {
      let message = 'Failed to add tag. Please try again.';
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        err.response &&
        typeof err.response === 'object' &&
        'data' in err.response &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        'message' in err.response.data &&
        typeof (err.response.data as { message?: unknown }).message === 'string'
      ) {
        message = (err.response.data as { message: string }).message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleAddTag}
      aria-label="Add tag to note"
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="mb-4 flex items-center gap-2">
        <Label htmlFor="add-tag-name" className="sr-only">
          New tag name
        </Label>
        <Input
          id="add-tag-name"
          ref={inputRef}
          value={newTagName}
          onChange={handleInputChange}
          placeholder="Enter tag name or use ↑↓ to navigate"
          className="flex-1"
          autoFocus
          aria-label="New tag name"
          disabled={isLoading}
          onKeyDown={handleKeyNavigation}
        />
        <Button
          type="submit"
          disabled={isLoading || !newTagName.trim()}
          aria-label="Add tag"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : 'Add'}
        </Button>
        {onClose && (
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            aria-label="Close add tag form"
          >
            Close
          </Button>
        )}
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex-1 overflow-y-auto" aria-label="Tag list">
        {filteredTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-sm text-muted-foreground">
              {newTagName.trim()
                ? `No tags found matching "${newTagName}"`
                : 'No tags available'}
            </span>
            {newTagName.trim() && (
              <span className="mt-1 text-xs text-muted-foreground">
                Press "Add" to create a new tag
              </span>
            )}
          </div>
        ) : (
          <div
            role="list"
            className="flex flex-row flex-wrap gap-2 py-2"
            aria-label="Available tags"
          >
            {filteredTags.map((tag, index) => (
              <Tooltip key={tag.id}>
                <TooltipTrigger asChild>
                  <div
                    ref={(el: HTMLDivElement | null) => {
                      tagRefs.current[index] = el;
                    }}
                  >
                    <Badge
                      role="listitem"
                      variant={selectedIndex === index ? 'default' : 'outline'}
                      tabIndex={0}
                      aria-label={`Add tag: ${tag.name}`}
                      aria-selected={selectedIndex === index}
                      onClick={() => !isLoading && handleAddExistingTag(tag.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleAddExistingTag(tag.id);
                      }}
                      className={cn(
                        'cursor-pointer border-primary text-primary',
                        selectedIndex === index &&
                          'scale-105 border-primary bg-primary text-primary-foreground transition-all',
                        isLoading && 'pointer-events-none opacity-50'
                      )}
                    >
                      {tag.name}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>{tag.name}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};
