import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { Note } from "./domain/entities/notes/note.entity";
import { Memo } from "./domain/entities/notes/memo.entity";
import { NoteMemoTagRepository } from "./infra/repositories/note-memo-tag.repository";
import { GetNoteNamesByUserIdAction } from "./apps/actions/notes/get-note-names-by-userId/get-note-names-by-userId.action";
import { CreateNoteAction } from "./apps/actions/notes/create-note-action/create-note.action";
import { CreateNoteTransactionScript } from "./domain/transaction-scripts/create-note.transaction.script";
import { GetNoteByIdAction } from "./apps/actions/notes/get-note-by-id-action/get-note-by-id.action";
import { GetNoteByIdTransactionScript } from "./domain/transaction-scripts/get-note-by-id.transaction.script";
import { UpdateNoteAction } from "./apps/actions/notes/update-note-action/update-note.action";
import { UpdateNoteTransactionScript } from "./domain/transaction-scripts/update-note-TS/update-note.transaction.script";
import { NoteDtoToEntityConverter } from "./domain/transaction-scripts/update-note-TS/note-dto-to-entity.converter";
import { NoteAggregator } from "./domain/aggregators/note.aggregator";
import { UpdateNoteTimestampAction } from "./apps/actions/update-note-timestamp.action";
import { UpdateNoteTitleAction } from "./apps/actions/notes/update-note-title-action/update-note-title.action";
import { UpdateNoteTitleTransactionScript } from "./domain/transaction-scripts/update-note-title.transaction.script";
import { DeleteNoteAction } from "./apps/actions/notes/delete-note.action";
import { ArchiveNoteAction } from "./apps/actions/archive-note/archive-note.action";
import { ArchiveNoteTransactionScript } from "./domain/transaction-scripts/archive-note/archive-note.transaction.script";
import { NoteService } from "./domain/services/note.service";
import { GetNoteNamesByIdsTransactionScript } from "./domain/transaction-scripts/get-note-names-by-ids.transaction.script";
import { VerifyNoteAccessListener } from "./apps/listeners/verify-note-access.listener";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { GetNoteDetailsListener } from "./apps/listeners/get-note-details.listener";
import { ThothWebSocketClientService } from "./infra/remote-callers/thoth-websocket-client.service";
import { AppendTranscriptionToNoteTransactionScript } from "./domain/transaction-scripts/append-transcription-to-note.transaction.script";
import { TranscribeAudioGateway } from "./apps/gateways/transcribe-audio.gateway";

@Module({
  imports: [
    TypeOrmModule.forFeature([Note, Memo]),
    EventEmitterModule.forRoot(),
    AuthModule,
  ],
  providers: [
    NoteMemoTagRepository,
    NoteAggregator,
    CreateNoteTransactionScript,
    GetNoteByIdTransactionScript,
    UpdateNoteTransactionScript,
    UpdateNoteTitleTransactionScript,
    ArchiveNoteTransactionScript,
    NoteDtoToEntityConverter,
    NoteService,
    GetNoteNamesByIdsTransactionScript,
    VerifyNoteAccessListener,
    GetNoteDetailsListener,
    ThothWebSocketClientService,
    AppendTranscriptionToNoteTransactionScript,
    TranscribeAudioGateway,
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
  ],
  exports: [NoteMemoTagRepository, NoteAggregator, NoteService],
})
export class NotesModule {}
