import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CalendarEventEntity } from '../entities/calendar-event.entity';
import { CalendarEvent } from '../../domain/entities/calendar-event.entity';

/**
 * Repository for calendar events.
 * Handles all database operations and mapping between domain and infrastructure entities.
 */
@Injectable()
export class CalendarEventRepository {
  constructor(
    @InjectRepository(CalendarEventEntity)
    private readonly repository: Repository<CalendarEventEntity>,
  ) {}

  /**
   * Create a new calendar event.
   */
  async create(event: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const entity = this.domainToInfrastructure(event);
    const saved = await this.repository.save(entity);
    return this.infrastructureToDomain(saved);
  }

  /**
   * Find calendar events by date range for a specific user.
   * Returns events that overlap with the date range (events that start before endDate and end after startDate).
   */
  async findByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<CalendarEvent[]> {
    const entities = await this.repository
      .createQueryBuilder('calendar_event')
      .where('calendar_event.user_id = :userId', { userId })
      .andWhere('calendar_event.start_date <= :endDate', { endDate })
      .andWhere('calendar_event.end_date >= :startDate', { startDate })
      .orderBy('calendar_event.start_date', 'ASC')
      .getMany();
    return entities.map((entity) => this.infrastructureToDomain(entity));
  }

  /**
   * Find a calendar event by ID and user ID.
   */
  async findById(id: number, userId: number): Promise<CalendarEvent | null> {
    const entity = await this.repository.findOne({
      where: { id, userId },
    });
    if (!entity) {
      return null;
    }
    return this.infrastructureToDomain(entity);
  }

  /**
   * Update a calendar event.
   */
  async update(
    id: number,
    userId: number,
    updates: Partial<CalendarEvent>,
  ): Promise<CalendarEvent> {
    const entity = await this.repository.findOne({
      where: { id, userId },
    });
    if (!entity) {
      throw new Error('Calendar event not found');
    }
    const updatedEntity = this.repository.merge(
      entity,
      this.domainToInfrastructure(updates),
    );
    const saved = await this.repository.save(updatedEntity);
    return this.infrastructureToDomain(saved);
  }

  /**
   * Delete a calendar event by ID and user ID.
   */
  async delete(id: number, userId: number): Promise<void> {
    const result = await this.repository.delete({ id, userId });
    if (result.affected === 0) {
      throw new Error('Calendar event not found');
    }
  }

  /**
   * Map domain entity to infrastructure entity.
   */
  private domainToInfrastructure(
    domain: Partial<CalendarEvent>,
  ): Partial<CalendarEventEntity> {
    return {
      id: domain.id,
      userId: domain.userId,
      title: domain.title,
      description: domain.description,
      startDate: domain.startDate,
      endDate: domain.endDate,
      createdAt: domain.createdAt,
      updatedAt: domain.updatedAt,
    };
  }

  /**
   * Map infrastructure entity to domain entity.
   */
  private infrastructureToDomain(
    infra: CalendarEventEntity,
  ): CalendarEvent {
    return {
      id: infra.id,
      userId: infra.userId,
      title: infra.title,
      description: infra.description,
      startDate: infra.startDate,
      endDate: infra.endDate,
      createdAt: infra.createdAt,
      updatedAt: infra.updatedAt,
    };
  }
}

