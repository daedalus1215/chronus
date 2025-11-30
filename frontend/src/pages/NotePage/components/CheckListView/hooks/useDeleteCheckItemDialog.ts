import { useState } from 'react';

type UseDeleteCheckItemDialogReturn = {
  isOpen: boolean;
  targetId: number | null;
  isDeleting: boolean;
  error: string | null;
  openDialog: (id: number) => void;
  closeDialog: () => void;
  confirmDelete: (remove: (id: number) => Promise<void>) => Promise<void>;
};

export const useDeleteCheckItemDialog = (): UseDeleteCheckItemDialogReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = (id: number) => {
    setTargetId(id);
    setIsOpen(true);
    setError(null);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setTargetId(null);
    setError(null);
  };

  const confirmDelete = async (remove: (id: number) => Promise<void>) => {
    if (targetId == null) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await remove(targetId);
      setIsDeleting(false);
      closeDialog();
    } catch (err: unknown) {
      setIsDeleting(false);
      let message = 'Failed to delete check item';
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
    }
  };

  return {
    isOpen,
    targetId,
    isDeleting,
    error,
    openDialog,
    closeDialog,
    confirmDelete,
  };
};
