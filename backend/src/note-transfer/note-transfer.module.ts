import { Module } from '@nestjs/common';
import { NotesModule } from '../notes/notes.module';
import { CheckItemsModule } from '../check-items/check-items.module';
import { TimeTracksModule } from '../time-tracks/time-tracks.module';
import { TagsModule } from '../tags/tags.module';
import { AudioModule } from '../audio/audio.module';
import { NoteTransferService } from './domain/services/note-transfer-service/note-transfer.service';
import { ExportNote } from './domain/services/note-transfer-service/export-note';
import { ImportNote } from './domain/services/note-transfer-service/import-note';
import { NoteExportConverter } from './domain/services/note-transfer-service/note-export-converter';
import { ExportNoteAction } from './apps/actions/export-note-action/export-note.action';
import { ImportNoteAction } from './apps/actions/import-note-action/import-note.action';
import { MergeIntoNoteAction } from './apps/actions/merge-into-note-action/merge-into-note.action';
import { MergeNotesAction } from './apps/actions/merge-notes-action/merge-notes.action';

@Module({
  imports: [
    NotesModule,
    CheckItemsModule,
    TimeTracksModule,
    TagsModule,
    AudioModule,
  ],
  providers: [
    NoteTransferService,
    ExportNote,
    ImportNote,
    NoteExportConverter,
    // Ports are provided by the respective modules via exports
  ],
  controllers: [
    ExportNoteAction,
    ImportNoteAction,
    MergeIntoNoteAction,
    MergeNotesAction,
  ],
})
export class NoteTransferModule {}
