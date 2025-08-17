import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { navigationItems } from './navigation-items';
import styles from './DesktopSidebar.module.css';

type DesktopSidebarProps = {
  isOpen: boolean;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
  const location = useLocation();

  return (
    <Box className={styles.sidebar}>
      {/* Header */}
      <Box className={styles.header}>
        <Link to="/" className={styles.brand}>
          <img src="/chronus-white.svg" alt="Logo" className={styles.logo} />
          <span className={styles.name}>Chronus</span>
        </Link>
      </Box>

      {/* Navigation Items */}
      <List className={styles.nav}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <ListItemIcon className={styles.navIcon}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : '#9ca3af',
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};