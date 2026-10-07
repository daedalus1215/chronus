import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type AddCheckItemDialogProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export const AddCheckItemDialog: React.FC<AddCheckItemDialogProps> = ({
  isOpen,
  value,
  onChange,
  onSave,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-sm" showCloseButton={false}>
      <DialogTitle className="sr-only">New Check Item</DialogTitle>
      <Input
        placeholder="New Check Item"
        value={value}
        autoComplete="off"
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onSave();
          }
        }}
        enterKeyHint="done"
        autoFocus
      />
      <Button onClick={onSave} className="float-right mt-4">
        Create
      </Button>
    </DialogContent>
  </Dialog>
);
