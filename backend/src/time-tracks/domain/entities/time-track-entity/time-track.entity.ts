import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class TimeTrack {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'note_id' })
  noteId: number;

  // Deliberately NOT timestamptz, unlike every other date here. A time-track entry
  // means "on this calendar day, starting at this wall-clock time, for this many
  // minutes" — 9:00am stays 9:00am across a DST boundary. Postgres `date` and `time`
  // model that exactly; converting to an instant would require inventing a timezone
  // for 8251 existing rows. See D22 and specs/04-migrate-chronus.md.
  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;

  @Column({ type: 'varchar', nullable: true })
  note?: string;
}
