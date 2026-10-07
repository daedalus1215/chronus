import React from 'react';
import { LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SidebarToggleIcon } from './SidebarToggleIcon';
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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-60 gap-0 p-0"
        style={{
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderRight: '1px solid var(--glass-border)',
          backgroundImage: 'none',
        }}
      >
        <SheetTitle className="sr-only">Navigation</SheetTitle>
        <div className={styles.header} style={{ display: 'flex', alignItems: 'center', padding: '1rem' }}>
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
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <SidebarToggleIcon isOpen={true} size={20} />
          </Button>
        </div>
        <ul>
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = isRouteActive(item.path);

            return (
              <li
                key={item.path}
                className="animate-in fade-in list-none duration-300"
                style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
              >
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    'relative mx-2 flex items-center gap-3 rounded-md px-4 py-2',
                    isActive
                      ? [
                          'bg-[var(--accent-soft)] shadow-[var(--glow-accent-soft)]',
                          "before:absolute before:left-0 before:top-1/2 before:h-3/5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:content-['']",
                          'before:[background:var(--accent-gradient)] before:[box-shadow:0_0_8px_rgba(99,102,241,0.7)]',
                        ]
                      : 'hover:bg-[var(--accent-soft)]'
                  )}
                >
                  <span className={isActive ? 'text-sidebar-primary' : 'text-muted-foreground'}>
                    <Icon className="size-5" />
                  </span>
                  <span
                    className={cn(
                      isActive
                        ? 'font-semibold text-sidebar-primary'
                        : 'font-normal text-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        {onSignOut != null && (
          <>
            <Separator />
            <ul>
              {username != null && (
                <li className="list-none px-4 py-0">
                  <span className="text-xs text-muted-foreground">{username}</span>
                </li>
              )}
              <li className="list-none">
                <button
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md border-0 bg-transparent px-4 py-2 text-left hover:bg-[var(--accent-soft)]"
                >
                  <LogOut className="size-5 text-muted-foreground" />
                  <span>Sign Out</span>
                </button>
              </li>
            </ul>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
