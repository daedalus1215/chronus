import { DataSource } from 'typeorm';
import { Tag } from 'src/tags/domain/entities/tag.entity';
import { TagNote } from 'src/shared-kernel/domain/entities/tag-note.entity';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { User } from 'src/users/domain/entities/user.entity';
import { TagRepository } from '../tag.repository';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('TagRepository (integration)', () => {
  let dataSource: DataSource;
  let target: TagRepository;
  let ownerId: number;
  let otherUserId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
    target = new TagRepository(
      dataSource.getRepository(Tag),
      dataSource.getRepository(TagNote)
    );
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    ownerId = generateRandomNumbers(1000, 999999);
    otherUserId = generateRandomNumbers(1000000, 9999999);
    await Promise.all([
      dataSource.getRepository(User).save({
        id: ownerId,
        username: `owner-${ownerId}`,
        password: 'owner-pass',
      }),
      dataSource.getRepository(User).save({
        id: otherUserId,
        username: `other-${otherUserId}`,
        password: 'other-pass',
      }),
    ]);
  });

  const seedNote = async (overrides: Partial<Note> = {}): Promise<Note> => {
    const note = new Note();
    note.name = 'note';
    note.userId = ownerId;
    note.sortOrder = 0;
    Object.assign(note, overrides);
    return dataSource.getRepository(Note).save(note);
  };

  const seedTag = async (name: string, userId = ownerId): Promise<Tag> => {
    const tag = new Tag();
    tag.name = name;
    tag.description = '';
    tag.userId = userId;
    return dataSource.getRepository(Tag).save(tag);
  };

  const tagIds = (tags: Tag[]): number[] =>
    tags.map(tag => tag.id).sort((a, b) => a - b);

  describe('findTagByName', () => {
    it('should return only the tag belonging to the given user when both users share the name', async () => {
      const ownerTag = await seedTag('shared-name', ownerId);
      await seedTag('shared-name', otherUserId);

      const byOwner = await target.findTagByName('shared-name', ownerId);
      const byOther = await target.findTagByName('shared-name', otherUserId);

      expect(byOwner).not.toBeNull();
      expect(byOwner?.id).toBe(ownerTag.id);
      expect(byOwner?.userId).toBe(ownerId);
      expect(byOther?.id).not.toBe(ownerTag.id);
      expect(byOther?.userId).toBe(otherUserId);
    });

    it('should return null when no tag with the name exists for the user', async () => {
      await seedTag('work', ownerId);

      const missing = await target.findTagByName('work', otherUserId);

      expect(missing).toBeNull();
    });
  });

  describe('findTagByIdAndUserId', () => {
    it('should return null when the tag belongs to another user', async () => {
      const ownerTag = await seedTag('work', ownerId);

      const asOther = await target.findTagByIdAndUserId(
        ownerTag.id,
        otherUserId
      );

      expect(asOther).toBeNull();
    });

    it('should return the tag for its owner', async () => {
      const ownerTag = await seedTag('work', ownerId);

      const asOwner = await target.findTagByIdAndUserId(ownerTag.id, ownerId);

      expect(asOwner).not.toBeNull();
      expect(asOwner?.id).toBe(ownerTag.id);
      expect(asOwner?.name).toBe('work');
      expect(asOwner?.userId).toBe(ownerId);
    });
  });

  describe('addTagToNote', () => {
    it('should persist a tag-note association linking the given tag and note', async () => {
      const tag = await seedTag('work');
      const note = await seedNote();

      const tagNote = await target.addTagToNote(note.id, tag.id);

      expect(tagNote.id).toBeGreaterThan(0);
      expect(tagNote.tagId).toBe(tag.id);
      expect(tagNote.noteId).toBe(note.id);

      const stored = await dataSource
        .getRepository(TagNote)
        .findOne({ where: { id: tagNote.id } });
      expect(stored?.tagId).toBe(tag.id);
      expect(stored?.noteId).toBe(note.id);
    });
  });

  describe('findTagsByNoteId', () => {
    it('should return the tags attached to the note and not tags attached to other notes', async () => {
      const tagA = await seedTag('tag-a');
      const tagB = await seedTag('tag-b');
      const note1 = await seedNote();
      const note2 = await seedNote();
      const note3 = await seedNote();
      await target.addTagToNote(note1.id, tagA.id);
      await target.addTagToNote(note2.id, tagB.id);

      const tagsForNote1 = await target.findTagsByNoteId(note1.id);
      const tagsForNote2 = await target.findTagsByNoteId(note2.id);
      const tagsForNote3 = await target.findTagsByNoteId(note3.id);

      expect(tagIds(tagsForNote1)).toEqual([tagA.id]);
      expect(tagIds(tagsForNote2)).toEqual([tagB.id]);
      expect(tagsForNote3).toEqual([]);
    });

    it('should return a tag that was added to two notes for both of them', async () => {
      const tagA = await seedTag('tag-a');
      const note1 = await seedNote({ name: 'first' });
      const note2 = await seedNote({ name: 'second' });
      await target.addTagToNote(note1.id, tagA.id);
      await target.addTagToNote(note2.id, tagA.id);

      const tagsForNote1 = await target.findTagsByNoteId(note1.id);
      const tagsForNote2 = await target.findTagsByNoteId(note2.id);

      expect(tagIds(tagsForNote1)).toEqual([tagA.id]);
      expect(tagIds(tagsForNote2)).toEqual([tagA.id]);
    });
  });

  describe('findTagsByNoteIds', () => {
    it('should return an empty map when no note ids are given', async () => {
      const result = await target.findTagsByNoteIds([]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should return a per-note map keyed by every requested note id with that note own tags', async () => {
      const tagA = await seedTag('tag-a');
      const tagB = await seedTag('tag-b');
      const note1 = await seedNote({ name: 'first' });
      const note2 = await seedNote({ name: 'second' });
      const note3 = await seedNote({ name: 'third' });
      await target.addTagToNote(note1.id, tagA.id);
      await target.addTagToNote(note1.id, tagB.id);
      await target.addTagToNote(note2.id, tagA.id);

      const result = await target.findTagsByNoteIds([
        note1.id,
        note2.id,
        note3.id,
      ]);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(3);
      expect(result.has(note1.id)).toBe(true);
      expect(result.has(note2.id)).toBe(true);
      expect(result.has(note3.id)).toBe(true);

      const tagsForNote1 = result.get(note1.id) || [];
      const tagsForNote2 = result.get(note2.id) || [];
      const tagsForNote3 = result.get(note3.id) || [];

      expect(tagIds(tagsForNote1)).toEqual([tagA.id, tagB.id]);
      expect(tagIds(tagsForNote2)).toEqual([tagA.id]);
      expect(tagsForNote3).toEqual([]);

      const hydratedA = tagsForNote1.find(tag => tag.id === tagA.id);
      expect(hydratedA).toBeDefined();
      expect(hydratedA?.name).toBe('tag-a');
      expect(hydratedA?.description).toBe('');
      expect(hydratedA?.userId).toBe(ownerId);
    });
  });

  describe('getTagsByUserId', () => {
    it('should return only the user tags with note counts, excluding another users tags', async () => {
      const tagA = await seedTag('tag-a', ownerId);
      const tagB = await seedTag('tag-b', ownerId);
      const tagC = await seedTag('tag-c', otherUserId);
      const note1 = await seedNote();
      const note2 = await seedNote({ name: 'second' });
      const note3 = await seedNote({ name: 'third', userId: otherUserId });
      await target.addTagToNote(note1.id, tagA.id);
      await target.addTagToNote(note2.id, tagA.id);
      await target.addTagToNote(note3.id, tagC.id);

      const ownerProjection = await target.getTagsByUserId(ownerId);
      const otherProjection = await target.getTagsByUserId(otherUserId);

      expect(ownerProjection).toEqual([
        { id: tagA.id, name: 'tag-a', noteCount: 2 },
        { id: tagB.id, name: 'tag-b', noteCount: 0 },
      ]);
      expect(otherProjection).toEqual([
        { id: tagC.id, name: 'tag-c', noteCount: 1 },
      ]);
    });

    it('should not count archived tag-note associations in noteCount', async () => {
      const tagA = await seedTag('tag-a');
      const note1 = await seedNote();
      const note2 = await seedNote({ name: 'second' });
      await target.addTagToNote(note1.id, tagA.id);
      await target.addTagToNote(note2.id, tagA.id);
      const archived = await dataSource
        .getRepository(TagNote)
        .findOne({ where: { tagId: tagA.id, noteId: note1.id } });
      await dataSource
        .getRepository(TagNote)
        .update({ id: archived.id }, { archivedDate: new Date() });

      const projection = await target.getTagsByUserId(ownerId);

      expect(projection).toEqual([
        { id: tagA.id, name: 'tag-a', noteCount: 1 },
      ]);
    });
  });
});
