import { Entity, Column, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class TimeTrack {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @CreateDateColumn({ name: "created_at", type: "text" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at", type: "text" })
  updatedAt: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'note_id' })
  noteId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;
} 