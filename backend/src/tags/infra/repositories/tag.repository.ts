import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../domain/entities/tag.entity';
import { TagNote } from '../../../shared-kernel/domain/entities/tag-note.entity';

@Injectable()
export class TagRepository {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(TagNote)
    private readonly tagNoteRepository: Repository<TagNote>
  ) {}

  async findTagByName(name: string, userId: string): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { name, userId } });
  }

  async findTagByIdAndUserId(id: string, userId: string): Promise<Tag | null> {
    return this.tagRepository.findOne({ where: { id, userId } });
  }

  async createTag(tagData: Partial<Tag>): Promise<Tag> {
    const tag = this.tagRepository.create(tagData);
    return this.tagRepository.save(tag);
  }

  async removeTag(tag: Tag): Promise<Tag> {
    return this.tagRepository.remove(tag);
  }

  async getTagsByUserId(userId: string): Promise<Tag[]> {
    return this.tagRepository.find({ where: { userId } });
  }

  async addTagToNote(noteId: number, tagId: string): Promise<TagNote> {
    const tagNote = this.tagNoteRepository.create({ notes: { id: noteId }, tag: { id: tagId } });
    return this.tagNoteRepository.save(tagNote);
  }

  async findTagsByNoteId(noteId: number, userId: number): Promise<Tag[]> {
    const tagNotes = await this.tagNoteRepository.find({ where: { notes: { id: noteId } } });
    const tagIds = tagNotes.map(tn => tn.tagId);
    if (!tagIds.length) return [];
    return this.tagRepository.findByIds(tagIds);
  }
} 