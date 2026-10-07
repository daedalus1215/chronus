import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type EditCheckItemDialogProps = {
  isOpen: boolean;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export const EditCheckItemDialog: React.FC<EditCheckItemDialogProps> = ({
  isOpen,
  value,
  onChange,
  onSave,
  onClose,
}) => (
  <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="sm:max-w-sm" showCloseButton={false}>
      <DialogTitle className="sr-only">Edit Check Item</DialogTitle>
      <Input
        placeholder="Edit Check Item"
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
        Save
      </Button>
    </DialogContent>
  </Dialog>
);
