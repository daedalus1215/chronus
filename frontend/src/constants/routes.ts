export const ROUTES = {
  // Public routes
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',

  // Protected routes
  HOME: '/',
  MEMOS: '/memos',
  CHECKLISTS: '/checklists',
  TAGS: '/tags',
  ACTIVITY: '/activity',
  TAG_NOTES: (tagId: string | number) => `/tag-notes/${tagId}`,
  NOTE: (noteId: string | number) => `/notes/${noteId}`,
} as const;

export const ROUTE_PATTERNS = {
  TAG_NOTES: '/tag-notes/:tagId',
  NOTE: '/notes/:id',
} as const; 