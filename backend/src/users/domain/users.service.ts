import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { omit } from 'lodash';
import { User } from './entities/user.entity';
import { UserRepository } from '../infra/repositories/user.repository';
import { RegisterUserCommand } from './transaction-scripts/register-user-TS/register-user.command';
import { RegisterUserTransactionScript } from './transaction-scripts/register-user-TS/register-user.transaction.script';
import { UpdateUsernameTransactionScript } from './transaction-scripts/update-username-TS/update-username.transaction.script';
import { UpdatePasswordTransactionScript } from './transaction-scripts/update-password-TS/update-password.transaction.script';
import { UpdateUsernameCommand } from './transaction-scripts/update-username-TS/update-username.command';
import { UpdatePasswordCommand } from './transaction-scripts/update-password-TS/update-password.command';
import { UserResponseProjection } from './transaction-scripts/user-response.projection';
import type { DisabledRegistrationContext } from '../../security-events/domain/aggregators/security-event.aggregator';
import { SecurityEventAggregator } from '../../security-events/domain/aggregators/security-event.aggregator';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly registerUserTransactionScript: RegisterUserTransactionScript,
    private readonly updateUsernameTransactionScript: UpdateUsernameTransactionScript,
    private readonly updatePasswordTransactionScript: UpdatePasswordTransactionScript,
    private readonly configService: ConfigService,
    private readonly securityEventAggregator: SecurityEventAggregator
  ) {}

  /**
   * Register a new user. Checks ALLOW_REGISTRATION and logs via aggregator when disabled.
   * Called by UsersController - service orchestrates aggregator for cross-domain logging.
   */
  async register(
    command: RegisterUserCommand,
    context: DisabledRegistrationContext
  ): Promise<UserResponseProjection> {
    const defaultAllow =
      process.env.NODE_ENV === 'production' ? 'false' : 'true';
    const allowRegistration = this.configService.get<string>(
      'ALLOW_REGISTRATION',
      defaultAllow
    );
    if (allowRegistration !== 'true') {
      await this.securityEventAggregator.logDisabledRegistrationAttempt(
        context
      );
      throw new ForbiddenException('Registration is disabled');
    }
    return this.registerUserTransactionScript.apply(command);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateEmail(
    userId: number,
    email: string
  ): Promise<Omit<User, 'password'>> {
    const updatedUser = await this.userRepository.update(userId, { email });
    return omit(updatedUser, ['password']);
  }

  async updateUsername(
    command: UpdateUsernameCommand
  ): Promise<UserResponseProjection> {
    return await this.updateUsernameTransactionScript.apply(command);
  }

  async updatePassword(command: UpdatePasswordCommand): Promise<void> {
    return await this.updatePasswordTransactionScript.apply(command);
  }
}
