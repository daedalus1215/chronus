// import { Entity, PrimaryGeneratedColumn, ManyToMany, Column } from "typeorm";
// import { Checklist } from "./checklist.entity";


// @Entity("checklist_items")
// export class ChecklistItem {
//   @PrimaryGeneratedColumn()
//   id: string;

//   @Column("varchar")
//   name: string;  // Add a name for the checklist item

//   @ManyToMany(() => Checklist, (checklist) => checklist.checklist_items)
//   checklists: Checklist[];

//   // Optional: If you still want the dates in the join table, they will live there, not here
// }