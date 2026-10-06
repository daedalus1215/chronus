import React from 'react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

type BottomSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  // Optionally, add a maxHeight or custom className prop if you want
};

export const BottomSheet: React.FC<BottomSheetProps> = ({
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
      side="bottom"
      showCloseButton={false}
      className="max-h-[80vh] gap-0 rounded-t-2xl p-0"
    >
      <SheetTitle className="sr-only">Details</SheetTitle>
      <div className="p-4">{children}</div>
    </SheetContent>
  </Sheet>
);
