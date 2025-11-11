import { Test, TestingModule } from '@nestjs/testing';
import { TimeTrackWithNoteNamesConverter } from '../time-track-with-note-names.converter';

describe('TimeTrackWithNoteNamesConverter', () => {
  let target: TimeTrackWithNoteNamesConverter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeTrackWithNoteNamesConverter],
    }).compile();

    target = module.get<TimeTrackWithNoteNamesConverter>(TimeTrackWithNoteNamesConverter);
  });

  describe('apply', () => {
    it('should combine time tracks with note names', () => {
      // Arrange
      const timeTracks = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01'
        },
        {
          noteId: 2,
          totalTimeMinutes: 180,
          dailyTimeMinutes: 90,
          mostRecentStartTime: '14:00',
          mostRecentDate: '2024-01-01'
        }
      ];

      const noteNames = [
        { id: 1, name: 'Note 1' },
        { id: 2, name: 'Note 2' }
      ];

      // Act
      const result = target.apply(timeTracks, noteNames);

      // Assert
      expect(result).toEqual([
        {
          noteId: 1,
          noteName: 'Note 1',
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01'
        },
        {
          noteId: 2,
          noteName: 'Note 2',
          totalTimeMinutes: 180,
          dailyTimeMinutes: 90,
          mostRecentStartTime: '14:00',
          mostRecentDate: '2024-01-01'
        }
      ]);
    });

    it('should use "Unknown Note" when note name is not found', () => {
      // Arrange
      const timeTracks = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01'
        }
      ];

      const noteNames = [
        { id: 2, name: 'Note 2' } // Note 1 not in the list
      ];

      // Act
      const result = target.apply(timeTracks, noteNames);

      // Assert
      expect(result[0].noteName).toBe('Unknown Note');
    });

    it('should handle empty time tracks array', () => {
      // Arrange
      const timeTracks: any[] = [];
      const noteNames = [{ id: 1, name: 'Note 1' }];

      // Act
      const result = target.apply(timeTracks, noteNames);

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle empty note names array', () => {
      // Arrange
      const timeTracks = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01'
        }
      ];
      const noteNames: any[] = [];

      // Act
      const result = target.apply(timeTracks, noteNames);

      // Assert
      expect(result[0].noteName).toBe('Unknown Note');
    });
  });
}); 