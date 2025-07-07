import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  OneToMany,
} from "typeorm";
import { Memo } from "./memo.entity";
import { BaseEntity } from "../../../../shared-kernel/domain/entities/base.entity";
import { CheckItem } from "./check-item.entity";

/**
 * Note entity decoupled from Tag entity.
 */
@Entity("notes")
export class Note extends BaseEntity {
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
  userId: string;

  @Column({ name: "archived_date", nullable: true })
  archivedDate: Date;

  @OneToMany(() => CheckItem, (checkItem) => checkItem.note)
  checkItems: CheckItem[];
}
