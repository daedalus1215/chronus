import { Tag } from '../../../../domain/entities/tag.entity';
import { TagNote } from '../../../../../shared-kernel/domain/entities/tag-note.entity';

export const tagsByNoteIdsHydrator = (
  tagNotes: TagNote[],
  tags: Tag[],
  noteIds: number[]
): Map<number, Tag[]> => {
  if (tagNotes.length === 0) {
    return new Map(noteIds.map(noteId => [noteId, []]));
  }

  const tagsMap = new Map(tags.map(tag => [tag.id, tag]));

  const tagNotesByNoteId = tagNotes
    .map(tagNote => ({
      noteId: tagNote.noteId,
      tag: tagsMap.get(tagNote.tagId),
    }))
    .filter(({ tag }) => tag !== undefined)
    .reduce(
      (acc, { noteId, tag }) => ({
        ...acc,
        [noteId]: [...(acc[noteId] || []), tag!],
      }),
      {} as Record<number, Tag[]>
    );

  return new Map(
    noteIds.map(noteId => {
      const noteTags = tagNotesByNoteId[noteId] || [];
      return [noteId, Array.from(new Set(noteTags))];
    })
  );
};
