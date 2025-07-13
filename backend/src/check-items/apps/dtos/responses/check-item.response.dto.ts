import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "src/shared-kernel/domain/entities/base.entity";

@Entity("check_items")
export class CheckItem extends BaseEntity {
  @Column()
  name: string;

  @Column({ name: "done_date", nullable: true })
  doneDate: Date | null;

  @Column({ name: "archived_date", nullable: true })
  archiveDate: Date | null;

  @Column({ name: "note_id" })
  noteId: number;
}

export class CheckItemResponseDto {
  id: number;
  name: string;
  doneDate: Date | null;
  archiveDate: Date | null;
  noteId: number;
  createdAt: string;
  updatedAt: string;

  constructor(checkItem: CheckItem) {
    this.id = checkItem.id;
    this.name = checkItem.name;
    this.doneDate = checkItem.doneDate;
    this.archiveDate = checkItem.archiveDate;
    this.noteId = checkItem.noteId;
    this.createdAt = checkItem.createdAt;
    this.updatedAt = checkItem.updatedAt;
  }
} 