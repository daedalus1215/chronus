import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header, MOBILE_HEADER_HEIGHT_PX } from '../Header/Header';
import { DesktopSidebar } from '../Header/Sidebar/DesktopSidebar';
import { TopRail } from '../TopRail/TopRail';
import { TopRailActionsProvider } from '../../contexts/TopRailActionsContext';
import { useIsMobile } from '../../hooks/useIsMobile';

/** True when the current route is a note detail (NotePage). */
const isNotePageRoute = (pathname: string): boolean =>
  /\/notes\/[^/]+$/.test(pathname);

export const AuthenticatedLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isNotePage = isNotePageRoute(location.pathname);
  const showFullMobileHeader = isMobile && !isNotePage;
  const showMobileActionsBar = isMobile && isNotePage;
  const hasMobileHeader = showFullMobileHeader || showMobileActionsBar;

  return (
    <TopRailActionsProvider>
      {showFullMobileHeader && <Header />}
      {showMobileActionsBar && <Header actionsOnly />}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: hasMobileHeader ? MOBILE_HEADER_HEIGHT_PX : 0,
          height: hasMobileHeader
            ? `calc(100vh - ${MOBILE_HEADER_HEIGHT_PX}px)`
            : '100vh',
          width: '100%',
        }}
      >
        {!isMobile && <TopRail />}
        {isMobile ? (
          <div className="relative flex min-h-0 flex-1 flex-col">
            <Outlet />
          </div>
        ) : (
          <div className="flex min-h-0 w-full flex-1">
            <div className="flex h-full shrink-0 flex-col overflow-hidden border-r border-border bg-card">
              <DesktopSidebar isOpen={true} />
            </div>

            <div className="min-w-0 flex-1 overflow-hidden">
              <Outlet />
            </div>
          </div>
        )}
      </main>
    </TopRailActionsProvider>
  );
};
