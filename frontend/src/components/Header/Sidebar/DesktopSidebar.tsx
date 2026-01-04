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
      <List className={styles.nav}>
        {navigationItems.map((item, index) => {
          // Improved route matching to handle nested routes
          const pathname = location.pathname;
          let isActive = false;

          // Special handling for Home route (/)
          if (item.path === '/') {
            // Home is active if:
            // 1. Exact match: /
            // 2. Nested note route: /notes/:id
            // 3. But NOT if it's /memo, /checklist, /tags, /activity, or /tag-notes
            if (pathname === '/') {
              isActive = true;
            } else if (pathname.startsWith('/notes/')) {
              // Check if it's not under another route
              const basePath = pathname.split('/notes/')[0];
              isActive = basePath === '' || basePath === '/';
            }
          } else {
            // For other routes, check if pathname starts with the route path
            // This handles nested routes like /memo/notes/:id
            if (pathname === item.path) {
              isActive = true;
            } else if (pathname.startsWith(`${item.path}/`)) {
              isActive = true;
            }

            // Special case for Tags: also match /tag-notes/:tagId
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
