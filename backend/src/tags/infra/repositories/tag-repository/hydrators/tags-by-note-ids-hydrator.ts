import { Tag } from '../../../../domain/entities/tag.entity';

type TagNoteRow = {
  noteId: string;
  id: string;
  name: string;
  description: string;
  userId: string;
};

export const tagsByNoteIdsHydrator = (
  rows: TagNoteRow[],
  noteIds: number[]
): Map<number, Tag[]> => {
  const tagsByNoteId = rows.reduce(
    (acc, row) => {
      const noteId = parseInt(row.noteId);
      const tag: Tag = {
        id: parseInt(row.id),
        name: row.name,
        description: row.description,
        userId: parseInt(row.userId),
      };
      const existing = acc[noteId] || [];
      const hasDuplicate = existing.some(t => t.id === tag.id);
      return hasDuplicate ? acc : { ...acc, [noteId]: [...existing, tag] };
    },
    {} as Record<number, Tag[]>
  );

  return new Map(noteIds.map(noteId => [noteId, tagsByNoteId[noteId] || []]));
};
