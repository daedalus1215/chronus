# audio module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Audio recording and TTS -- upload, stream, download, delete audio for notes.

## Location

`backend/src/audio/`

## Actions

Folder base: `apps/actions/`

- TextToSpeechAction (POST /audio/tts)
- GetNoteAudiosAction (GET /audio/note/:noteId)
- DownloadAudioAction (GET /audio/:id/download)
- StreamAudioAction (GET /audio/:id/stream)
- DeleteAudioAction (DELETE /audio/:id)
- UpdatePlaybackPositionAction (PATCH /audio/:id/playback-position)

## Services

- `AudioService` (`domain/services/`)
- `AudioStreamingService` (`domain/services/`)

## Transaction Scripts

Folder: `domain/transaction-scripts/`

- `TextToSpeechTransactionScript`
- `SaveNoteAudioTransactionScript`
- `GetNoteAudiosTransactionScript`
- `GetNoteAudioByIdTransactionScript`
- `DownloadAudioTransactionScript`
- `StreamAudioTransactionScript`
- `DeleteAudioTransactionScript`
- `DeleteNoteAudiosTransactionScript`
- `UpdatePlaybackPositionTransactionScript`

## Aggregators

- AudioPurgeAggregator (exported -- consumed by note-transfer via AUDIO_PURGE_PORT)

## Ports

- NOTE_OWNERSHIP_PORT (consumed from notes module)

## Responders

- DownloadAudioResponder (`apps/actions/.../`)

## Entities

- `NoteAudio` (`domain/entities/`)

## Repositories

Folder: `infrastructure/repositories/`

- `NoteAudioRepository`

## Remote callers

- `HermesRemoteCaller (calls Hermes API for TTS)` (`infrastructure/remote-callers/`)

## Module imports (cross-domain dependencies)

- `NotesModule`
- `HttpModule`
- `ConfigModule`

## Exports

- `AudioPurgeAggregator`
- `AUDIO_PURGE_PORT`

## Folder structure

```
audio/
  apps/actions/
    {action-name}/
      {action-name}.action.ts
      {action-name}.swagger.ts
      {action-name}.responder.ts   # optional
  apps/dtos/
    requests/
    responses/
  domain/
    services/
    aggregators/
    transaction-scripts/
    entities/
  infrastructure/repositories/
  audio.module.ts
```
