import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { navigationItems } from './navigation-items';
import styles from './DesktopSidebar.module.css';
import { useResizablePane } from '../../../hooks/useResizablePane';

type DesktopSidebarProps = {
  isOpen: boolean;
};

export const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
  const location = useLocation();
  const localStorageKey = 'sidebarWidthPx';
  const {
    size: width,
    setSize,
    startResizing,
    handleKeyDown,
  } = useResizablePane({
    localStorageKey,
    min: 0,
    max: 420,
    initial: 180,
    axis: 'x',
    step: 10,
    largeStep: 20,
    snapPoints: [0, 120, 180, 240, 320, 420],
    snapThreshold: 16,
  });

  const handleDoubleClickToggle = React.useCallback(() => {
    const next = width <= 4 ? 180 : 0;
    setSize(next);
    localStorage.setItem(localStorageKey, String(next));
  }, [localStorageKey, setSize, width]);

  return (
    <Box
      className={styles.sidebar}
      sx={{
        position: 'relative',
        width: `${width}px`,
        flex: '0 0 auto',
        minWidth: 0,
        padding: width < 80 ? '0.25rem' : '1rem',
      }}
    >
      {/* Header */}
      {/* <Box className={styles.header}> */}
      {/* <Link to="/" className={styles.brand}>
          <img src="/chronus-white.svg" alt="Logo" className={styles.logo} />
          {width >= 120 && (<span className={styles.name}>Chronus</span>)}
        </Link> */}
      {/* </Box> */}

      {/* Navigation Items */}
      <List className={styles.nav}>
        {navigationItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                sx={{
                  justifyContent: width < 120 ? 'center' : 'flex-start',
                  gap: width < 120 ? 0 : undefined,
                }}
              >
                <ListItemIcon
                  className={styles.navIcon}
                  sx={{
                    minWidth: width < 120 ? 0 : undefined,
                    justifyContent: 'center',
                  }}
                >
                  <item.icon />
                </ListItemIcon>
                {width >= 120 && (
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
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Resize handle */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        tabIndex={0}
        className={styles.resizeHandle}
        onMouseDown={startResizing}
        onPointerDown={startResizing}
        onKeyDown={handleKeyDown}
        onDoubleClick={handleDoubleClickToggle}
      />
    </Box>
  );
};
