import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult } from 'typeorm';
import { Note } from '../../domain/entities/notes/note.entity';
import { Tag } from '../../domain/entities/tag/tag.entity';
import { Memo } from '../../domain/entities/notes/memo.entity';

@Injectable()
export class NoteMemoTagRepository {
    constructor(
        @InjectRepository(Note)
        private readonly repository: Repository<Note>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>,
        @InjectRepository(Memo)
        private readonly memoRepository: Repository<Memo>
    ) {}

    async findById(id: number, userId: string): Promise<Note | null> {
        return this.repository
            .createQueryBuilder('note')
            .addSelect("CASE WHEN note.memo_id IS NOT NULL THEN 1 ELSE 0 END", "isMemo")
            .leftJoinAndSelect('note.memo', 'memo')
            .leftJoinAndSelect('note.tags', 'tags')
            .leftJoinAndSelect('note.checkItems', 'checkItems')
            .where('note.id = :id', { id })
            .andWhere('note.archived_date IS NULL')
            .andWhere('note.user_id = :userId', { userId })
            .getOne();
    }

    async save(note: Note): Promise<Note> {
        if (note.memo) {
            note.memo = await this.memoRepository.save(note.memo);
        }
        return this.repository.save(note);
    }

    async findTagByName(name: string): Promise<Tag | null> {
        return this.tagRepository.findOne({ where: { name } });
    }

    async createTag(tagData: Partial<Tag>): Promise<Tag> {
        const tag = this.tagRepository.create(tagData);
        return this.tagRepository.save(tag);
    }

    async removeTag(tag: Tag): Promise<Tag> {
        return this.tagRepository.remove(tag);
    }

    async getNoteNamesByUserId(
        userId: string,
        cursor: number,
        limit = 20,
        query?: string
    ): Promise<{name:string, id:number, isMemo:number}[]> {
        const qb = this.repository
            .createQueryBuilder("note")
            .select("note.name", "name")
            .addSelect("note.id", "id")
            .addSelect("CASE WHEN note.memo_id IS NOT NULL THEN 1 ELSE 0 END", "isMemo")
            .where("note.user_id = :userId", { userId });

        if (query) {
            qb.andWhere("LOWER(note.name) LIKE LOWER(:query)", { query: `%${query}%` });
        }

        return await qb
            .orderBy("note.updated_at", "DESC")
            .skip(cursor)
            .take(limit)
            .getRawMany();
    }

    async updateNoteTimestamp(id: number): Promise<UpdateResult> {
        try {
            const result = await this.repository
                .createQueryBuilder('note')
                .update(Note)
                .set({ 
                    updatedAt: () => 'CURRENT_TIMESTAMP',
                })
                .where('id = :id', { id })
                .execute();

            if (result.affected === 0) {
                throw new Error('Note not found');
            }
            return result;
        } catch (error) {
            console.error('Error in updateNoteTimestamp:', error);
            throw error;
        }
    }
} 