import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
} from 'typeorm';

@Entity('check_items')
export class CheckItem {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ name: 'done_date', nullable: true })
  doneDate: Date | null;

  @Column({ name: 'archived_date', nullable: true })
  archiveDate: Date | null;

  @Column({ name: 'note_id' })
  noteId: number;

  @Column({ name: 'order', type: 'integer', default: 0 })
  order: number;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'ready' })
  status: 'ready' | 'in_progress' | 'review' | 'done';

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;
}

export class CheckItemResponseDto {
  id: number;
  name: string;
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  order: number;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  description: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(checkItem: {
    id: number;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    doneDate: Date | null;
    archiveDate: Date | null;
    noteId: number;
    order: number;
    status: 'ready' | 'in_progress' | 'review' | 'done';
    description: string | null;
  }) {
    return { ...checkItem };
  }
}
