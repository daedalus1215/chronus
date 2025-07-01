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
        public readonly tagRepository: Repository<Tag>,
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

    async findTagByName(name: string, userId: string): Promise<Tag | null> {
        return this.tagRepository.findOne({ where: { name, userId } });
    }

    async createTag(tagData: Partial<Tag>): Promise<Tag> {
        const tag = this.tagRepository.create(tagData);
        return this.tagRepository.save(tag);
    }

    async removeTag(tag: Tag): Promise<Tag> {
        return this.tagRepository.remove(tag);
    }

    //@TODO: Abstract into a query builder that is passed in to move conditionals out of this repository
    async getNoteNamesByUserId(
        userId: string,
        cursor: number,
        limit = 20,
        query?: string,
        type?: 'memo' | 'checkList',
        tagId?: string
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

        if (type === 'memo') {
            qb.andWhere('note.memo_id IS NOT NULL');
        } else if (type === 'checkList') {
            qb.andWhere('note.memo_id IS NULL');
        }

        if (tagId) {
            qb.innerJoin('note_tags', 'tn', 'tn.note_id = note.id')
              .andWhere('tn.tag_id = :tagId', { tagId });
        }

        console.log('qb', qb.getQueryAndParameters());
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

    async deleteNoteById(id: number, userId: string): Promise<void> {
        await this.repository.delete({ id, userId });
    }

    async addTagToNote(noteId: number, tag: Tag, userId: string): Promise<Note> {
        const note = await this.findById(noteId, userId);
        if (!note) throw new Error('Note not found');
        if (!note.tags) note.tags = [];
        if (!note.tags.find(t => t.id === tag.id)) {
            note.tags.push(tag);
        }
        return this.save(note);
    }

    async getTagsByUserId(userId: string): Promise<Tag[]> {
        return this.tagRepository.find({ where: { userId } });
    }

    async findTagsByNoteId(noteId: number, userId: string): Promise<Tag[]> {
        const note = await this.repository.findOne({
            where: { id: noteId, userId },
            relations: ['tags'],
        });
        if (!note) return [];
        return note.tags || [];
    }
} 