import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('note_versions')
export class NoteVersion {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'note_id', type: 'integer' })
  noteId: number;

  @Column({ name: 'version_num', type: 'integer' })
  versionNum: number;

  @Column({ name: 'description', type: 'text' })
  description: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
