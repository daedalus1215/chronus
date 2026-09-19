import { NotesModule } from '../notes/notes.module';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TextToSpeechAction } from './apps/actions/text-to-speech/text-to-speech.action';
import { DownloadAudioAction } from './apps/actions/download-audio/download-audio.action';
import { GetNoteAudiosAction } from './apps/actions/get-note-audios/get-note-audios.action';
import { StreamAudioAction } from './apps/actions/stream-audio/stream-audio.action';
import { DeleteAudioAction } from './apps/actions/delete-audio/delete-audio.action';
import { UpdatePlaybackPositionAction } from './apps/actions/update-playback-position-action/update-playback-position.action';
import { AudioService } from './domain/services/audio.service';
import { AudioStreamingService } from './domain/services/audio-streaming.service';
import { TextToSpeechTransactionScript } from './domain/transaction-scripts/text-to-speech-TS/text-to-speech.transaction.script';
import { DownloadAudioTransactionScript } from './domain/transaction-scripts/download-audio-TS/download-audio.transaction.script';
import { SaveNoteAudioTransactionScript } from './domain/transaction-scripts/save-note-audio-TS/save-note-audio.transaction.script';
import { GetNoteAudiosTransactionScript } from './domain/transaction-scripts/get-note-audios-TS/get-note-audios.transaction.script';
import { GetNoteAudioByIdTransactionScript } from './domain/transaction-scripts/get-note-audio-by-id-TS/get-note-audio-by-id.transaction.script';
import { DeleteNoteAudiosTransactionScript } from './domain/transaction-scripts/delete-note-audios-TS/delete-note-audios.transaction.script';
import { DeleteAudioTransactionScript } from './domain/transaction-scripts/delete-audio-TS/delete-audio.transaction.script';
import { StreamAudioTransactionScript } from './domain/transaction-scripts/stream-audio-TS/stream-audio.transaction.script';
import { UpdatePlaybackPositionTransactionScript } from './domain/transaction-scripts/update-playback-position-TS/update-playback-position.transaction.script';
import { HermesRemoteCaller } from './infrastructure/remote-callers/hermes.remote-caller';
import { AudioFileCache } from './infrastructure/cache/audio-file.cache';
import { NoteAudioRepository } from './infrastructure/repositories/note-audio.repository';
import { NoteAudio } from './domain/entities/note-audio.entity';
import { DownloadAudioResponder } from './apps/actions/download-audio/download-audio.responder';
import { AudioPurgeAggregator } from './domain/aggregators/audio-purge.aggregator';
import { AUDIO_PURGE_PORT } from '../note-transfer/domain/ports/audio-purge.port';

@Module({
  imports: [
    NotesModule,
    HttpModule,
    ConfigModule,
    TypeOrmModule.forFeature([NoteAudio]),
  ],
  controllers: [
    TextToSpeechAction,
    DownloadAudioAction,
    GetNoteAudiosAction,
    StreamAudioAction,
    DeleteAudioAction,
    UpdatePlaybackPositionAction,
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
    DeleteAudioTransactionScript,
    StreamAudioTransactionScript,
    UpdatePlaybackPositionTransactionScript,
    HermesRemoteCaller,
    NoteAudioRepository,
    DownloadAudioResponder,
    AudioPurgeAggregator,
    {
      provide: AUDIO_PURGE_PORT,
      useExisting: AudioPurgeAggregator,
    },
  ],
  exports: [AudioService, AUDIO_PURGE_PORT],
})
export class AudioModule {}
