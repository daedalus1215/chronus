import { Entity, Column, OneToOne } from "typeorm";
import { Note } from "./note.entity";
import { BaseEntity } from "src/shared-kernel/domain/entities/base.entity";

@Entity("memos")
export class Memo extends BaseEntity {
  @Column("text", { default: "" })
  description: string;

  @OneToOne(() => Note, (note) => note.id, { onDelete: "CASCADE" })
  note: Note;
}
