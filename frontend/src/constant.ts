export const NOTE_TYPES = {
  MEMO: 'memo',
  CHECKLIST: 'checklist',
} as const;

export type NoteTypes = (typeof NOTE_TYPES)[keyof typeof NOTE_TYPES];
