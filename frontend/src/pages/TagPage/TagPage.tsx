import React from 'react';
import { MobileTagListView } from './components/TagListView/MobileTagListView/MobileTagListView';
import { TagTreeNavigation } from '../../components/TreeNavigation/TagTreeNavigation';
import styles from './TagPage.module.css';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useParams, Outlet } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export const TagPage: React.FC = () => {
  const isMobile = useIsMobile();
  const { tagId: routeTagId } = useParams<{ tagId: string }>();
  const isTagRoute = routeTagId != null;

  return (
    <div
      className={styles.tagPage}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
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
          <Box
            sx={{
              display: isTagRoute ? 'none' : 'block',
              flex: 1,
            }}
          >
            <MobileTagListView />
          </Box>
          {isTagRoute && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'background.paper',
                zIndex: 1,
              }}
            >
              <Outlet />
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
          <Box
            sx={{
              borderRight: '1px solid',
              borderColor: 'divider',
              minWidth: 220,
              maxWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <TagTreeNavigation />
          </Box>
          <Box
            sx={{
              flex: 1,
              height: '100%',
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              Select a tag or note from the tree
            </Typography>
          </Box>
        </Box>
      )}
    </div>
  );
};
