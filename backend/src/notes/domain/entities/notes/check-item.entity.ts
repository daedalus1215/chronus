import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { BaseEntity } from "src/shared-kernel/domain/entities/base.entity";
import { Note } from "./note.entity";

@Entity("check_items")
export class CheckItem extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "done_date", nullable: true })
  doneDate: Date;

  @Column({ name: "archived_date", nullable: true })
  archiveDate: Date;

  @ManyToOne(() => Note, (note) => note.checkItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "note_id" }) 
  note: Note;
}
