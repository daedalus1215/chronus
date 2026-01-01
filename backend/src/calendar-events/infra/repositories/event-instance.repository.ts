import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { EventInstanceEntity } from '../entities/event-instance.entity';
import { EventInstance } from '../../domain/entities/event-instance.entity';

/**
 * Repository for event instances.
 * Handles all database operations and mapping between domain and infrastructure entities.
 */
@Injectable()
export class EventInstanceRepository {
  constructor(
    @InjectRepository(EventInstanceEntity)
    private readonly repository: Repository<EventInstanceEntity>,
  ) {}

  /**
   * Create a new event instance.
   */
  async create(instance: Partial<EventInstance>): Promise<EventInstance> {
    const entity = this.domainToInfrastructure(instance);
    const saved = await this.repository.save(entity);
    return this.infrastructureToDomain(saved);
  }

  /**
   * Find event instances by recurring event ID.
   */
  async findByRecurringEventId(
    recurringEventId: number,
  ): Promise<EventInstance[]> {
    const entities = await this.repository.find({
      where: { recurringEventId },
      order: { instanceDate: 'ASC' },
    });
    return entities.map((entity) => this.infrastructureToDomain(entity));
  }

  /**
   * Find event instances by recurring event ID and date range.
   * Returns instances that overlap with the date range for a specific recurring event.
   */
  async findByRecurringEventIdAndDateRange(
    recurringEventId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<EventInstance[]> {
    const entities = await this.repository
      .createQueryBuilder('event_instance')
      .where('event_instance.recurring_event_id = :recurringEventId', {
        recurringEventId,
      })
      .andWhere('event_instance.start_date <= :endDate', { endDate })
      .andWhere('event_instance.end_date >= :startDate', { startDate })
      .orderBy('event_instance.start_date', 'ASC')
      .getMany();
    return entities.map((entity) => this.infrastructureToDomain(entity));
  }

  /**
   * Find event instances by date range.
   * Returns instances that overlap with the date range.
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<EventInstance[]> {
    const entities = await this.repository
      .createQueryBuilder('event_instance')
      .where('event_instance.start_date <= :endDate', { endDate })
      .andWhere('event_instance.end_date >= :startDate', { startDate })
      .orderBy('event_instance.start_date', 'ASC')
      .getMany();
    return entities.map((entity) => this.infrastructureToDomain(entity));
  }

  /**
   * Find an event instance by ID.
   */
  async findById(id: number): Promise<EventInstance | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    if (!entity) {
      return null;
    }
    return this.infrastructureToDomain(entity);
  }

  /**
   * Update an event instance.
   */
  async update(
    id: number,
    updates: Partial<EventInstance>,
  ): Promise<EventInstance> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    if (!entity) {
      throw new Error('Event instance not found');
    }
    const updatedEntity = this.repository.merge(
      entity,
      this.domainToInfrastructure(updates),
    );
    const saved = await this.repository.save(updatedEntity);
    return this.infrastructureToDomain(saved);
  }

  /**
   * Delete an event instance by ID.
   */
  async delete(id: number): Promise<void> {
    const result = await this.repository.delete({ id });
    if (result.affected === 0) {
      throw new Error('Event instance not found');
    }
  }

  /**
   * Map domain entity to infrastructure entity.
   */
  private domainToInfrastructure(
    domain: Partial<EventInstance>,
  ): Partial<EventInstanceEntity> {
    return {
      id: domain.id,
      recurringEventId: domain.recurringEventId,
      instanceDate: domain.instanceDate,
      startDate: domain.startDate,
      endDate: domain.endDate,
      isModified: domain.isModified,
      titleOverride: domain.titleOverride,
      descriptionOverride: domain.descriptionOverride,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  /**
   * Map infrastructure entity to domain entity.
   */
  private infrastructureToDomain(infra: EventInstanceEntity): EventInstance {
    return {
      id: infra.id,
      recurringEventId: infra.recurringEventId,
      instanceDate: infra.instanceDate,
      startDate: infra.startDate,
      endDate: infra.endDate,
      isModified: infra.isModified,
      titleOverride: infra.titleOverride,
      descriptionOverride: infra.descriptionOverride,
      createdAt: infra.createdAt,
      updatedAt: infra.updatedAt,
    };
  }
}

