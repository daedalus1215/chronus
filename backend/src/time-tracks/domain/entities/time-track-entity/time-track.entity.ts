import { BaseEntity } from 'src/shared-kernel/domain/entities/base.entity';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimeTrack extends BaseEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  noteId: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string;

  @Column()
  durationMinutes: number;
} 