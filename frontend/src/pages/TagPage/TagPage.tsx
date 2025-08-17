import React from "react";
import { Header } from "../../components/Header/Header";
import { MobileTagListView } from "./components/TagListView/MobileTagListView/MobileTagListView";
import { DesktopTagListView } from "./components/TagListView/DesktopTagListView/DesktopTagListView";
import styles from "./TagPage.module.css";
import { useIsMobile } from "../../hooks/useIsMobile";

export const TagPage: React.FC = () => {
  const isMobile = useIsMobile();
  return (
    <div className={styles.tagPage}>
      <Header />
      <main
        className={`${styles.main} ${
          isMobile ? styles.mainMobile : styles.mainDesktop
        }`}
      >
        {isMobile ? <MobileTagListView /> : <DesktopTagListView />}
      </main>
    </div>
  );
};

