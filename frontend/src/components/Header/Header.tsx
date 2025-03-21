import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.brand}>
          <img src="/chronus1.svg" alt="Chronus Logo" className={styles.logo} />
          <span className={styles.name}>Chronus</span>
        </Link>
        <button 
          onClick={handleSignOut} 
          className={styles.signOutButton}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}; 