export const ROUTES = {
  // Public routes
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Protected routes
  HOME: '/',
  MEMOS: '/memo',
  CHECKLISTS: '/checklist',
  TAGS: '/tags',
  ACTIVITY: '/activity',
  CALENDAR: '/calendar',
  YEARLY_NOTES: '/yearly-notes',
  SETTINGS: '/settings',
  TAG_NOTES: (tagId: string | number) => `/tag-notes/${tagId}`,
  NOTE: (noteId: string | number) => `notes/${noteId}`, // Removed leading slash for nested routes
} as const;

export const ROUTE_PATTERNS = {
  TAG_NOTES: '/tag-notes/:tagId',
  NOTE: 'notes/:id', // Removed leading slash for nested routes
} as const;
