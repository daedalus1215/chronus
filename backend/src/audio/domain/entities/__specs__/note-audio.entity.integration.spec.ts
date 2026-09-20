import { DataSource } from 'typeorm';
import { NoteAudio } from 'src/audio/domain/entities/note-audio.entity';
import {
  createIntegrationDataSource,
  truncateIntegrationTables,
} from 'src/shared-kernel/integration-test-data-source';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('NoteAudio entity (integration)', () => {
  let dataSource: DataSource;
  let noteId: number;

  beforeAll(async () => {
    dataSource = await createIntegrationDataSource();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  beforeEach(async () => {
    await truncateIntegrationTables(dataSource);
    noteId = generateRandomNumbers(1000, 999999);
  });

  const saveAudio = async (
    overrides: Partial<NoteAudio> = {}
  ): Promise<NoteAudio> => {
    const audio = new NoteAudio();
    audio.noteId = noteId;
    audio.filePath = '/files/audio.mp3';
    audio.fileName = 'audio.mp3';
    audio.fileFormat = 'mp3';
    Object.assign(audio, overrides);
    return dataSource.getRepository(NoteAudio).save(audio);
  };

  describe('save', () => {
    it('defaults lastPositionSeconds and durationSeconds to null and stamps the timestamps', async () => {
      const audio = await saveAudio();

      const reloaded = await dataSource
        .getRepository(NoteAudio)
        .findOneBy({ id: audio.id });

      expect(reloaded).not.toBeNull();
      expect(reloaded?.lastPositionSeconds).toBeNull();
      expect(reloaded?.durationSeconds).toBeNull();
      expect(reloaded?.createdAt).toBeInstanceOf(Date);
      expect(reloaded?.updatedAt).toBeInstanceOf(Date);
    });

    it('round-trips the playback position and duration as real values', async () => {
      const audio = await saveAudio({
        lastPositionSeconds: 42.5,
        durationSeconds: 137.25,
      });

      const reloaded = await dataSource
        .getRepository(NoteAudio)
        .findOneBy({ id: audio.id });

      expect(reloaded?.lastPositionSeconds).toBe(42.5);
      expect(reloaded?.durationSeconds).toBe(137.25);
    });
  });
});
