import { useState } from "react";

type UseCheckItemEditDialogReturn = {
  isOpen: boolean;
  editItemId: number | null;
  editItemValue: string;
  openDialog: (id: number, currentName: string) => void;
  closeDialog: () => void;
  changeValue: (value: string) => void;
  saveEdit: (update: (id: number, value: string) => Promise<void>) => Promise<void>;
};

export const useCheckItemEditDialog = (): UseCheckItemEditDialogReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemValue, setEditItemValue] = useState<string>("");

  const openDialog = (id: number, currentName: string) => {
    setEditItemId(id);
    setEditItemValue(currentName);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setEditItemId(null);
    setEditItemValue("");
  };

  const changeValue = (value: string) => {
    setEditItemValue(value);
  };

  const saveEdit = async (update: (id: number, value: string) => Promise<void>) => {
    if (editItemId == null) {
      return;
    }
    const trimmedValue = editItemValue.trim();
    if (!trimmedValue) {
      closeDialog();
      return;
    }
    await update(editItemId, trimmedValue);
    closeDialog();
  };

  return {
    isOpen,
    editItemId,
    editItemValue,
    openDialog,
    closeDialog,
    changeValue,
    saveEdit,
  };
};


