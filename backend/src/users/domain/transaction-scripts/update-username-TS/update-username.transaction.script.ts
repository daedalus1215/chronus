import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { UpdateUsernameCommand } from './update-username.command';
import { UserResponseProjection } from '../user-response.projection';
import * as bcrypt from 'bcrypt';

/**
 * Transaction script for updating user username.
 * Validates username format, uniqueness, and verifies current password.
 */
@Injectable()
export class UpdateUsernameTransactionScript {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Update user username.
   * Validates business rules and updates the username.
   */
  async apply(command: UpdateUsernameCommand): Promise<UserResponseProjection> {
    const { userId, newUsername, currentPassword, user } = command;

    // Verify user is updating their own account
    if (user.userId !== userId) {
      throw new UnauthorizedException("Cannot update another user's account");
    }

    // Validate username format (4-20 chars, matching RegisterUserRequestDto)
    if (
      !newUsername ||
      newUsername.trim().length < 4 ||
      newUsername.trim().length > 20
    ) {
      throw new BadRequestException(
        'Username must be between 4 and 20 characters'
      );
    }

    const trimmedUsername = newUsername.trim();

    // Fetch current user once (entity includes the password hash for verification)
    const currentUser = await this.userRepository.findById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    if (currentUser.username === trimmedUsername) {
      throw new BadRequestException(
        'New username must be different from current username'
      );
    }

    // Check username uniqueness (excluding current user)
    const existingUser =
      await this.userRepository.findByUsername(trimmedUsername);
    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already exists');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      currentUser.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update username
    const updatedUser = await this.userRepository.update(userId, {
      username: trimmedUsername,
    });

    const { password: _hashedPassword, ...projection } = updatedUser;
    return projection;
  }
}
