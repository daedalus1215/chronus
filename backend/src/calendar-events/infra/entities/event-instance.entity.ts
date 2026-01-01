import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RecurringEventEntity } from './recurring-event.entity';

/**
 * Infrastructure entity for EventInstance.
 * TypeORM entity for database persistence.
 */
@Entity({ name: 'event_instances' })
@Index(['recurringEventId'])
@Index(['instanceDate'])
export class EventInstanceEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ name: 'recurring_event_id', type: 'int' })
  recurringEventId: number;

  @Column({ name: 'instance_date', type: 'date' })
  instanceDate: Date;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @Column({ name: 'is_modified', type: 'boolean', default: false })
  isModified: boolean;

  @Column({ name: 'title_override', type: 'varchar', length: 255, nullable: true })
  titleOverride?: string;

  @Column({ name: 'description_override', type: 'text', nullable: true })
  descriptionOverride?: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt: Date;

  @ManyToOne(() => RecurringEventEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recurring_event_id' })
  recurringEvent: RecurringEventEntity;
}

