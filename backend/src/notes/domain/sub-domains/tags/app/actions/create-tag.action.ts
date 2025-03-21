import { Controller, Post, Body } from '@nestjs/common';
import { CreateTagTransactionScript } from '../../domain/transaction-scripts/create-tag.transaction.script';
import { CreateTagDto } from '../dtos/create-tag.dto';

@Controller('tags')
export class CreateTagAction {
  constructor(private readonly createTagTS:CreateTagTransactionScript) {}

  @Post()
  async createTag(@Body() createTagDto: CreateTagDto) {
    return this.createTagTS.apply(createTagDto); 
  }
}