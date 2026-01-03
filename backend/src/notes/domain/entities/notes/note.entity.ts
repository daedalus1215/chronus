import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Memo } from "./memo.entity";

/**
 * Note entity decoupled from Tag entity.
 * CheckItems are accessed via CheckItemsAggregator, not through a direct relation.
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
}
