import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Note } from './domain/entities/notes/note.entity';
import { Memo } from './domain/entities/notes/memo.entity';
import { NoteVersion } from './domain/entities/notes/note-version.entity';
import { NoteMemoTagRepository } from './infra/repositories/note-memo-tag.repository';
import { NoteVersionRepository } from './infra/repositories/note-version.repository';
import { GetNoteNamesByUserIdAction } from './apps/actions/notes/get-note-names-by-userId/get-note-names-by-userId.action';
import { CreateNoteAction } from './apps/actions/notes/create-note-action/create-note.action';
import { CreateNoteTransactionScript } from './domain/transaction-scripts/create-note.transaction.script';
import { GetNoteByIdAction } from './apps/actions/notes/get-note-by-id-action/get-note-by-id.action';
import { GetNoteByIdTransactionScript } from './domain/transaction-scripts/get-note-by-id.transaction.script';
import { UpdateNoteAction } from './apps/actions/notes/update-note-action/update-note.action';
import { UpdateNoteTransactionScript } from './domain/transaction-scripts/update-note-TS/update-note.transaction.script';
import { UpdateNoteParamsToEntityConverter } from './domain/transaction-scripts/update-note-TS/update-note-params-to-entity.converter';
import { NoteAggregator } from './domain/aggregators/note.aggregator';
import { UpdateNoteTimestampAction } from './apps/actions/update-note-timestamp.action';
import { UpdateNoteTitleAction } from './apps/actions/notes/update-note-title-action/update-note-title.action';
import { UpdateNoteTitleTransactionScript } from './domain/transaction-scripts/update-note-title.transaction.script';
import { DeleteNoteAction } from './apps/actions/notes/delete-note.action';
import { ArchiveNoteAction } from './apps/actions/archive-note/archive-note.action';
import { ArchiveNoteTransactionScript } from './domain/transaction-scripts/archive-note/archive-note.transaction.script';
import { ConvertChecklistToMemoTransactionScript } from './domain/transaction-scripts/convert-checklist-to-memo-TS/convert-checklist-to-memo.transaction.script';
import { ConvertChecklistToMemoAction } from './apps/actions/notes/convert-checklist-to-memo-action/convert-checklist-to-memo.action';
import { SearchNotesAction } from './apps/actions/notes/search-notes-action/search-notes.action';
import { SearchNotesTransactionScript } from './domain/transaction-scripts/search-notes.transaction.script';
import { SearchNotesResponder } from './apps/actions/notes/search-notes-action/search-notes.responder';
import { NoteService } from './domain/services/note.service';
import { GetNoteNamesByIdsTransactionScript } from './domain/transaction-scripts/get-note-names-by-ids.transaction.script';
import { VerifyNoteAccessListener } from './apps/listeners/verify-note-access.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GetNoteDetailsListener } from './apps/listeners/get-note-details.listener';
import { CheckItemsModule } from '../check-items/check-items.module';
import { GetNoteByIdResponder } from './apps/actions/notes/get-note-by-id-action/get-note-by-id.responder';
import { UpdateNoteResponder } from './apps/actions/notes/update-note-action/update-note.responder';
import { NoteOwnershipAdapter } from './apps/adapters/note-ownership.adapter';
import { NOTE_OWNERSHIP_PORT } from '../audio/domain/ports/note-ownership.port';
import { MoveNoteToFolderTransactionScript } from './domain/transaction-scripts/move-note-to-folder.transaction.script';
import { MoveNoteToFolderAction } from './apps/actions/notes/move-note-to-folder-action/move-note-to-folder.action';
import { ReorderNotesTransactionScript } from './domain/transaction-scripts/reorder-notes.transaction.script';
import { ReorderNotesAction } from './apps/actions/notes/reorder-notes-action/reorder-notes.action';
import { GetNoteNamesByUserIdTransactionScript } from './domain/transaction-scripts/get-note-names-by-user-id.transaction.script';
import { GetNoteNamesForExplorerTransactionScript } from './domain/transaction-scripts/get-note-names-for-explorer.transaction.script';
import { GetNoteVersionsTransactionScript } from './domain/transaction-scripts/get-note-versions.transaction.script';
import { GetNoteNamesForExplorerAction } from './apps/actions/notes/get-note-names-for-explorer-action/get-note-names-for-explorer.action';
import { NoteFolderAdapter } from './apps/adapters/note-folder.adapter';
import { NOTE_FOLDER_PORT } from 'src/folders/domain/ports/note-folder.port';
import { NOTE_WRITER_PORT } from '../note-transfer/domain/ports/note-writer.port';
import { TranscribeAudioGateway } from './apps/gateways/transcribe-audio.gateway';
import { TranscriptionSessionRegistry } from './apps/gateways/transcription-session.registry';
import { WsJwtAuthenticator } from './apps/guards/ws-jwt.authenticator';
import { ThothStreamRemoteCaller } from './infra/remote-callers/thoth-stream.remote-caller';
import { GetNoteVersionsAction } from './apps/actions/notes/get-note-versions-action/get-note-versions.action';
import { GetNoteVersionsResponder } from './apps/actions/notes/get-note-versions-action/get-note-versions.responder';
import { LoadNoteVersionAction } from './apps/actions/notes/load-note-version-action/load-note-version.action';
import { LoadNoteVersionResponder } from './apps/actions/notes/load-note-version-action/load-note-version.responder';

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, Memo, NoteVersion]),
    EventEmitterModule.forRoot(),
    AuthModule,
    CheckItemsModule,
  ],
  providers: [
    NoteMemoTagRepository,
    NoteVersionRepository,
    NoteAggregator,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    UpdateNoteTitleTransactionScript,
    ArchiveNoteTransactionScript,
    ConvertChecklistToMemoTransactionScript,
    UpdateNoteParamsToEntityConverter,
    NoteService,
    GetNoteNamesByIdsTransactionScript,
    VerifyNoteAccessListener,
    GetNoteDetailsListener,
    GetNoteByIdResponder,
    GetNoteVersionsResponder,
    LoadNoteVersionResponder,
    UpdateNoteResponder,
    SearchNotesTransactionScript,
    SearchNotesResponder,
    NoteOwnershipAdapter,
    MoveNoteToFolderTransactionScript,
    ReorderNotesTransactionScript,
    GetNoteNamesByUserIdTransactionScript,
    GetNoteNamesForExplorerTransactionScript,
    GetNoteVersionsTransactionScript,
    {
      provide: NOTE_OWNERSHIP_PORT,
      useExisting: NoteOwnershipAdapter,
    },
    NoteFolderAdapter,
    {
      provide: NOTE_FOLDER_PORT,
      useExisting: NoteFolderAdapter,
    },
    {
      provide: NOTE_WRITER_PORT,
      useExisting: NoteAggregator,
    },
    TranscribeAudioGateway,
    TranscriptionSessionRegistry,
    WsJwtAuthenticator,
    ThothStreamRemoteCaller,
  ],
  controllers: [
    GetNoteNamesByUserIdAction,
    CreateNoteAction,
    GetNoteByIdAction,
    UpdateNoteAction,
    UpdateNoteTimestampAction,
    UpdateNoteTitleAction,
    DeleteNoteAction,
    ArchiveNoteAction,
    ConvertChecklistToMemoAction,
    SearchNotesAction,
    MoveNoteToFolderAction,
    ReorderNotesAction,
    GetNoteNamesForExplorerAction,
    GetNoteVersionsAction,
    LoadNoteVersionAction,
  ],
  exports: [
    NoteMemoTagRepository,
    NoteAggregator,
    NoteService,
    NOTE_OWNERSHIP_PORT,
    NOTE_FOLDER_PORT,
    NOTE_WRITER_PORT,
  ],
})
export class NotesModule {}
