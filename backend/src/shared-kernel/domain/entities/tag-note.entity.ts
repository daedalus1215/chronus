import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Note } from "src/notes/domain/entities/notes/note.entity";
import { Tag } from "src/tags/domain/entities/tag.entity";


@Entity("tag_notes")
export class TagNote extends BaseEntity {
  @Column({ name: "tag_id" })
  tagId: string;

  @ManyToOne(() => Tag)
  @JoinColumn({ name: "tag_id" })
  tag: Tag;

  @Column({ name: "notes_id" })
  noteId: string;

  @ManyToOne(() => Note, (note) => note.id)
  @JoinColumn({ name: "notes_id" })
  notes: Note;

  @Column({ name: "archived_date", nullable: true })
  archivedDate: Date;
}   