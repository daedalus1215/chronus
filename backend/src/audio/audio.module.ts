import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextToSpeechAction } from './apps/actions/text-to-speech/text-to-speech.action';
import { DownloadAudioAction } from './apps/actions/download-audio/download-audio.action';
import { GetNoteAudiosAction } from './apps/actions/get-note-audios/get-note-audios.action';
import { AudioService } from './domain/services/audio.service';
import { TextToSpeechTransactionScript } from './domain/transaction-scripts/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from './domain/transaction-scripts/download-audio.transaction.script';
import { SaveNoteAudioTransactionScript } from './domain/transaction-scripts/save-note-audio-TS/save-note-audio.transaction.script';
import { GetNoteAudiosTransactionScript } from './domain/transaction-scripts/get-note-audios-TS/get-note-audios.transaction.script';
import { GetNoteAudioByIdTransactionScript } from './domain/transaction-scripts/get-note-audio-by-id-TS/get-note-audio-by-id.transaction.script';
import { DeleteNoteAudiosTransactionScript } from './domain/transaction-scripts/delete-note-audios-TS/delete-note-audios.transaction.script';
import { HermesRemoteCaller } from './infrastructure/remote-callers/hermes.remote-caller';
import { NoteAudioRepository } from './infra/repositories/note-audio.repository';
import { NoteAudio } from './domain/entities/note-audio.entity';
import { NotesModule } from 'src/notes/notes.module';
import { DownloadAudioResponder } from './apps/actions/download-audio/download-audio.responder';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
    NotesModule,
    TypeOrmModule.forFeature([NoteAudio]),
  ],
  controllers: [TextToSpeechAction, DownloadAudioAction, GetNoteAudiosAction],
  providers: [
    AudioService,
    TextToSpeechTransactionScript,
    DownloadAudioTransactionScript,
    SaveNoteAudioTransactionScript,
    GetNoteAudiosTransactionScript,
    GetNoteAudioByIdTransactionScript,
    DeleteNoteAudiosTransactionScript,
    HermesRemoteCaller,
    NoteAudioRepository,
    DownloadAudioResponder,
  ],
  exports: [AudioService],
})
export class AudioModule {}
