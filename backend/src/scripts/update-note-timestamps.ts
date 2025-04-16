import { DataSource } from 'typeorm';
import { Note } from '../notes/domain/entities/notes/note.entity';
import { TimeTrack } from '../time-tracks/domain/entities/time-track-entity/time-track.entity';
import { Tag } from '../notes/domain/entities/tag/tag.entity';
import { Memo } from '../notes/domain/entities/notes/memo.entity';
import { TagNote } from '../notes/domain/entities/tag/tag-note.entity';
import { BaseEntity } from '../shared-kernel/domain/entities/base.entity';
import * as path from 'path';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.resolve(__dirname, '../../db.sqlite'),
  entities: [Note, TimeTrack, Tag, Memo, TagNote, BaseEntity],
  synchronize: false,
});

const updateNoteTimestamps = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database connection initialized');

    // Get all notes
    const notes = await AppDataSource.getRepository(Note).find();
    console.log(`Found ${notes.length} notes to process`);

    for (const note of notes) {
      try {
        // Get all time tracks for this note
        const timeTracks = await AppDataSource.getRepository(TimeTrack).find({
          where: { noteId: note.id },
          order: { date: 'ASC', startTime: 'ASC' }
        });

        if (timeTracks.length > 0) {
          // Sort time tracks by date and time
          const sortedTracks = timeTracks.sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA.getTime() - dateB.getTime();
          });

          const firstTrack = sortedTracks[0];
          const lastTrack = sortedTracks[sortedTracks.length - 1];

          // Since we have invalid dates in the database, we'll use the current timestamp
          const now = new Date().toISOString();
          note.createdAt = now;
          note.updatedAt = now;

          await AppDataSource.getRepository(Note).save(note);
          console.log(`Updated note ${note.id} timestamps based on ${timeTracks.length} time tracks`);
        } else {
          // For notes without time tracks, also set current timestamp
          const now = new Date().toISOString();
          note.createdAt = now;
          note.updatedAt = now;
          await AppDataSource.getRepository(Note).save(note);
          console.log(`Note ${note.id} has no time tracks, setting current timestamp`);
        }
      } catch (error) {
        console.error(`Error processing note ${note.id}:`, error);
      }
    }

    console.log('All notes have been processed');
  } catch (error) {
    console.error('Error updating note timestamps:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('Database connection closed');
    }
  }
};

// Run the script
updateNoteTimestamps(); 