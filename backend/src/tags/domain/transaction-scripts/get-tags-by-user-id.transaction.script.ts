import { Injectable } from '@nestjs/common';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';

export type TagWithCount ={ 
  id: string;
  name: string;
  noteCount: number
};

@Injectable()
export class GetTagsByUserIdTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(userId: number): Promise<TagWithCount[]> {
    return await this.tagRepository.getTagsByUserId(userId);
  }
} 