import React from 'react';
import { useAuth } from '../../auth/useAuth';
import { useSidebar } from '../../hooks/useSidebar';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { isOpen, isMobile } = useSidebar();

  return (
    <div className={styles.layout}>
      <main
        className={`${styles.content} ${!isAuthenticated ? styles.noHeader : ''}`}
        style={{
          marginLeft: !isMobile && isOpen ? '240px' : '0',
          transition: 'margin-left 0.3s ease-in-out',
          width: !isMobile && isOpen ? 'calc(100% - 240px)' : '100%',
        }}
      >
        {children}
      </main>
    </div>
  );
};
