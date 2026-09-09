import {
  Entity,
  Column,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Note } from './note.entity';

@Entity('memos')
export class Memo {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

  @Column({ name: 'description', type: 'text', default: '' })
  description: string;

  @OneToOne(() => Note, note => note.id, { onDelete: 'CASCADE' })
  note: Note;
}
