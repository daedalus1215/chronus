import React from "react";
import { Header } from "../../components/Header/Header";
import { MobileTagListView } from "./components/TagListView/MobileTagListView/MobileTagListView";
import { DesktopTagListView } from "./components/TagListView/DesktopTagListView/DesktopTagListView";
import styles from "./TagPage.module.css";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useNavigate, useParams, Outlet } from "react-router-dom";
import { Box, Paper } from "@mui/material";
import { DesktopSidebar } from "../../components/Header/Sidebar/DesktopSidebar";

export const TagPage: React.FC = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { id: routeTagId } = useParams<{ id: string }>();
  const [selectedTagId, setSelectedTagId] = React.useState<number | null>(
    routeTagId ? Number(routeTagId) : null
  );

  const handleTagSelect = (tagId: number) => {
    if (isMobile) {
      navigate(`/tag-notes/${tagId}`);
    } else {
      setSelectedTagId(tagId);
      navigate(`/tag-notes/${tagId}`, { replace: true });
    }
  };

  const isTagRoute = !!routeTagId;

  return (
    <div className={styles.tagPage}>
      <Header />
      <main
        className={`${styles.main} ${isMobile ? styles.mainMobile : styles.mainDesktop
          }`}
      >
        {isMobile ? (
          <Box sx={{
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <Box sx={{
              display: isTagRoute ? 'none' : 'block',
              flex: 1
            }}>
              <MobileTagListView />
            </Box>
            {isTagRoute && (
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'background.paper',
                zIndex: 1
              }}>
                <Outlet />
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', width: '100%', height: '100%' }}>
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
                flexDirection: 'column'
              }}
            >
              <DesktopSidebar isOpen={true} />
            </Paper>
            <Box sx={{ borderRight: '1px solid', borderColor: 'divider' }}>
              <DesktopTagListView
                onTagSelect={handleTagSelect}
                selectedTagId={selectedTagId}
              />
            </Box>
            <Box sx={{ flex: 1, height: '100%' }}>
              {selectedTagId && (
                <Box sx={{ p: 2 }}>
                  <Outlet />
                </Box>
              )}
            </Box>
          </Box>
        )}
      </main>
    </div>
  );
};
