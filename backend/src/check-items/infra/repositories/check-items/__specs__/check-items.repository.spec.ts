import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckItemsRepository } from '../check-items.repository';
import { CheckItem } from '../../../../domain/entities/check-item.entity';
import { CheckItemsHydrator } from '../check-items.hydrator';

describe('CheckItemsRepository', () => {
  let repository: CheckItemsRepository;
  let mockQb: any;
  let mockTypeOrmRepo: any;
  let mockHydrator: any;

  beforeEach(async () => {
    mockQb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    mockTypeOrmRepo = {
      createQueryBuilder: jest.fn().mockReturnThis(),
    };

    // Patch createQueryBuilder to return our mockQb
    mockTypeOrmRepo.createQueryBuilder = jest.fn(() => mockQb);

    mockHydrator = {
      fromRawResult: jest.fn(),
      fromRawResults: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckItemsRepository,
        {
          provide: getRepositoryToken(CheckItem),
          useValue: mockTypeOrmRepo,
        },
        {
          provide: CheckItemsHydrator,
          useValue: mockHydrator,
        },
      ],
    }).compile();

    repository = module.get<CheckItemsRepository>(CheckItemsRepository);
  });

  describe('searchByQuery', () => {
    it('should search by name OR description', async () => {
      mockQb.getRawMany.mockResolvedValue([
        {
          noteId: 1,
          noteName: 'My Note',
          checkItemId: 10,
          checkItemName: 'Test item',
          checkItemDescription: null,
          checkItemStatus: 'ready',
          checkItemArchived: 'false',
        },
      ]);

      await repository.searchByQuery(1, 'test');

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        '(LOWER(checkItem.name) LIKE LOWER(:query) OR (checkItem.description IS NOT NULL AND LOWER(checkItem.description) LIKE LOWER(:query)))',
        { query: '%test%' }
      );
    });

    it('should exclude archived items by default', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      await repository.searchByQuery(1, 'test');

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'checkItem.archived_date IS NULL'
      );
    });

    it('should include archived items when includeArchived=true', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      await repository.searchByQuery(1, 'test', { includeArchived: true });

      expect(mockQb.andWhere).not.toHaveBeenCalledWith(
        'checkItem.archived_date IS NULL'
      );
    });

    it('should filter by status when provided', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      await repository.searchByQuery(1, 'test', { status: 'done' });

      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'checkItem.status = :status',
        { status: 'done' }
      );
    });

    it('should apply combined filters (archived + status)', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      await repository.searchByQuery(1, 'test', {
        includeArchived: true,
        status: 'in_progress',
        limit: 50,
      });

      // archived filter should NOT be applied
      expect(mockQb.andWhere).not.toHaveBeenCalledWith(
        'checkItem.archived_date IS NULL'
      );
      // status filter should be applied
      expect(mockQb.andWhere).toHaveBeenCalledWith(
        'checkItem.status = :status',
        { status: 'in_progress' }
      );
      // custom limit
      expect(mockQb.limit).toHaveBeenCalledWith(50);
    });

    it('should default limit to 20', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      await repository.searchByQuery(1, 'test');

      expect(mockQb.limit).toHaveBeenCalledWith(20);
    });

    it('should return enriched result shape', async () => {
      mockQb.getRawMany.mockResolvedValue([
        {
          noteId: 1,
          noteName: 'Task Note',
          checkItemId: 5,
          checkItemName: 'Deploy',
          checkItemDescription: 'Deploy to production',
          checkItemStatus: 'in_progress',
          checkItemArchived: 'false',
        },
      ]);

      const result = await repository.searchByQuery(1, 'deploy');

      expect(result[0].checkItemId).toBe(5);
      expect(result[0].checkItemDescription).toBe('Deploy to production');
      expect(result[0].checkItemStatus).toBe('in_progress');
    });

    it('should select all required fields', async () => {
      mockQb.getRawMany.mockResolvedValue([]);
      await repository.searchByQuery(1, 'test');

      expect(mockQb.addSelect).toHaveBeenCalledWith(
        'checkItem.id',
        'checkItemId'
      );
      expect(mockQb.addSelect).toHaveBeenCalledWith(
        'checkItem.description',
        'checkItemDescription'
      );
      expect(mockQb.addSelect).toHaveBeenCalledWith(
        'checkItem.status',
        'checkItemStatus'
      );
    });
  });
});
