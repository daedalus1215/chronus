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
  const result = new Map<number, Set<Tag>>();

  for (const noteId of noteIds) {
    result.set(noteId, new Set());
  }

  for (const tagNote of tagNotes) {
    const tag = tagsMap.get(tagNote.tagId);
    if (tag) {
      result.get(tagNote.noteId)?.add(tag);
    }
  }

  return new Map(
    Array.from(result).map(([noteId, tagSet]) => [noteId, Array.from(tagSet)])
  );
};
