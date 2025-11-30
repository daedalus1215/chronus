import React, { useCallback, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tag } from '../../../../../api/dtos/tag.dtos';
import { fetchTags } from '../../../../../api/requests/tags.requests';
import { useNavigate } from 'react-router-dom';
import { TagItem } from '../TagItem/TagItem';
import { SearchBar } from '../SearchBar/SearchBar';
import styles from './MobileTagListView.module.css';

const LoadingSpinner: React.FC = () => (
  <div className={styles.loadingSpinner}>Loading...</div>
);

const NoMoreTags: React.FC = () => (
  <div className={styles.noMoreTags}>No more tags to load</div>
);

export type TagListViewProps = {
  isLoading?: boolean;
  error?: string | null;
};

export const MobileTagListView: React.FC<TagListViewProps> = () => {
  const navigate = useNavigate();
  const {
    data: tags = [],
    isLoading: tagsLoading,
    error: tagsError,
  } = useQuery<Tag[]>({
    queryKey: ['tags'],
    queryFn: fetchTags,
  });

  const [searchQuery, setSearchQuery] = React.useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || tagsLoading) return;

    const { scrollTop, scrollHeight, clientHeight } =
      scrollContainerRef.current;
    const threshold = 100; // pixels from bottom to trigger load

    // Check if we're near the bottom
    if (scrollHeight - scrollTop - clientHeight < threshold) {
      // TODO: Implement loadMore functionality
    }
  }, [tagsLoading]);

  // Add scroll event listener
  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scrollHandler = () => {
      requestAnimationFrame(handleScroll);
    };

    scrollContainer.addEventListener('scroll', scrollHandler);
    return () => scrollContainer.removeEventListener('scroll', scrollHandler);
  }, [handleScroll]);

  const filteredTags = React.useMemo(() => {
    if (!tags) return [];
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tags, searchQuery]);

  if (tagsLoading && (!tags || tags.length === 0)) {
    return <div className={styles.tagListLoading}>Loading tags...</div>;
  }

  if (tagsError) {
    return <div className={styles.tagListError}>{String(tagsError)}</div>;
  }

  return (
    <div className={styles.tagList}>
      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />
      <div className={styles.tagListContent}>
        <div ref={scrollContainerRef} className={styles.tagListScrollContainer}>
          {filteredTags.map(tag => (
            <TagItem
              key={tag.id}
              tag={tag}
              onClick={() => navigate(`/tag-notes/${tag.id}`)}
            />
          ))}
          {tagsLoading && <LoadingSpinner />}
          {!tagsLoading && filteredTags.length === 0 && <NoMoreTags />}
        </div>
      </div>
    </div>
  );
};
