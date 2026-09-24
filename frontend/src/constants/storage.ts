/**
 * Single source of truth for every localStorage key the app uses.
 *
 * ⚠️ The string values are STABLE STORAGE KEYS, not labels: existing users
 * already have data stored under them. Never rename a value — add new keys
 * only. Renaming one silently resets that user's saved setting.
 *
 * Grouped by domain so each feature's keys live in one place.
 */
export const STORAGE_KEYS = {
  AUTH: {
    /** JWT read by the axios interceptor, auth provider, and transcription socket. */
    JWT_TOKEN: 'jwt_token',
  },
  AUDIO_PLAYER: {
    /** Persisted playback volume (0–1, stored as a string). */
    VOLUME: 'audioPlayerVolume',
  },
  EXPLORER: {
    /** Explorer tree pane width in px (useResizablePane). */
    TREE_WIDTH_PX: 'explorerTreeWidthPx',
    /** Folder IDs currently expanded in the Explorer tree (JSON array of numbers). */
    EXPANDED_FOLDERS: 'chronus-explorer-expanded-folders',
  },
  NOTE_LIST: {
    /** Home note-list sidebar width in px (useResizablePane). */
    WIDTH_PX: 'noteListWidthPx',
  },
  NOTE_PAGE: {
    /** Active sidebar tab on the Note page (tab id). */
    SIDEBAR_TAB: 'chronus-sidebar-tab',
  },
  TAGS: {
    /** Tags tree pane width in px (useResizablePane). */
    TREE_WIDTH_PX: 'tagTreeWidthPx',
  },
} as const;
