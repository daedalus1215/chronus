import { ConflictException, Injectable } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { UserRepository } from '../../../infra/repositories/user.repository';
import { RegisterUserCommand } from './register-user.command';
import { UserResponseProjection } from '../user-response.projection';
import * as bcrypt from 'bcrypt';

/**
 * Transaction script for registering a new user.
 * Checks username uniqueness, hashes the password, and persists the user.
 */
@Injectable()
export class RegisterUserTransactionScript {
  constructor(private readonly userRepository: UserRepository) {}

  /**
   * Register a new user.
   * Rejects duplicate usernames and returns a projection without the password.
   */
  async apply(command: RegisterUserCommand): Promise<UserResponseProjection> {
    const { username, password } = command;

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let savedUser;
    try {
      savedUser = await this.userRepository.create({
        username,
        password: hashedPassword,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        // Concurrent registration of the same username lost the race on the
        // unique constraint.
        throw new ConflictException('Username already exists');
      }
      throw error;
    }

    const { password: _hashedPassword, ...projection } = savedUser;
    return projection;
  }
}
