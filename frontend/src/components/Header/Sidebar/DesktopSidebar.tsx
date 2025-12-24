import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import Fade from '@mui/material/Fade';
import { navigationItems } from './navigation-items';
import styles from './DesktopSidebar.module.css';

type DesktopSidebarProps = {
  isOpen: boolean;
};

export const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
  const location = useLocation();
  const fixedWidth = 85;

  return (
    <Box
      className={styles.sidebar}
      sx={{
        position: 'relative',
        width: `${fixedWidth}px`,
        flex: '0 0 auto',
        minWidth: 0,
        padding: '0.25rem',
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
        {navigationItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Fade
              key={item.path}
              in={true}
              timeout={300}
              style={{
                transitionDelay: `${Math.min(index * 50, 300)}ms`,
              }}
            >
              <ListItem disablePadding>
                <Tooltip title={item.label} placement="right" arrow>
                  <ListItemButton
                    component={Link}
                    to={item.path}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                    sx={{
                      justifyContent: 'center',
                    }}
                  >
                    <ListItemIcon
                      className={styles.navIcon}
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                      }}
                    >
                      <item.icon />
                    </ListItemIcon>
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            </Fade>
          );
        })}
      </List>
    </Box>
  );
};
