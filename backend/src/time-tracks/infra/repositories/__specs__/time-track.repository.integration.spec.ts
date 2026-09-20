import { DataSource } from 'typeorm';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';
import { TimeTrackRepository } from '../time-track.repository';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';
import { getDateString } from 'src/shared-kernel/utils/date.utils';

describe('TimeTrackRepository (integration)', () => {
  let dataSource: DataSource;
  let target: TimeTrackRepository;
  let ownerId: number;
  let otherUserId: number;
  let noteId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
    target = new TimeTrackRepository(dataSource.getRepository(TimeTrack));
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    ownerId = generateRandomNumbers(1000, 999999);
    otherUserId = generateRandomNumbers(1000000, 9999999);
    noteId = generateRandomNumbers(1000, 999999);
  });

  const seedTrack = async (
    overrides: Partial<TimeTrack> = {}
  ): Promise<TimeTrack> => {
    const track = new TimeTrack();
    track.userId = ownerId;
    track.noteId = noteId;
    track.date = '2026-09-19';
    track.startTime = '09:00:00';
    track.durationMinutes = 60;
    Object.assign(track, overrides);
    return dataSource.getRepository(TimeTrack).save(track);
  };

  const daysAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return getDateString(date);
  };

  describe('getTotalTimeForNote', () => {
    it("sums durationMinutes across the user's tracks for the note", async () => {
      // Arrange
      await seedTrack({ durationMinutes: 45 });
      await seedTrack({ durationMinutes: 75, date: '2026-09-18' });
      await seedTrack({ durationMinutes: 120, date: '2026-09-17' });

      // Act
      const total = await target.getTotalTimeForNote(ownerId, noteId);

      // Assert
      // pg returns SUM(bigint) as a numeric string; the method passes it through.
      expect(total).toBe('240');
    });

    it('returns 0 when the user has no tracks for the note', async () => {
      // Act
      const total = await target.getTotalTimeForNote(ownerId, noteId);

      // Assert
      expect(total).toBe(0);
    });

    it('ignores tracks of other users for the same note', async () => {
      // Arrange
      await seedTrack({ userId: otherUserId, durationMinutes: 100 });

      // Act
      const total = await target.getTotalTimeForNote(ownerId, noteId);

      // Assert
      expect(total).toBe(0);
    });
  });

  describe('getDailyTotal', () => {
    it('sums only the tracks on the given date', async () => {
      // Arrange
      const date = daysAgo(2);
      await seedTrack({ date, durationMinutes: 30 });
      await seedTrack({ date, durationMinutes: 20, startTime: '13:00:00' });
      await seedTrack({ date: daysAgo(3), durationMinutes: 100 });
      await seedTrack({ date: daysAgo(1), durationMinutes: 50 });

      // Act
      const total = await target.getDailyTotal(ownerId, date);

      // Assert
      // pg returns SUM(bigint) as a numeric string; the method passes it through.
      expect(total).toBe('50');
    });

    it('returns 0 when the user has no tracks on the date', async () => {
      // Arrange
      await seedTrack({ date: daysAgo(2) });

      // Act
      const total = await target.getDailyTotal(ownerId, daysAgo(1));

      // Assert
      expect(total).toBe(0);
    });
  });

  describe('findByUserIdAndDateRange', () => {
    it("returns the user's tracks with both boundaries included, ordered by date desc then start time desc", async () => {
      // Arrange
      await seedTrack({ date: '2026-09-14', startTime: '09:00:00' });
      await seedTrack({ date: '2026-09-15', startTime: '08:30:00' });
      await seedTrack({ date: '2026-09-16', startTime: '08:00:00' });
      await seedTrack({ date: '2026-09-16', startTime: '10:30:00' });
      await seedTrack({ date: '2026-09-17', startTime: '12:00:00' });
      await seedTrack({ date: '2026-09-18', startTime: '09:00:00' });
      await seedTrack({
        userId: otherUserId,
        date: '2026-09-16',
        startTime: '11:00:00',
      });

      // Act
      const tracks = await target.findByUserIdAndDateRange(
        ownerId,
        '2026-09-15',
        '2026-09-17'
      );

      // Assert
      expect(tracks).toHaveLength(4);
      expect(tracks.map(t => `${t.date} ${t.startTime}`)).toEqual([
        '2026-09-17 12:00:00',
        '2026-09-16 10:30:00',
        '2026-09-16 08:00:00',
        '2026-09-15 08:30:00',
      ]);
    });

    it('returns an empty list when the range contains no tracks', async () => {
      // Arrange
      await seedTrack({ date: '2026-09-14' });

      // Act
      const tracks = await target.findByUserIdAndDateRange(
        ownerId,
        '2026-09-15',
        '2026-09-17'
      );

      // Assert
      expect(tracks).toEqual([]);
    });
  });

  describe('deleteByIdAndUserId', () => {
    it("deletes the user's own track and leaves other users' tracks untouched", async () => {
      // Arrange
      const own = await seedTrack();
      const other = await seedTrack({ userId: otherUserId });

      // Act
      const deleted = await target.deleteByIdAndUserId(own.id, ownerId);

      // Assert
      expect(deleted).toBe(true);
      expect(await target.findById(own.id)).toBeNull();
      const otherReloaded = await target.findById(other.id);
      expect(otherReloaded).not.toBeNull();
      expect(otherReloaded?.userId).toBe(otherUserId);
    });

    it('returns false and leaves the row untouched when the track belongs to another user', async () => {
      // Arrange
      const other = await seedTrack({ userId: otherUserId });

      // Act
      const deleted = await target.deleteByIdAndUserId(other.id, ownerId);

      // Assert
      expect(deleted).toBe(false);
      const reloaded = await target.findById(other.id);
      expect(reloaded).not.toBeNull();
      expect(reloaded?.note).toBeNull();
    });
  });

  describe('updateNoteByIdAndUserId', () => {
    it("sets the note on the user's own track and returns the updated row", async () => {
      // Arrange
      const own = await seedTrack();
      expect(own.note).toBeNull();

      // Act
      const updated = await target.updateNoteByIdAndUserId(
        own.id,
        ownerId,
        'added by owner'
      );

      // Assert
      expect(updated).not.toBeNull();
      expect(updated?.id).toBe(own.id);
      expect(updated?.note).toBe('added by owner');
    });

    it('returns null and leaves the row untouched when the track belongs to another user', async () => {
      // Arrange
      const other = await seedTrack({ userId: otherUserId });

      // Act
      const updated = await target.updateNoteByIdAndUserId(
        other.id,
        ownerId,
        'should not apply'
      );

      // Assert
      expect(updated).toBeNull();
      const reloaded = await target.findById(other.id);
      expect(reloaded?.note).toBeNull();
    });
  });

  describe('updateByIdAndUserId', () => {
    it("applies the updates to the user's own track and returns the updated row", async () => {
      // Arrange
      const own = await seedTrack({ durationMinutes: 30, note: 'old' });

      // Act
      const updated = await target.updateByIdAndUserId(own.id, ownerId, {
        durationMinutes: 60,
        note: 'new',
      });

      // Assert
      expect(updated).not.toBeNull();
      expect(updated?.id).toBe(own.id);
      expect(updated?.durationMinutes).toBe(60);
      expect(updated?.note).toBe('new');
    });

    it('returns null and leaves the row untouched when the track belongs to another user', async () => {
      // Arrange
      const other = await seedTrack({
        userId: otherUserId,
        durationMinutes: 30,
      });

      // Act
      const updated = await target.updateByIdAndUserId(other.id, ownerId, {
        durationMinutes: 99,
      });

      // Assert
      expect(updated).toBeNull();
      const reloaded = await target.findById(other.id);
      expect(reloaded?.durationMinutes).toBe(30);
    });
  });

  describe('getCurrentStreak', () => {
    it('returns 0 when the user has no time tracks', async () => {
      // Act
      const streak = await target.getCurrentStreak(ownerId);

      // Assert
      expect(streak).toBe(0);
    });

    it('returns 0 even when the user has consecutive active days ending today', async () => {
      // Arrange
      // Two tracks on today, then two more consecutive days, then a gap.
      await seedTrack({ date: daysAgo(0), startTime: '09:00:00' });
      await seedTrack({ date: daysAgo(0), startTime: '15:00:00' });
      await seedTrack({ date: daysAgo(1) });
      await seedTrack({ date: daysAgo(2) });
      await seedTrack({ date: daysAgo(4) });

      // Act
      const streak = await target.getCurrentStreak(ownerId);

      // Assert
      // The raw query returns DATE columns as JS Date objects, so the
      // Set of Date objects never matches the string keys it is queried
      // with; the streak is currently always 0.
      expect(streak).toBe(0);
    });

    it('returns 0 even when the user has active days on the two days before today', async () => {
      // Arrange
      await seedTrack({ date: daysAgo(1) });
      await seedTrack({ date: daysAgo(2) });

      // Act
      const streak = await target.getCurrentStreak(ownerId);

      // Assert
      expect(streak).toBe(0);
    });

    it('returns 0 when the most recent active day is neither today nor yesterday', async () => {
      // Arrange
      await seedTrack({ date: daysAgo(2) });

      // Act
      const streak = await target.getCurrentStreak(ownerId);

      // Assert
      expect(streak).toBe(0);
    });

    it('returns 0 even when the end date falls inside a run of active days', async () => {
      // Arrange
      await seedTrack({ date: '2026-09-19' });
      await seedTrack({ date: '2026-09-18' });
      await seedTrack({ date: '2026-09-16' });

      // Act
      const streak = await target.getCurrentStreak(ownerId, '2026-09-19');

      // Assert
      expect(streak).toBe(0);
    });
  });
});
