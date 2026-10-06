import React from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

type RightSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export const RightSheet: React.FC<RightSheetProps> = ({
  isOpen,
  onClose,
  children,
}) => (
  <Sheet
    open={isOpen}
    onOpenChange={(open) => {
      if (!open) onClose();
    }}
  >
    <SheetContent
      side="right"
      showCloseButton={false}
      className="w-80 gap-0 overflow-y-auto p-4 sm:max-w-80"
    >
      <SheetTitle className="sr-only">Details</SheetTitle>
      {children}
    </SheetContent>
  </Sheet>
);
