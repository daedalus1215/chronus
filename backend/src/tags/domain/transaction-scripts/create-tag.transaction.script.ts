import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Tag } from 'src/tags/domain/entities/tag.entity';
import { Repository } from 'typeorm';
import { CreateTagDto } from '../../app/actions/create-tag-action/dtos/create-tag.dto';

@Injectable()
export class CreateTagTransactionScript {
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
  ) {}

    async apply(createTagDto: CreateTagDto): Promise<Tag> {
        const { name, description, userId } = createTagDto;
    
        const tag = new Tag();
        tag.name = name;
        tag.description = description;
        tag.userId = userId;
    
        return this.tagsRepository.save(tag);
      }
}