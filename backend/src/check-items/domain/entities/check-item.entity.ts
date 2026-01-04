import {
  Entity,
  Column,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('check_items')
export class CheckItem {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column()
  name: string;

  @Column({ name: 'done_date', nullable: true })
  doneDate: Date | null;

  @Column({ name: 'archived_date', nullable: true })
  archiveDate: Date | null;

  @Column({ name: 'note_id' })
  @JoinColumn({ name: 'note_id' })
  noteId: number;

  @Column({ name: 'order', type: 'integer', default: 0 })
  order: number;
}
