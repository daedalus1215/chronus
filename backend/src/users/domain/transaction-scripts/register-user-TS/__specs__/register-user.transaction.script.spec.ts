import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { RegisterUserTransactionScript } from '../register-user.transaction.script';
import { UserRepository } from '../../../../infra/repositories/user.repository';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('RegisterUserTransactionScript', () => {
  let target: RegisterUserTransactionScript;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: generateRandomNumbers(),
    username: 'testuser@example.com',
    password: 'hashedpassword',
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserTransactionScript,
        {
          provide: UserRepository,
          useValue: {
            findByUsername: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    target = module.get<RegisterUserTransactionScript>(
      RegisterUserTransactionScript
    );
    mockUserRepository = module.get(UserRepository);
  });

  describe('apply', () => {
    const validCommand = {
      username: 'testuser@example.com',
      password: 'secret123',
    };

    it('should register a new user and return a projection without password', async () => {
      // Arrange
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await target.apply(validCommand);

      // Assert
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
        validCommand.username
      );
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: validCommand.username,
        password: expect.any(String),
      });
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw ConflictException when username already exists', async () => {
      // Arrange
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);

      // Act / Assert
      await expect(target.apply(validCommand)).rejects.toThrow(
        ConflictException
      );
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the unique constraint race is lost', async () => {
      // Arrange
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.create.mockRejectedValue(
        new QueryFailedError(
          'INSERT INTO users',
          [],
          new Error('UNIQUE constraint failed: users.username')
        )
      );

      // Act / Assert
      await expect(target.apply(validCommand)).rejects.toThrow(
        ConflictException
      );
    });
  });
});
