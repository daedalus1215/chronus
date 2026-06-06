import { Module } from '@nestjs/common';
import { NotesModule } from '../notes/notes.module';
import { CheckItemsModule } from '../check-items/check-items.module';
import { TimeTracksModule } from '../time-tracks/time-tracks.module';
import { TagsModule } from '../tags/tags.module';
import { NoteTransferService } from './domain/services/note-transfer.service';
import { ExportNoteAction } from './apps/actions/export-note-action/export-note.action';
import { ImportNoteAction } from './apps/actions/import-note-action/import-note.action';
import { MergeIntoNoteAction } from './apps/actions/merge-into-note-action/merge-into-note.action';

@Module({
  imports: [NotesModule, CheckItemsModule, TimeTracksModule, TagsModule],
  providers: [
    NoteTransferService,
    // Ports are provided by the respective modules via exports
  ],
  controllers: [ExportNoteAction, ImportNoteAction, MergeIntoNoteAction],
})
export class NoteTransferModule {}