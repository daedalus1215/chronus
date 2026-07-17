export type CheckItemStatus = 'ready' | 'in_progress' | 'review' | 'done';

export interface CheckItemFilters {
  query: string;
  status: CheckItemStatus[];
  includeDone: boolean;
}

export const DEFAULT_FILTERS: CheckItemFilters = {
  query: '',
  status: [],
  includeDone: true,
};

export const ALL_STATUSES: CheckItemStatus[] = [
  'ready',
  'in_progress',
  'review',
  'done',
];
