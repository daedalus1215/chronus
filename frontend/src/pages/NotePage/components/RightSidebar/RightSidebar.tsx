import React from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import styles from './RightSidebar.module.css';

type Tab = {
  id: string;
  label: string;
  icon?: React.ReactNode;
};

type RightSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  onClose,
  title,
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      aria-hidden={!isOpen}
      role="complementary"
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1,
          borderBottom: '1px solid var(--color-overlay-stronger)',
        }}
      >
        {title && (
          <Typography
            variant="body2"
            component="h2"
            sx={{ fontSize: '0.875rem', fontWeight: 600 }}
          >
            {title}
          </Typography>
        )}
        <IconButton
          size="small"
          aria-label="Close sidebar"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      {tabs && activeTab && onTabChange && (
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_, value) => {
            if (value) onTabChange(value);
          }}
          sx={{
            borderBottom: '1px solid var(--color-overlay-stronger)',
            '& .Mui-selected': {
              backgroundColor: 'rgba(99,102,241,0.12)',
              color: 'primary.main',
            },
          }}
        >
          {tabs.map(tab => (
            <ToggleButton
              key={tab.id}
              value={tab.id}
              sx={{
                fontSize: '0.8125rem',
                textTransform: 'none',
                py: 0.75,
                px: 1.5,
              }}
            >
              {tab.icon}
              {tab.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
      <div className={styles.content}>{children}</div>
    </aside>
  );
};
