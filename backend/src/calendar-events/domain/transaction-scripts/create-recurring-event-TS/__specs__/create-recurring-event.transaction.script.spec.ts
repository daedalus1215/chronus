import { Test, TestingModule } from '@nestjs/testing';
import { CreateRecurringEventTransactionScript } from '../create-recurring-event.transaction.script';
import { RecurringEventRepository } from '../../../../infra/repositories/recurring-event.repository';
import { GenerateEventInstancesTransactionScript } from '../../../transaction-scripts/generate-event-instances-TS/generate-event-instances.transaction.script';
import { CreateRecurringEventCommand } from '../create-recurring-event.command';
import { RecurringEvent } from '../../../../domain/entities/recurring-event.entity';
import { EventInstance } from '../../../../domain/entities/event-instance.entity';
import { RecurringEventToInfrastructureConverter } from '../recurring-event-to-infrastructure.converter';
import { RecurringEventToDomainConverter } from '../recurring-event-to-domain.converter';
import { RecurringEventEntity } from '../../../../infra/entities/recurring-event.entity';
import { generateRandomNumbers, createMock } from 'src/shared-kernel/test-utils';
import { addYears, addDays } from 'date-fns';

describe('CreateRecurringEventTransactionScript', () => {
  let target: CreateRecurringEventTransactionScript;
  let mockRecurringEventRepository: jest.Mocked<RecurringEventRepository>;
  let mockGenerateEventInstancesTransactionScript: jest.Mocked<GenerateEventInstancesTransactionScript>;
  let mockToInfrastructureConverter: jest.Mocked<RecurringEventToInfrastructureConverter>;
  let mockToDomainConverter: jest.Mocked<RecurringEventToDomainConverter>;

  const mockUser = {
    userId: generateRandomNumbers(),
    username: 'testuser',
  };

  const validCommand: CreateRecurringEventCommand = {
    title: 'Weekly Team Meeting',
    description: 'Standup meeting',
    startDate: new Date('2024-01-15T10:00:00Z'),
    endDate: new Date('2024-01-15T11:00:00Z'),
    recurrencePattern: {
      type: 'WEEKLY',
      interval: 1,
      daysOfWeek: [1, 3, 5],
    },
    recurrenceEndDate: new Date('2024-12-31T23:59:59Z'),
    noEndDate: false,
    user: mockUser,
  };

  beforeEach(async () => {
    mockRecurringEventRepository = createMock<RecurringEventRepository>({
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    });

    mockGenerateEventInstancesTransactionScript = createMock<GenerateEventInstancesTransactionScript>({
      apply: jest.fn(),
    });

    mockToInfrastructureConverter = createMock<RecurringEventToInfrastructureConverter>({
      apply: jest.fn(),
    });

    mockToDomainConverter = createMock<RecurringEventToDomainConverter>({
      apply: jest.fn(),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRecurringEventTransactionScript,
        {
          provide: RecurringEventRepository,
          useValue: mockRecurringEventRepository,
        },
        {
          provide: GenerateEventInstancesTransactionScript,
          useValue: mockGenerateEventInstancesTransactionScript,
        },
        {
          provide: RecurringEventToInfrastructureConverter,
          useValue: mockToInfrastructureConverter,
        },
        {
          provide: RecurringEventToDomainConverter,
          useValue: mockToDomainConverter,
        },
      ],
    }).compile();

    target = module.get<CreateRecurringEventTransactionScript>(
      CreateRecurringEventTransactionScript,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('apply', () => {
    it('should create a recurring event with valid command', async () => {
      const mockDomainEvent: RecurringEvent = {
        id: generateRandomNumbers(),
        userId: mockUser.userId,
        title: validCommand.title,
        description: validCommand.description,
        startDate: validCommand.startDate,
        endDate: validCommand.endDate,
        recurrencePattern: validCommand.recurrencePattern,
        recurrenceEndDate: validCommand.recurrenceEndDate,
        noEndDate: validCommand.noEndDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInfrastructureEntity: RecurringEventEntity = {
        id: mockDomainEvent.id,
        userId: mockUser.userId,
        title: validCommand.title,
        description: validCommand.description,
        startDate: validCommand.startDate,
        endDate: validCommand.endDate,
        recurrenceType: validCommand.recurrencePattern.type,
        recurrenceInterval: validCommand.recurrencePattern.interval,
        daysOfWeek: validCommand.recurrencePattern.daysOfWeek?.join(','),
        dayOfMonth: undefined,
        monthOfYear: undefined,
        recurrenceEndDate: validCommand.recurrenceEndDate,
        noEndDate: validCommand.noEndDate,
        rruleString: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RecurringEventEntity;

      const mockInstances: EventInstance[] = [
        {
          id: generateRandomNumbers(),
          recurringEventId: mockDomainEvent.id,
          instanceDate: new Date('2024-01-15T00:00:00Z'),
          startDate: new Date('2024-01-15T10:00:00Z'),
          endDate: new Date('2024-01-15T11:00:00Z'),
          isModified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockToInfrastructureConverter.apply.mockReturnValue(
        mockInfrastructureEntity as Partial<RecurringEventEntity>,
      );
      mockRecurringEventRepository.create.mockResolvedValue(
        mockInfrastructureEntity,
      );
      mockToDomainConverter.apply.mockReturnValue(mockDomainEvent);
      mockGenerateEventInstancesTransactionScript.apply.mockResolvedValue(
        mockInstances,
      );

      const result = await target.apply(validCommand);

      expect(result).toEqual(mockDomainEvent);
      expect(mockToInfrastructureConverter.apply).toHaveBeenCalled();
      expect(mockRecurringEventRepository.create).toHaveBeenCalledWith(
        mockInfrastructureEntity,
      );
      expect(mockToDomainConverter.apply).toHaveBeenCalledWith(
        mockInfrastructureEntity,
      );
      expect(mockGenerateEventInstancesTransactionScript.apply).toHaveBeenCalled();
    });


    it('should generate instances for "no end date" series up to 2 years ahead', async () => {
      const noEndDateCommand: CreateRecurringEventCommand = {
        ...validCommand,
        recurrenceEndDate: undefined,
        noEndDate: true,
      };

      const mockDomainEvent: RecurringEvent = {
        id: generateRandomNumbers(),
        userId: mockUser.userId,
        title: noEndDateCommand.title,
        description: noEndDateCommand.description,
        startDate: noEndDateCommand.startDate,
        endDate: noEndDateCommand.endDate,
        recurrencePattern: noEndDateCommand.recurrencePattern,
        recurrenceEndDate: undefined,
        noEndDate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInfrastructureEntity: RecurringEventEntity = {
        id: mockDomainEvent.id,
        userId: mockUser.userId,
        title: noEndDateCommand.title,
        description: noEndDateCommand.description,
        startDate: noEndDateCommand.startDate,
        endDate: noEndDateCommand.endDate,
        recurrenceType: noEndDateCommand.recurrencePattern.type,
        recurrenceInterval: noEndDateCommand.recurrencePattern.interval,
        daysOfWeek: noEndDateCommand.recurrencePattern.daysOfWeek?.join(','),
        dayOfMonth: undefined,
        monthOfYear: undefined,
        recurrenceEndDate: undefined,
        noEndDate: true,
        rruleString: 'FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as RecurringEventEntity;

      mockToInfrastructureConverter.apply.mockReturnValue(
        mockInfrastructureEntity as Partial<RecurringEventEntity>,
      );
      mockRecurringEventRepository.create.mockResolvedValue(
        mockInfrastructureEntity,
      );
      mockToDomainConverter.apply.mockReturnValue(mockDomainEvent);
      mockGenerateEventInstancesTransactionScript.apply.mockResolvedValue([]);

      await target.apply(noEndDateCommand);

      expect(mockGenerateEventInstancesTransactionScript.apply).toHaveBeenCalledWith(
        mockDomainEvent,
        expect.any(Date),
        expect.any(Date),
      );

      const callArgs =
        mockGenerateEventInstancesTransactionScript.apply.mock.calls[0];
      const rangeEnd = callArgs[2];
      const expectedEndDate = addYears(noEndDateCommand.startDate, 2);

      expect(rangeEnd.getTime()).toBeCloseTo(expectedEndDate.getTime(), -3);
    });
  });
});

