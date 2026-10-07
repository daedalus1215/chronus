import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import styles from './RightSidebar.module.css';

type Tab = {
  id: string;
  icon: React.ReactNode;
};

type RightSidebarProps = {
  isOpen: boolean;
  title?: string;
  tabs?: Tab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  children: React.ReactNode;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  isOpen,
  tabs,
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}
      aria-hidden={!isOpen}
      role="complementary"
    >
      {tabs && activeTab && onTabChange && (
        <ToggleGroup
          type="single"
          value={activeTab}
          onValueChange={value => {
            if (value) onTabChange(value);
          }}
          className="w-full border-b border-[var(--color-overlay-stronger)] [&>*:not(:first-child)]:border-l [&>*:not(:first-child)]:border-[var(--color-overlay-stronger)]"
        >
          {tabs.map(tab => (
            <ToggleGroupItem
              key={tab.id}
              value={tab.id}
              className="rounded-none border-0 px-3 py-1.5 text-[0.8125rem] data-[state=on]:bg-[var(--accent-soft)] data-[state=on]:text-primary"
            >
              {tab.icon}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}
      <div className={styles.content}>{children}</div>
    </aside>
  );
};
