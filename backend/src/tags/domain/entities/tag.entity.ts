import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Tag entity decoupled from Note entity.
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column('text', { default: '' })
  description: string;

  @Column({ name: 'user_id' })
  userId: number;
}
