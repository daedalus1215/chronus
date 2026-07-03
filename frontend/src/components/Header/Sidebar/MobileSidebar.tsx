import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import { SidebarToggleIcon } from './SidebarToggleIcon';
import Logout from '@mui/icons-material/Logout';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../../Logo/Logo';
import { navigationItems } from './navigation-items';
import styles from './MobileSidebar.module.css';

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignOut?: () => void;
  username?: string;
};

export const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isOpen,
  onClose,
  onSignOut,
  username,
}) => {
  const location = useLocation();

  // Helper function to determine if a route is active
  const isRouteActive = React.useCallback(
    (itemPath: string) => {
      const pathname = location.pathname;

      // Special handling for Home route (/)
      if (itemPath === '/') {
        // Home is active if:
        // 1. Exact match: /
        // 2. Nested note route: /notes/:id
        // 3. But NOT if it's /memo, /checklist, /tags, /activity, or /tag-notes
        if (pathname === '/') return true;
        if (pathname.startsWith('/notes/')) {
          // Check if it's not under another route
          const basePath = pathname.split('/notes/')[0];
          return basePath === '' || basePath === '/';
        }
        return false;
      }

      // For other routes, check if pathname starts with the route path
      // This handles nested routes like /memo/notes/:id
      if (pathname === itemPath) return true;
      if (pathname.startsWith(`${itemPath}/`)) return true;

      // Special case for Tags: also match /tag-notes/:tagId
      if (itemPath === '/tags' && pathname.startsWith('/tag-notes/')) {
        return true;
      }

      return false;
    },
    [location.pathname]
  );

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      variant="temporary"
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRight: '1px solid var(--glass-border)',
          backgroundImage: 'none',
        },
      }}
    >
      <div
        className={styles.header}
        style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}
      >
        <Link
          to="/"
          className={styles.brand}
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            color: 'inherit',
            flexGrow: 1,
          }}
          onClick={onClose}
        >
          <Logo />
          <span
            className={styles.name}
            style={{ marginLeft: 8, fontWeight: 600, fontSize: '1.2rem' }}
          >
            Chronus
          </span>
        </Link>
        <IconButton onClick={onClose} aria-label="Close sidebar">
          <SidebarToggleIcon isOpen={true} size={20} />
        </IconButton>
      </div>
      <List>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = isRouteActive(item.path);

          return (
            <Fade
              key={item.path}
              in={isOpen}
              timeout={300}
              style={{
                transitionDelay: `${Math.min(index * 50, 300)}ms`,
              }}
            >
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  onClick={onClose}
                  selected={isActive}
                  sx={{
                    position: 'relative',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    boxShadow: isActive ? 'var(--glow-accent-soft)' : 'none',
                    '&:hover': {
                      background: isActive
                        ? 'var(--accent-soft-2)'
                        : 'var(--accent-soft)',
                    },
                    // Gradient accent bar on the active item (matches desktop).
                    '&::before': isActive
                      ? {
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '3px',
                          height: '60%',
                          borderRadius: '9999px',
                          background: 'var(--accent-gradient)',
                          boxShadow: '0 0 8px rgba(99, 102, 241, 0.7)',
                        }
                      : undefined,
                    borderRadius: '8px',
                    margin: '0 8px',
                    padding: '8px 16px',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? 'primary.main' : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </Fade>
          );
        })}
      </List>
      {onSignOut != null && (
        <>
          <Divider />
          <List>
            {username != null && (
              <ListItem sx={{ py: 0, px: 2 }}>
                <ListItemText
                  secondary={username}
                  secondaryTypographyProps={{
                    sx: { fontSize: '0.75rem' },
                    color: 'text.secondary',
                  }}
                />
              </ListItem>
            )}
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                sx={{
                  borderRadius: '8px',
                  margin: '0 8px',
                  padding: '8px 16px',
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary' }}>
                  <Logout />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </ListItem>
          </List>
        </>
      )}
    </Drawer>
  );
};
