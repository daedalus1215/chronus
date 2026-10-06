import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { navigationItems } from './navigation-items';
import styles from './DesktopSidebar.module.css';

type DesktopSidebarProps = {
  isOpen: boolean;
};

export const DesktopSidebar: React.FC<DesktopSidebarProps> = () => {
  const location = useLocation();

  return (
    <div className={cn(styles.sidebar, 'relative w-[52px] shrink-0 min-w-0 p-1')}>
      <ul className={styles.nav}>
        {navigationItems.map((item, index) => {
          const pathname = location.pathname;
          let isActive = false;

          if (item.path === '/') {
            if (pathname === '/') {
              isActive = true;
            } else if (pathname.startsWith('/notes/')) {
              const basePath = pathname.split('/notes/')[0];
              isActive = basePath === '' || basePath === '/';
            }
          } else {
            if (pathname === item.path) {
              isActive = true;
            } else if (pathname.startsWith(`${item.path}/`)) {
              isActive = true;
            }

            if (item.path === '/tags' && pathname.startsWith('/tag-notes/')) {
              isActive = true;
            }
          }

          return (
            <li
              key={item.path}
              className="animate-in fade-in list-none duration-300"
              style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      styles.navItem,
                      isActive && styles.active,
                      'flex items-center justify-center rounded-md',
                      isActive ? 'bg-sidebar-accent' : 'hover:bg-sidebar-accent'
                    )}
                  >
                    <span
                      className={cn(
                        styles.navIcon,
                        'flex min-w-0 items-center justify-center',
                        isActive ? 'text-sidebar-primary' : 'text-muted-foreground'
                      )}
                    >
                      <item.icon size={18} />
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
