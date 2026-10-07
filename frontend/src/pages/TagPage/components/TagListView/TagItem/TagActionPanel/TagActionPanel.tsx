import React, { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tag } from '@/api/dtos/tag.dtos';
import {
  fetchTagById,
  updateTag,
  deleteTag,
} from '@/api/requests/tags.requests';
import { TagActionGrid } from '../TagActionGrid/TagActionGrid';
import { TagForm, FormInitialData } from '../TagActionGrid/TagForm/TagForm';

type TagActionPanelProps = {
  tag: Tag;
  isOpen: boolean;
  onClose: () => void;
};

const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (!err || typeof err !== 'object' || !('response' in err)) {
    return fallback;
  }
  const response = err.response;
  if (!response || typeof response !== 'object' || !('data' in response)) {
    return fallback;
  }
  const data = response.data;
  if (!data || typeof data !== 'object' || !('message' in data)) {
    return fallback;
  }
  const message = data.message;
  return typeof message === 'string' ? message : fallback;
};

/**
 * Tag management surface: the ⋮ action grid (Edit / Delete), the edit form,
 * and the delete confirmation dialog. Shared by the flat tag list (TagItem)
 * and the tag tree rows (CustomTagTreeItem). The parent owns `isOpen` for
 * the action grid via its own trigger button.
 */
export const TagActionPanel: React.FC<TagActionPanelProps> = ({
  tag,
  isOpen,
  onClose,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: fullTag, isLoading: isLoadingTag } = useQuery<Tag>({
    queryKey: ['tag', tag.id],
    queryFn: () => fetchTagById(tag.id),
    enabled: isFormOpen, // Only fetch when form is open
  });

  const updateTagMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      updateTag(tag.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', tag.id] });
      setUpdateError(null);
      setIsFormOpen(false);
      onClose();
    },
    onError: (err: unknown) => {
      setUpdateError(getApiErrorMessage(err, 'Failed to update tag'));
    },
  });

  const handleEdit = () => {
    setUpdateError(null);
    setIsFormOpen(true);
  };

  const handleDelete = () => {
    setDeleteError(null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteTag(tag.id);
      queryClient.invalidateQueries({ queryKey: ['tags'] });
      queryClient.invalidateQueries({ queryKey: ['tag', tag.id] });
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete tag'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSubmit = (data: FormInitialData) => {
    updateTagMutation.mutate({
      name: data.name,
      description: data.description,
    });
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setUpdateError(null);
  };

  // Memoize initialData to prevent unnecessary re-renders
  const formInitialData = useMemo<FormInitialData>(
    () => ({
      name: fullTag?.name || tag.name,
      description: fullTag?.description || tag.description || '',
    }),
    [fullTag?.name, fullTag?.description, tag.name, tag.description]
  );

  return (
    <>
      <TagActionGrid
        isOpen={isOpen}
        onClose={onClose}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TagForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        initialData={formInitialData}
        isSubmitting={updateTagMutation.isPending || isLoadingTag}
        error={updateError}
      />

      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Tag?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this tag? This action cannot be
            undone.
          </p>
          {tag.noteCount > 0 && (
            <p className="text-sm text-muted-foreground">
              This tag is attached to {tag.noteCount}{' '}
              {tag.noteCount === 1 ? 'note' : 'notes'} — they keep everything
              else, only the tag is removed.
            </p>
          )}
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
