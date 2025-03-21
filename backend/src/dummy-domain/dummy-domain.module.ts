import { Module } from '@nestjs/common';
import { DummyController } from './app/dummy.controller';
import { DummyService } from './domain/dummy.service';

@Module({
  imports: [],
  controllers: [DummyController],
  providers: [DummyService],
  exports: [DummyService],
})
export class DummyDomainModule {} 