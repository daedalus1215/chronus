import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Note } from 'src/notes/domain/entities/notes/note.entity';
import { Tag } from 'src/tags/domain/entities/tag.entity';

@Entity('tag_notes')
export class TagNote {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

  @Column({ name: 'tag_id' })
  tagId: number;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: 'tag_id' })
  tag: Tag;

  @Column({ name: 'notes_id' })
  noteId: number;
  N;
  @ManyToOne(() => Note, note => note.id)
  @JoinColumn({ name: 'notes_id' })
  notes: Note;

  @Column({ name: 'archived_date', nullable: true })
  archivedDate: Date;
}
