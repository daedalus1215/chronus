import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../../domain/entities/notes/note.entity';
import { Tag } from '../../domain/entities/tag/tag.entity';

//@TODO: We probably want to break this repo up into two separate ones.
@Injectable()
export class NoteTagRepository {
    constructor(
        @InjectRepository(Note)
        private readonly repository: Repository<Note>,
        @InjectRepository(Tag)
        private readonly tagRepository: Repository<Tag>
    ) {}

    async findById(id: number): Promise<Note | null> {
        return this.repository.findOne({
            where: { id },
            relations: ["tags"]
        });
    }

    async save(note: Note): Promise<Note> {
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

    async getNoteNamesByUserId(userId: string): Promise<{name:string, id:number}[]> {
        const notes = await this.repository
          .createQueryBuilder("note")
          .select("note.name", "name")
          .addSelect("note.id", "id")
          .where("note.userId = :userId", { userId })
          .getRawMany();
    
        return notes.map((note) => ({name:note.name, id:note.id}));
      }
} 