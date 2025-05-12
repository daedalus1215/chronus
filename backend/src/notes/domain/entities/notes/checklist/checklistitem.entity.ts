import { Entity, PrimaryGeneratedColumn, ManyToMany, Column } from "typeorm";
import { Checklist } from "./checklist.entity";


@Entity("checklist_items")
export class ChecklistItem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column("varchar")
  name: string; 

  @ManyToMany(() => Checklist, (checklist) => checklist.checklist_items)
  checklists: Checklist[];
}