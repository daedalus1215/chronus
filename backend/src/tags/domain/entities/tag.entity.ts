import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Tag entity decoupled from Note entity.
 */
@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column('text', {default: ''})
  description: string;

  @Column({name: 'user_id'})
  userId: number;
} 