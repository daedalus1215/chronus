import { Entity, Column } from "typeorm";
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