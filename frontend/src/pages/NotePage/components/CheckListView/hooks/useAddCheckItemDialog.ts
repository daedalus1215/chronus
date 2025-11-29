import { useState } from "react";

type UseAddCheckItemDialogReturn = {
  isOpen: boolean;
  value: string;
  openDialog: () => void;
  closeDialog: () => void;
  changeValue: (value: string) => void;
  saveNew: (create: (value: string) => Promise<void>) => Promise<void>;
};

export const useAddCheckItemDialog = (): UseAddCheckItemDialogReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>("");

  const openDialog = () => {
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setValue("");
  };

  const changeValue = (newValue: string) => {
    setValue(newValue);
  };

  const saveNew = async (create: (newValue: string) => Promise<void>) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      closeDialog();
      return;
    }
    await create(trimmedValue);
    closeDialog();
  };

  return {
    isOpen,
    value,
    openDialog,
    closeDialog,
    changeValue,
    saveNew,
  };
};


