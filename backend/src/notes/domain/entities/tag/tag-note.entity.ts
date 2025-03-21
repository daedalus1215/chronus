import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Tag } from "./tag.entity";
import { Note } from "../notes/note.entity";
import { BaseEntity } from "src/shared-kernel/domain/entities/base.entity";
@Entity("tag_notes")
export class TagNote extends BaseEntity {
@ManyToOne(() => Tag)
  @JoinColumn({ name: "tag_id" })
  tag: Tag;

  @ManyToOne(() => Note, (note) => note.id)
  @JoinColumn({ name: "notes_id" })
  notes: Note;

  @Column("date")
  archived_date: Date;
}
