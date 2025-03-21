import React from 'react';
import { Header } from '../Header/Header';
import { useAuth } from '../../auth/useAuth';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.layout}>
      {isAuthenticated && <Header />}
      <main className={`${styles.content} ${!isAuthenticated ? styles.noHeader : ''}`}>
        {children}
      </main>
    </div>
  );
}; 