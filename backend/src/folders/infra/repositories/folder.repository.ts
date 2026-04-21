import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Folder } from '../../domain/entities/folder.entity';

@Injectable()
export class FolderRepository {
  constructor(
    @InjectRepository(Folder)
    private readonly repo: Repository<Folder>
  ) {}

  async create(data: Partial<Folder>): Promise<Folder> {
    return this.repo.save(this.repo.create(data));
  }

  async findById(id: number, userId: number): Promise<Folder | null> {
    return this.repo.findOne({ where: { id, userId } });
  }

  async findAllByUserId(userId: number): Promise<Folder[]> {
    return this.repo.find({ where: { userId }, order: { name: 'ASC' } });
  }

  async update(folder: Folder): Promise<Folder> {
    return this.repo.save(folder);
  }

  async deleteByIds(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await this.repo.delete({ id: In(ids) });
  }
}
