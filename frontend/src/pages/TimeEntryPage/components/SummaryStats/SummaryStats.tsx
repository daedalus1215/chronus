import React from 'react';
import { Clock, ListOrdered, Timer } from 'lucide-react';
import styles from './SummaryStats.module.css';

interface SummaryStatsProps {
  totalMinutes: number;
  entryCount: number;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
};

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  totalMinutes,
  entryCount,
}) => {
  const averageMinutes =
    entryCount > 0 ? Math.round(totalMinutes / entryCount) : 0;

  const stats = [
    {
      icon: <Clock className={styles.icon} />,
      label: 'Total Time',
      value: formatDuration(totalMinutes),
    },
    {
      icon: <ListOrdered className={styles.icon} />,
      label: 'Entries',
      value: entryCount.toString(),
    },
    {
      icon: <Timer className={styles.icon} />,
      label: 'Average',
      value: formatDuration(averageMinutes),
    },
  ];

  return (
    <div className={styles.container}>
      {stats.map(stat => (
        <div key={stat.label} className={styles.card}>
          <div className={styles.iconWrapper}>{stat.icon}</div>
          <div className={styles.content}>
            <span className={styles.label}>{stat.label}</span>
            <span className={styles.value}>{stat.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
