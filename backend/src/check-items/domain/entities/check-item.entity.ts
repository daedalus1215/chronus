import { Entity, Column, JoinColumn, UpdateDateColumn, CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity("check_items")
export class CheckItem {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @CreateDateColumn({ name: "created_at", type: "text" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at", type: "text" })
  updatedAt: string;
  
  @Column()
  name: string;

  @Column({ name: "done_date", nullable: true })
  doneDate: Date | null;

  @Column({ name: "archived_date", nullable: true })
  archiveDate: Date | null;

  @Column({ name: "note_id" })
  @JoinColumn({ name: "note_id" })
  noteId: number;
} 