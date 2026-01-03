import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './domain/users.service';
import { UsersController } from './app/controllers/users.controller';
import { User } from './domain/entities/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UserRepository } from './infra/repositories/user.repository';
import { UserAggregator } from './domain/aggregators/user.aggregator';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
  ],
  providers: [UsersService, UserRepository, UserAggregator],
  controllers: [UsersController],
  exports: [UsersService, UserAggregator],
})
export class UsersModule { }
