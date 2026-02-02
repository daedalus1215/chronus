import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import styles from './RightSidebar.module.css';

type RightSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      aria-hidden={!isOpen}
      role="complementary"
    >
      <Box className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-overlay-stronger)]">
        <Typography
          variant="body2"
          component="h2"
          sx={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          {title}
        </Typography>
        {/* <IconButton
          size="small"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton> */}
      </Box>
      <div className={styles.content}>{children}</div>
    </aside>
  );
};
