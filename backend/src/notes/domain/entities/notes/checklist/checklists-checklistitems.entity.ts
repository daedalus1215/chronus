// import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from "typeorm";
// import { Checklist } from "./checklist.entity";
// import { ChecklistItem } from "./checklistitem.entity";

// @Entity('checklists_checklistItems')
// export class ChecklistChecklistItem {
//   @PrimaryGeneratedColumn()
//   id: string;

//   @ManyToOne(() => Checklist, (checklist) => checklist.checklist_items)
//   checklist: Checklist;

//   @ManyToOne(() => ChecklistItem, (item) => item.checklists)
//   checklist_item: ChecklistItem;

//   @Column("date")
//   done_date: Date;

//   @Column("date")
//   archived_date: Date;
// }
