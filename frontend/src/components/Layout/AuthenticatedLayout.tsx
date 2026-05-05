import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { Header, MOBILE_HEADER_HEIGHT_PX } from '../Header/Header';
import { DesktopSidebar } from '../Header/Sidebar/DesktopSidebar';
import { TopRail } from '../TopRail/TopRail';
import { useIsMobile } from '../../hooks/useIsMobile';

/** True when the current route is a note detail (NotePage). */
const isNotePageRoute = (pathname: string): boolean =>
  /\/notes\/[^/]+$/.test(pathname);

export const AuthenticatedLayout: React.FC = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isNotePage = isNotePageRoute(location.pathname);
  const showMobileHeader = isMobile && !isNotePage;

  return (
    <>
      {showMobileHeader && <Header />}
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: showMobileHeader ? MOBILE_HEADER_HEIGHT_PX : 0,
          height: showMobileHeader
            ? `calc(100vh - ${MOBILE_HEADER_HEIGHT_PX}px)`
            : '100vh',
          width: '100%',
        }}
      >
        {!isMobile && <TopRail />}
        {isMobile ? (
          <Box
            sx={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            <Outlet />
          </Box>
        ) : (
          <Box
            sx={{ display: 'flex', width: '100%', flex: 1, minHeight: 0 }}
          >
            {/* Icon rail — always visible at 52px */}
            <Paper
              elevation={0}
              sx={{
                flex: '0 0 auto',
                borderRight: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#111',
                height: '100%',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <DesktopSidebar isOpen={true} />
            </Paper>

            {/* Page-specific content */}
            <Box sx={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
              <Outlet />
            </Box>
          </Box>
        )}
      </main>
    </>
  );
};
