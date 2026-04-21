import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column()
  name: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'parent_id', nullable: true, type: 'integer' })
  parentId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;
}
