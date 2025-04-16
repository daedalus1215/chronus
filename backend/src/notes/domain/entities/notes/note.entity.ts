import {
  Entity,
  Column,
  ManyToMany,
  JoinColumn,
  OneToOne,
  JoinTable,
  // PrimaryGeneratedColumn,
  // JoinColumn,
  // ManyToMany,
  // OneToOne,
} from "typeorm";
import { Memo } from "./memo.entity";
import { Tag } from "../tag/tag.entity";
import { BaseEntity } from "../../../../shared-kernel/domain/entities/base.entity";
// import { Checklist } from "./checklist/checklist.entity";
// import { Tag } from "../tag/tag.entity";

@Entity("notes")
export class Note extends BaseEntity {
  @OneToOne(() => Memo, (memo) => memo.id, {
    cascade: true,
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({name: "memo_id"})
  memo: Memo | null;

  // @OneToOne(() => Checklist, { nullable: true })
  // @JoinColumn({ name: "checklist_id" })
  // checklist: Checklist | null;

  @Column()
  name: string;

  @Column({ name: "user_id" })
  userId: string;

  @Column({ name: "date", nullable: true })
  archived_date: Date;


  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable({
    name: "note_tags",
    joinColumn: {
      name: "note_id",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "tag_id",
      referencedColumnName: "id"
    }
  })
  tags: Tag[];
}
