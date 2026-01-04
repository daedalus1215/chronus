import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TagNote } from 'src/shared-kernel/domain/entities/tag-note.entity';

@Injectable()
export class TagNoteRepository {
  private readonly repo: Repository<TagNote>;

  constructor(private readonly dataSource: DataSource) {
    this.repo = this.dataSource.getRepository(TagNote);
  }

  async deleteByNoteIdAndTagId(
    noteId: number,
    tagId: number,
    userId: number
  ): Promise<boolean> {
    const tagNote = await this.repo
      .createQueryBuilder('tag_note')
      .innerJoin('notes', 'note', 'note.id = tag_note.notes_id')
      .where('tag_note.notes_id = :noteId', { noteId })
      .andWhere('tag_note.tag_id = :tagId', { tagId })
      .andWhere('note.user_id = :userId', { userId })
      .select('tag_note.id')
      .getOne();

    if (!tagNote) return false;

    await this.repo.delete(tagNote.id);
    return true;
  }

  async deleteByNoteId(noteId: number): Promise<void> {
    await this.repo.delete({ noteId });
  }
}
