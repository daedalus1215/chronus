import { DataSource } from 'typeorm';
import { TimeTrack } from '../time-track.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('TimeTrack entity (integration)', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
  });

  describe('wall-clock columns', () => {
    it('round-trips date and startTime as plain strings without timezone shifting', async () => {
      // Arrange
      const userId = generateRandomNumbers(1000, 999999);
      const noteId = generateRandomNumbers(1000, 999999);
      const track = new TimeTrack();
      track.userId = userId;
      track.noteId = noteId;
      track.date = '2026-09-19';
      track.startTime = '09:30:00';
      track.durationMinutes = 45;
      await dataSource.getRepository(TimeTrack).save(track);

      // Act
      const reloaded = await dataSource
        .getRepository(TimeTrack)
        .findOneBy({ id: track.id });

      // Assert
      expect(reloaded).not.toBeNull();
      expect(reloaded?.date).toBe('2026-09-19');
      expect(reloaded?.startTime).toBe('09:30:00');
      expect(reloaded?.durationMinutes).toBe(45);
    });
  });
});
