import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NoteAudio } from '../../domain/entities/note-audio.entity';

@Injectable()
export class NoteAudioRepository {
  constructor(
    @InjectRepository(NoteAudio)
    private readonly repository: Repository<NoteAudio>
  ) {}

  async create(
    noteId: number,
    filePath: string,
    fileName: string,
    fileFormat: string
  ): Promise<NoteAudio> {
    const noteAudio = this.repository.create({
      noteId,
      filePath,
      fileName,
      fileFormat,
    });
    return this.repository.save(noteAudio);
  }

  async findByNoteId(noteId: number): Promise<NoteAudio[]> {
    return this.repository.find({
      where: { noteId },
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: number): Promise<NoteAudio | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async deleteByNoteId(noteId: number): Promise<void> {
    await this.repository.delete({ noteId });
  }
}
