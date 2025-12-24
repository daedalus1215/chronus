import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Paper } from '@mui/material';
import { Header } from '../Header/Header';
import { DesktopSidebar } from '../Header/Sidebar/DesktopSidebar';
import { useIsMobile } from '../../hooks/useIsMobile';

export const AuthenticatedLayout: React.FC = () => {
  const isMobile = useIsMobile();

  return (
    <>
      <Header />
      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        {isMobile ? (
          <Box
            sx={{
              height: '100%',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Outlet />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}>
            {/* Sidebar - persists across all pages */}
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

