import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { Note } from '../notes/note.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  name: string;

  @Column('text', {default: ''})
  description: string;

  @Column({name: 'user_id'})
  userId: string;


  @ManyToMany(() => Note, (note) => note.tags)
  notes: Note[];
}