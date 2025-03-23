import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth/useAuth';
import { Sidebar } from './Sidebar/Sidebar';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <button onClick={toggleSidebar} className={styles.brand}>
            <img src="/chronus1.svg" alt="Chronus Logo" className={styles.logo} />
            <span className={styles.name}>Chronus</span>
          </button>
          <button 
            onClick={handleSignOut} 
            className={styles.signOutButton}
          >
            Sign Out
          </button>
        </div>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
} 