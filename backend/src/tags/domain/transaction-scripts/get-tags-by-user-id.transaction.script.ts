import { Injectable } from '@nestjs/common';
import { TagRepository } from '../../infra/repositories/tag-repository/tag.repository';
import { GetTagsByUserIdProjection } from './get-tags-by-user-id.projection';

@Injectable()
export class GetTagsByUserIdTransactionScript {
  constructor(private readonly tagRepository: TagRepository) {}

  async apply(userId: number): Promise<GetTagsByUserIdProjection[]> {
    return await this.tagRepository.getTagsByUserId(userId);
  }
}
