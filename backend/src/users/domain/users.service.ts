import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../app/dtos/requests/create-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from '../infra/repositories/user.repository';
import { ConflictException, Injectable } from '@nestjs/common';
import { omit } from 'lodash';
import { UpdateUsernameTransactionScript } from './transaction-scripts/update-username-TS/update-username.transaction.script';
import { UpdatePasswordTransactionScript } from './transaction-scripts/update-password-TS/update-password.transaction.script';
import { UpdateUsernameCommand } from './transaction-scripts/update-username-TS/update-username.command';
import { UpdatePasswordCommand } from './transaction-scripts/update-password-TS/update-password.command';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly updateUsernameTransactionScript: UpdateUsernameTransactionScript,
    private readonly updatePasswordTransactionScript: UpdatePasswordTransactionScript
  ) {}

  async createUser(
    createUserDto: CreateUserDto
  ): Promise<Omit<User, 'password'>> {
    const { username, password: rawPassword } = createUserDto;

    const existingUser = await this.userRepository.findByUsername(username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const savedUser = await this.userRepository.create({
      username,
      password: hashedPassword,
    });

    return omit(savedUser, ['password']);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async updateEmail(userId: number, email: string): Promise<Omit<User, 'password'>> {
    const updatedUser = await this.userRepository.update(userId, { email });
    return omit(updatedUser, ['password']);
  }

  async updateUsername(command: UpdateUsernameCommand): Promise<Omit<User, 'password'>> {
    return await this.updateUsernameTransactionScript.apply(command);
  }

  async updatePassword(command: UpdatePasswordCommand): Promise<void> {
    return await this.updatePasswordTransactionScript.apply(command);
  }
}
