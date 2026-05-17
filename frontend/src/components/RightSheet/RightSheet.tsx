import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';

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
  <Drawer
    anchor="right"
    open={isOpen}
    onClose={onClose}
    ModalProps={{
      keepMounted: true,
    }}
  >
    <Box
      sx={{
        width: 320,
        height: '100%',
        p: 2,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </Box>
  </Drawer>
);
