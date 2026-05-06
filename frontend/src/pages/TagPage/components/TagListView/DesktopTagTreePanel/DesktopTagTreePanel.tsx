import React from 'react';
import { SearchBar } from '../SearchBar/SearchBar';
import { TagTreeNavigation } from '../../../../../components/TreeNavigation/TagTreeNavigation';
import styles from './DesktopTagTreePanel.module.css';

export const DesktopTagTreePanel: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState<string>('');

  return (
    <div className={styles.panel}>
      <div className={styles.content}>
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onClear={() => setSearchQuery('')}
          placeholder="Search tags and notes..."
        />
        <TagTreeNavigation searchQuery={searchQuery} />
      </div>
    </div>
  );
};
