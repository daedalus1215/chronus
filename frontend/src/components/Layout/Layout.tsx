import React from 'react';
import { useAuth } from '../../auth/useAuth';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // const toggleDarkMode = () => {
  //   document.body.classList.toggle('dark');
  // };

  return (
    <div className={styles.layout}>
      {/* <button onClick={toggleDarkMode}>Toggle Dark Mode</button> */}
      <main className={`${styles.content} ${!isAuthenticated ? styles.noHeader : ''}`}>
        {children}
      </main>
    </div>
  );
}; 