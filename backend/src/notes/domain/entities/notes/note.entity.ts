import {
  Entity,
  Column,
  ManyToMany,
  JoinColumn,
  OneToOne,
  JoinTable,
  OneToMany,
} from "typeorm";
import { Memo } from "./memo.entity";
import { Tag } from "../tag/tag.entity";
import { BaseEntity } from "../../../../shared-kernel/domain/entities/base.entity";
import { CheckItem } from "./check-item.entity";

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

  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable({
    name: "note_tags",
    joinColumn: {
      name: "note_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "tag_id",
      referencedColumnName: "id",
    },
  })
  tags: Tag[];

  @OneToMany(() => CheckItem, (checkItem) => checkItem.note)
  checkItems: CheckItem[];
}
