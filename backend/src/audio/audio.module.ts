import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextToSpeechAction } from './apps/actions/text-to-speech/text-to-speech.action';
import { DownloadAudioAction } from './apps/actions/download-audio/download-audio.action';
import { GetNoteAudiosAction } from './apps/actions/get-note-audios/get-note-audios.action';
import { StreamAudioAction } from './apps/actions/stream-audio/stream-audio.action';
import { AudioService } from './domain/services/audio.service';
import { AudioStreamingService } from './domain/services/audio-streaming.service';
import { TextToSpeechTransactionScript } from './domain/transaction-scripts/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from './domain/transaction-scripts/download-audio.transaction.script';
import { SaveNoteAudioTransactionScript } from './domain/transaction-scripts/save-note-audio-TS/save-note-audio.transaction.script';
import { GetNoteAudiosTransactionScript } from './domain/transaction-scripts/get-note-audios-TS/get-note-audios.transaction.script';
import { GetNoteAudioByIdTransactionScript } from './domain/transaction-scripts/get-note-audio-by-id-TS/get-note-audio-by-id.transaction.script';
import { DeleteNoteAudiosTransactionScript } from './domain/transaction-scripts/delete-note-audios-TS/delete-note-audios.transaction.script';
import { StreamAudioTransactionScript } from './domain/transaction-scripts/stream-audio-ts/stream-audio.transaction.script';
import { HermesRemoteCaller } from './infrastructure/remote-callers/hermes.remote-caller';
import { AudioFileCache } from './infrastructure/cache/audio-file.cache';
import { NoteAudioRepository } from './infrastructure/repositories/note-audio.repository';
import { NoteAudio } from './domain/entities/note-audio.entity';
import { NotesModule } from 'src/notes/notes.module';
import { NoteOwnershipAdapter } from 'src/notes/apps/adapters/note-ownership.adapter';
import { NOTE_OWNERSHIP_PORT } from './domain/ports/note-ownership.port';
import { DownloadAudioResponder } from './apps/actions/download-audio/download-audio.responder';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    NotesModule,
    TypeOrmModule.forFeature([NoteAudio]),
  ],
  controllers: [
    TextToSpeechAction,
    DownloadAudioAction,
    GetNoteAudiosAction,
    StreamAudioAction,
  ],
  providers: [
    AudioService,
    AudioStreamingService,
    AudioFileCache,
    TextToSpeechTransactionScript,
    DownloadAudioTransactionScript,
    SaveNoteAudioTransactionScript,
    GetNoteAudiosTransactionScript,
    GetNoteAudioByIdTransactionScript,
    DeleteNoteAudiosTransactionScript,
    StreamAudioTransactionScript,
    HermesRemoteCaller,
    NoteAudioRepository,
    NoteOwnershipAdapter,
    {
      provide: NOTE_OWNERSHIP_PORT,
      useExisting: NoteOwnershipAdapter,
    },
    DownloadAudioResponder,
  ],
  exports: [AudioService],
})
export class AudioModule {}
