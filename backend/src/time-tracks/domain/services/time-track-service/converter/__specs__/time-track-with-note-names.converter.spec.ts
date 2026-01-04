import { Test, TestingModule } from '@nestjs/testing';
import {
  NoteNameReference,
  TimeTrackWithNoteNamesInput,
  TimeTrackWithNoteNamesResponder,
} from '../../../../../apps/actions/get-daily-time-tracks-aggregation-action/time-track-with-note-names.responder';

describe('TimeTrackWithNoteNamesConverter', () => {
  let target: TimeTrackWithNoteNamesResponder;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TimeTrackWithNoteNamesResponder],
    }).compile();

    target = module.get<TimeTrackWithNoteNamesResponder>(
      TimeTrackWithNoteNamesResponder
    );
  });

  describe('apply', () => {
    it('should combine time tracks with note names', () => {
      // Arrange
      const trackTimeTracks = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01',
        },
        {
          noteId: 2,
          totalTimeMinutes: 180,
          dailyTimeMinutes: 90,
          mostRecentStartTime: '14:00',
          mostRecentDate: '2024-01-01',
        },
      ];

      const noteNames = [
        { id: 1, name: 'Note 1' },
        { id: 2, name: 'Note 2' },
      ];

      // Act
      const result = target.apply({ trackTimeTracks, noteNames });

      // Assert
      expect(result).toEqual([
        {
          noteId: 1,
          noteName: 'Note 1',
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01',
        },
        {
          noteId: 2,
          noteName: 'Note 2',
          totalTimeMinutes: 180,
          dailyTimeMinutes: 90,
          mostRecentStartTime: '14:00',
          mostRecentDate: '2024-01-01',
        },
      ]);
    });

    it('should use "Unknown Note" when note name is not found', () => {
      // Arrange
      const trackTimeTracks = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01',
        },
      ];

      const noteNames = [
        { id: 2, name: 'Note 2' }, // Note 1 not in the list
      ];

      // Act
      const result = target.apply({ trackTimeTracks, noteNames });

      // Assert
      expect(result[0].noteName).toBe('Unknown Note');
    });

    it('should handle empty time tracks array', () => {
      // Arrange
      const trackTimeTracks: TimeTrackWithNoteNamesInput[] = [];
      const noteNames = [{ id: 1, name: 'Note 1' }];

      // Act
      const result = target.apply({ trackTimeTracks, noteNames });

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle empty note names array', () => {
      // Arrange
      const trackTimeTracks = [
        {
          noteId: 1,
          totalTimeMinutes: 120,
          dailyTimeMinutes: 60,
          mostRecentStartTime: '10:00',
          mostRecentDate: '2024-01-01',
        },
      ];
      const noteNames: NoteNameReference[] = [];

      // Act
      const result = target.apply({ trackTimeTracks, noteNames });

      // Assert
      expect(result[0].noteName).toBe('Unknown Note');
    });
  });
});
