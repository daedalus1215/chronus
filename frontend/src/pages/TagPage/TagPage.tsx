import React from 'react';
import { Header } from '../../components/Header/Header';
import { TagListView } from './components/TagListView/TagListView';
import styles from './TagPage.module.css';

export const TagPage: React.FC = () => (
  <div className={styles.tagPage}>
    <Header />
    <main className={styles.main}>
      <TagListView />
    </main>
  </div>
); 