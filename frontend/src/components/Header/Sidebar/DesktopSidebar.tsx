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
  const fixedWidth = 52;

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
      <List className={styles.nav}>
        {navigationItems.map((item, index) => {
          const pathname = location.pathname;
          let isActive = false;

          if (item.path === '/') {
            if (pathname === '/') {
              isActive = true;
            } else if (pathname.startsWith('/notes/')) {
              const basePath = pathname.split('/notes/')[0];
              isActive = basePath === '' || basePath === '/';
            }
          } else {
            if (pathname === item.path) {
              isActive = true;
            } else if (pathname.startsWith(`${item.path}/`)) {
              isActive = true;
            }

            if (item.path === '/tags' && pathname.startsWith('/tag-notes/')) {
              isActive = true;
            }
          }

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
                      backgroundColor: isActive
                        ? 'action.selected'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: isActive
                          ? 'action.selected'
                          : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      className={styles.navIcon}
                      sx={{
                        minWidth: 0,
                        justifyContent: 'center',
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      <item.icon sx={{ fontSize: 18 }} />
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
