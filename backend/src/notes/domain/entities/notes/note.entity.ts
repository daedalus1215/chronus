import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Memo } from "./memo.entity";
import { CheckItem } from "src/check-items/domain/entities/check-item.entity";

/**
 * Note entity decoupled from Tag entity.
 */
@Entity("notes")
export class Note {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @CreateDateColumn({ name: "created_at", type: "text" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at", type: "text" })
  updatedAt: string;
  
  @OneToOne(() => Memo, (memo) => memo.id, {
    cascade: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "memo_id" })
  memo: Memo | null;

  @Column()
  name: string;

  @Column({ name: "user_id" })
  userId: number;

  @DeleteDateColumn({ name: "archived_at", nullable: true })
  archivedAt: Date | null;

  @OneToMany(() => CheckItem, (checkItem) => checkItem.noteId)
  checkItems: CheckItem[];
}
