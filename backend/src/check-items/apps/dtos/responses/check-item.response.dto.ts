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
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

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
}

export class CheckItemResponseDto {
  id: number;
  name: string;
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  order: number;
  status: 'ready' | 'in_progress' | 'review' | 'done';
  createdAt: string;
  updatedAt: string;

  constructor(checkItem: CheckItem) {
    this.id = checkItem.id;
    this.name = checkItem.name;
    this.doneDate = checkItem.doneDate;
    this.archiveDate = checkItem.archiveDate;
    this.noteId = checkItem.noteId;
    this.order = checkItem.order;
    this.status = checkItem.status;
    this.createdAt = checkItem.createdAt;
    this.updatedAt = checkItem.updatedAt;
  }
}
