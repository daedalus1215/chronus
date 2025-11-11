import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { Logo } from '../../Logo/Logo';
import { navigationItems } from './navigation-items';
import styles from './MobileSidebar.module.css';

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
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
        },
      }}
    >
      <div className={styles.header} style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
        <Link to="/" className={styles.brand} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }} onClick={onClose}>
          <Logo />
          <span className={styles.name} style={{ marginLeft: 8, fontWeight: 600, fontSize: '1.2rem' }}>Chronus</span>
        </Link>
        <IconButton onClick={onClose} aria-label="Close sidebar">
          <CloseIcon />
        </IconButton>
      </div>
      <List>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path} 
                onClick={onClose}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  borderRadius: '8px',
                  margin: '0 8px',
                  padding: '8px 16px',
                }}
              >
                <ListItemIcon>
                  <Icon />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};