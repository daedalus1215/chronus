import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdatePasswordTransactionScript } from '../update-password.transaction.script';
import { UserRepository } from '../../../../infra/repositories/user.repository';
import { generateRandomNumbers } from 'src/shared-kernel/test-utils';

describe('UpdatePasswordTransactionScript', () => {
  let target: UpdatePasswordTransactionScript;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const userId = generateRandomNumbers();
  const currentPassword = 'currentpass123';
  const currentPasswordHash = bcrypt.hashSync(currentPassword, 10);

  const mockUser = {
    id: userId,
    username: 'testuser',
    password: currentPasswordHash,
    createdAt: new Date('2024-01-15T09:00:00Z'),
    updatedAt: new Date('2024-01-15T09:00:00Z'),
  };

  const mockAuthUser = { userId, username: 'testuser' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePasswordTransactionScript,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    target = module.get<UpdatePasswordTransactionScript>(
      UpdatePasswordTransactionScript
    );
    mockUserRepository = module.get(UserRepository);
  });

  describe('apply', () => {
    const validCommand = {
      userId,
      currentPassword,
      newPassword: 'newpassword123',
      user: mockAuthUser,
    };

    it('should hash and store the new password', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      await target.apply(validCommand);

      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        password: expect.any(String),
      });
      // The stored value must be a hash, not the raw password
      const storedPassword =
        mockUserRepository.update.mock.calls[0][1].password;
      expect(storedPassword).not.toBe(validCommand.newPassword);
      expect(
        await bcrypt.compare(validCommand.newPassword, storedPassword)
      ).toBe(true);
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

    it('should throw BadRequestException when the new password is too short', async () => {
      // Arrange
      const command = { ...validCommand, newPassword: 'short' };

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when the new password is too long', async () => {
      // Arrange
      const command = { ...validCommand, newPassword: 'a'.repeat(51) };

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

    it('should throw UnauthorizedException when the current password is incorrect', async () => {
      // Arrange
      const command = { ...validCommand, currentPassword: 'wrongpassword' };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(
        UnauthorizedException
      );
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when the new password matches the current one', async () => {
      // Arrange
      const command = { ...validCommand, newPassword: currentPassword };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      // Act / Assert
      await expect(target.apply(command)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });
});
