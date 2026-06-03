import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import styles from './RightSidebar.module.css';

type Tab = {
  id: string;
  icon: React.ReactNode;
};

type RightSidebarProps = {
  isOpen: boolean;
  title?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
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
      {tabs && activeTab && onTabChange && (
        <ToggleButtonGroup
          value={activeTab}
          exclusive
          onChange={(_, value) => {
            if (value) onTabChange(value);
          }}
          sx={{
            borderBottom: '1px solid var(--color-overlay-stronger)',
            '& .MuiToggleButtonGroup-grouped': {
              margin: 0,
              border: 0,
              borderRadius: 0,
            },
            '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
              borderLeft: '1px solid var(--color-overlay-stronger)',
            },
            '& .MuiToggleButtonGroup-grouped:hover': {
              borderLeftColor: 'var(--color-overlay-stronger)',
            },
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
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
      <div className={styles.content}>{children}</div>
    </aside>
  );
};
