import { CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, Entity } from 'typeorm';

@Entity()
export class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ type: 'text' })  // Use 'text' for SQLite compatibility
  createdAt: string;

  @UpdateDateColumn({ type: 'text' })  // Use 'text' for SQLite compatibility
  updatedAt: string;
}
