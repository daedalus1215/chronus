export type TagTreeItem = {
  id: string;
  label: string;
  type: 'tag' | 'note';
  noteCount?: number;
  children?: TagTreeItem[];
};

export const TAG_PREFIX = 'tag-';
export const NOTE_PREFIX = 'note-';

export type NoteSummary = {
  id: number;
  name: string;
};

export type TagWithNoteCount = {
  id: number;
  name: string;
  noteCount: number;
};

export const buildTagTreeItems = (
  tags: TagWithNoteCount[],
  notesByTagId: Record<number, NoteSummary[]>
): TagTreeItem[] => {
  return tags.map((tag) => {
    const notes = notesByTagId[tag.id] ?? [];
    const seenNoteIds = new Set<number>();
    const uniqueNotes = notes.filter((note) => {
      if (seenNoteIds.has(note.id)) return false;
      seenNoteIds.add(note.id);
      return true;
    });
    return {
      id: `${TAG_PREFIX}${tag.id}`,
      label: tag.name,
      type: 'tag' as const,
      noteCount: tag.noteCount,
      children: uniqueNotes.map((note) => ({
        id: `${NOTE_PREFIX}${note.id}-${tag.id}`,
        label: note.name,
        type: 'note' as const,
        children: undefined,
      })),
    };
  });
};

export const getTagTreeItemLabel = (item: TagTreeItem): string => {
  if (item.type === 'tag' && item.noteCount != null) {
    return `${item.label} ${item.noteCount}`;
  }
  return item.label;
};

export const parseNoteId = (
  id: string
): { noteId: number; tagId: number } | null => {
  const match = id.match(/^note-(\d+)-(\d+)$/);
  if (!match) return null;
  return { noteId: Number(match[1]), tagId: Number(match[2]) };
};

const matchesQuery = (text: string, query: string): boolean =>
  text.toLowerCase().includes(query.toLowerCase().trim());

/**
 * Filters the tag tree by search query: keeps tags whose name matches or that
 * have at least one note whose name matches; under matching tags, only notes
 * that match are shown (or all notes if the tag name matches).
 */
export const filterTagTreeItems = (
  items: TagTreeItem[],
  query: string
): TagTreeItem[] => {
  const q = query.trim();
  if (!q) return items;

  const filtered: TagTreeItem[] = [];
  for (const tag of items) {
    const tagMatches = matchesQuery(tag.label, q);
    const children = tag.children ?? [];
    const filteredChildren = tagMatches
      ? children
      : children.filter((note) => matchesQuery(note.label, q));
    if (filteredChildren.length === 0 && !tagMatches) continue;
    filtered.push({
      ...tag,
      children:
        filteredChildren.length === 0 ? undefined : filteredChildren,
    });
  }
  return filtered;
};
