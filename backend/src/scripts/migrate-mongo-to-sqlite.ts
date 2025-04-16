import { DataSource } from 'typeorm';
import { Note } from '../notes/domain/entities/notes/note.entity';
import { Memo } from '../notes/domain/entities/notes/memo.entity';
import { Tag } from '../notes/domain/entities/tag/tag.entity';
import { TimeTrack } from '../time-tracks/domain/entities/time-track-entity/time-track.entity';
import * as fs from 'fs';
import * as path from 'path';

type MongoTask = {
  _id: string;
  tags?: string[];
  time?: Array<{
    _id: string;
    date: string;
    time: number;
  }>;
  contractId: number;
  description: string;
  date: string;
  title: string;
};

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: path.resolve(__dirname, '../../../chronus.db'),
  entities: [Note, Memo, Tag, TimeTrack],
  synchronize: true,
});

const migrateData = async () => {
  try {
    await AppDataSource.initialize();
    console.log('Database initialized');

    // Read MongoDB export JSON file
    const rawData = fs.readFileSync(path.resolve(__dirname, '../../../mongo-export.json'), 'utf-8');
    const tasks: MongoTask[] = rawData.split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (e) {
          console.error('Failed to parse line:', line);
          return null;
        }
      })
      .filter(task => task !== null);

    console.log(`Found ${tasks.length} tasks to migrate`);

    // Use a fixed user ID for migration
    const userId = '1'; // You'll need to adjust this based on your needs

    for (const task of tasks) {
      try {
        console.log(`Processing task: ${task.title || 'Untitled'}`);
        
        // Create or find tags
        const tagEntities: Tag[] = [];
        if (task.tags && Array.isArray(task.tags)) {
          for (const tagName of task.tags) {
            let tag = await AppDataSource.getRepository(Tag).findOne({
              where: { name: tagName, userId }
            });

            if (!tag) {
              tag = new Tag();
              tag.name = tagName;
              tag.userId = userId;
              tag.description = '';
              await AppDataSource.getRepository(Tag).save(tag);
            }

            tagEntities.push(tag);
          }
        }

        // Create memo
        const memo = new Memo();
        memo.description = task.description || '';
        await AppDataSource.getRepository(Memo).save(memo);

        // Create note
        const note = new Note();
        note.name = task.title || 'Untitled';
        note.userId = userId;
        note.memo = memo;
        note.tags = tagEntities;
        await AppDataSource.getRepository(Note).save(note);

        // Create time tracks if they exist
        if (task.time && Array.isArray(task.time)) {
          for (const timeEntry of task.time) {
            const timeTrack = new TimeTrack();
            timeTrack.userId = userId;
            timeTrack.noteId = note.id;
            timeTrack.date = new Date(timeEntry.date);
            timeTrack.startTime = new Date(timeEntry.date).toTimeString().split(' ')[0];
            timeTrack.durationMinutes = Math.floor(timeEntry.time / (1000 * 60)); // Convert milliseconds to minutes
            await AppDataSource.getRepository(TimeTrack).save(timeTrack);
          }
        }

        console.log(`Successfully migrated task: ${task.title || 'Untitled'}`);
      } catch (error) {
        console.error(`Failed to migrate task: ${task.title || 'Untitled'}`, error);
        // Continue with next task
        continue;
      }
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

migrateData(); 