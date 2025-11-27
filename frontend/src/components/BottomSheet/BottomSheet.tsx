import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";

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
  <Drawer
    anchor="bottom"
    open={isOpen}
    onClose={(_event, reason) => {
      // Only close on escape key - ignore backdrop clicks to prevent accidental closes
      // This prevents the drawer from closing when typing in inputs or when focus changes
      if (reason === 'escapeKeyDown') {
        onClose();
      }
      // Explicitly ignore backdrop clicks and other reasons to prevent issues
    }}
    slotProps={{
      paper: {
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "80vh",
          margin: "10 auto",
        },
        onClick: (e: React.MouseEvent) => {
          // Prevent clicks inside the drawer paper from closing it
          e.stopPropagation();
        },
        onTouchStart: (e: React.TouchEvent) => {
          // Prevent touch events inside drawer from propagating
          e.stopPropagation();
        },
      },
    }}
  >
    <Box 
      sx={{ p: 2 }}
      onClick={(e: React.MouseEvent) => {
        // Prevent clicks inside content from propagating
        e.stopPropagation();
      }}
      onTouchStart={(e: React.TouchEvent) => {
        // Prevent touch events inside content from propagating
        e.stopPropagation();
      }}
    >
      {children}
    </Box>
  </Drawer>
);
