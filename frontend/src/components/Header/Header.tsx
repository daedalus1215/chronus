import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { Sidebar } from './Sidebar/Sidebar';
import { Logo } from '../Logo/Logo';
import { useSidebar } from '../../hooks/useSidebar';
import { Button } from '@/components/ui/button';
import { SidebarToggleIcon } from './Sidebar/SidebarToggleIcon';
import { useTopRailActionsSlot } from '../../hooks/useTopRailActionsSlot';
import { ThemeToggleButton } from '../ThemeToggle/ThemeToggleButton';
import styles from './Header.module.css';

export const MOBILE_HEADER_HEIGHT_PX = 48;

type HeaderProps = {
  readonly actionsOnly?: boolean;
};

export const Header: React.FC<HeaderProps> = ({ actionsOnly = false }) => {
  const { logout, user } = useAuth();
  const { isOpen, setIsOpen, isMobile } = useSidebar();
  const navigate = useNavigate();
  const pageActions = useTopRailActionsSlot();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => (isMobile ? setIsOpen(!isOpen) : navigate('/'));

  if (isMobile) {
    return (
      <>
        <header
          className={`${styles.header} ${styles.mobile}`}
          style={{ height: MOBILE_HEADER_HEIGHT_PX }}
        >
          <div className={styles.container}>
            {!actionsOnly && (
              <Button
                onClick={toggleSidebar}
                aria-label="Open menu"
                variant="ghost"
                size="icon-sm"
                className="text-foreground"
              >
                <SidebarToggleIcon isOpen={false} size={20} />
              </Button>
            )}
            <div className="ml-auto flex items-center gap-1">
              <ThemeToggleButton />
              {pageActions}
            </div>
          </div>
        </header>
        {!actionsOnly && (
          <Sidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            onSignOut={handleSignOut}
            username={user?.username}
          />
        )}
      </>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.container}>
          <button onClick={toggleSidebar} className={styles.brand}>
            <Logo />
            <span className={styles.name}>Chronus</span>
          </button>
          <div className={styles.rightSection}>
            <ThemeToggleButton />
            <span className={styles.username}>{user?.username}</span>
            <button onClick={handleSignOut} className={styles.signOutButton}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
