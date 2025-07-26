import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { Logo } from '../../Logo/Logo';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Memos', path: '/memos' },
  { label: 'CheckLists', path: '/checklists' },
  { label: 'Tags', path: '/tags' },
  { label: 'Activity', path: '/activity' },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <Drawer anchor="left" open={isOpen} onClose={onClose}>
      <div className={styles.header} style={{ display: 'flex', alignItems: 'center', padding: '1rem', minWidth: 240 }}>
        <Link to="/" className={styles.brand} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', flexGrow: 1 }} onClick={onClose}>
          <Logo />
          <span className={styles.name} style={{ marginLeft: 8, fontWeight: 600, fontSize: '1.2rem' }}>Chronus</span>
        </Link>
        <IconButton onClick={onClose} aria-label="Close sidebar">
          <CloseIcon />
        </IconButton>
      </div>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton component={Link} to={item.path} onClick={onClose}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}; 