// import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from "typeorm";
// import { ChecklistItem } from "./checklistitem.entity";
// import { Note } from "../note.entity";


// @Entity('checklists')
// export class Checklist {
//   @PrimaryGeneratedColumn()
//   id: string;

//   @ManyToMany(() => ChecklistItem, (item) => item.checklists)
//   @JoinTable({
//     name: "checklists_checklistItems",
//     joinColumn: { name: "checklist_id", referencedColumnName: "id" },
//     inverseJoinColumn: {
//       name: "checklist_item_id",
//       referencedColumnName: "id",
//     },
//   })
//   checklist_items: ChecklistItem[];

//   @OneToMany(() => Note, (note) => note.checklist)
//   notes: Note[];
// }