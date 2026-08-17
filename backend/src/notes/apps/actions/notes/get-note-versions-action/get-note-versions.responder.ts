import { Injectable } from '@nestjs/common';
import { NoteVersion } from '../../../../domain/entities/notes/note-version.entity';
import { NoteVersionResponseDto } from '../../../dtos/responses/note-version.response.dto';

@Injectable()
export class GetNoteVersionsResponder {
  apply(versions: NoteVersion[]): {
    versions: NoteVersionResponseDto[];
    total: number;
  } {
    const versionDtos: NoteVersionResponseDto[] = versions.map(v => ({
      id: v.id,
      versionNum: v.versionNum,
      description: v.description,
      createdAt: v.createdAt,
    }));
    return { versions: versionDtos, total: versionDtos.length };
  }
}
