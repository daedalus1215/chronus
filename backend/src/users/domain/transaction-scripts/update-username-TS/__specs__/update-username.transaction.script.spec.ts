import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUsernameTransactionScript } from '../update-username.transaction.script';
import { UserRepository } from '../../../../infra/repositories/user.repository';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('UpdateUsernameTransactionScript', () => {
  let target: UpdateUsernameTransactionScript;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const userId = generateRandomNumbers();
  const currentPassword = 'currentpass123';
  const currentPasswordHash = bcrypt.hashSync(currentPassword, 10);

  const mockUser = {
    id: userId,
    username: 'currentuser',
    password: currentPasswordHash,
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z',
  };

  const mockAuthUser = { userId, username: 'currentuser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateUsernameTransactionScript,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findByUsername: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    target = module.get<UpdateUsernameTransactionScript>(
      UpdateUsernameTransactionScript
    );
    mockUserRepository = module.get(UserRepository);
  });

  describe('apply', () => {
    const validCommand = {
      userId,
      newUsername: 'newusername',
      currentPassword,
      user: mockAuthUser,
    };

    it('should update the username and return a projection without password', async () => {
      // Arrange
      const updatedUser = { ...mockUser, username: 'newusername' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await target.apply(validCommand);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith(
        'newusername'
      );
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        username: 'newusername',
      });
      expect(result).toEqual({
        id: userId,
        username: 'newusername',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should trim the new username before comparing and saving', async () => {
      // Arrange
      const command = { ...validCommand, newUsername: '  newuser  ' };
      const updatedUser = { ...mockUser, username: 'newuser' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      await target.apply(command);

      // Assert
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        username: 'newuser',
      });
    });

    it('should throw UnauthorizedException when updating another account', async () => {
      // Arrange
      const command = {
        ...validCommand,
        user: { userId: userId + 1, username: 'otheruser' },
      };

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserRepository.findById).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when username is too short', async () => {
      // Arrange
      const command = { ...validCommand, newUsername: 'abc' };

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when username is too long', async () => {
      // Arrange
      const command = {
        ...validCommand,
        newUsername: 'a'.repeat(21),
      };

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      // Act / Assert
      await expect(target.apply(validCommand)).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException when the username is unchanged', async () => {
      // Arrange
      const command = { ...validCommand, newUsername: 'currentuser' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.findByUsername).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the username belongs to another user', async () => {
      // Arrange
      const otherUser = {
        ...mockUser,
        id: userId + 1,
        username: 'newusername',
      };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByUsername.mockResolvedValue(otherUser);

      // Act / Assert
      await expect(target.apply(validCommand)).rejects.toThrow(
        ConflictException
      );
    });

    it('should not treat the current user as a conflict in the uniqueness check', async () => {
      // Arrange -- findByUsername returns a row with the same id as the
      // target user (defensive exclusion branch: existingUser.id !== userId)
      const command = { ...validCommand, newUsername: 'otheruser' };
      const updatedUser = { ...mockUser, username: 'otheruser' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByUsername.mockResolvedValue({
        ...mockUser,
        username: 'otheruser',
      });
      mockUserRepository.update.mockResolvedValue(updatedUser);

      // Act
      const result = await target.apply(command);

      // Assert
      expect(result.username).toBe('otheruser');
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        username: 'otheruser',
      });
    });

    it('should throw UnauthorizedException when the current password is incorrect', async () => {
      // Arrange
      const command = { ...validCommand, currentPassword: 'wrongpassword' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.findByUsername.mockResolvedValue(null);

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
