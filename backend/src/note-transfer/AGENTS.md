# note-transfer module

> See `backend/AGENTS.md` for the full pattern reference, naming conventions, and testing conventions.
> Pattern docs: `backend/docs/patterns/`

## Purpose

Note export/import and merge operations -- orchestrates cross-domain work via ports.

## Location

`backend/src/note-transfer/`

## Actions

Folder base: `apps/actions/`

- ExportNoteAction (POST /note-transfer/export/:noteId)
- ImportNoteAction (POST /note-transfer/import)
- MergeIntoNoteAction (POST /note-transfer/merge-into/:targetNoteId)
- MergeNotesAction (POST /note-transfer/merge)

## Services

- `NoteTransferService (+ ExportNote` (`domain/services/`)
- `ImportNote` (`domain/services/`)
- `NoteExportConverter helper classes)` (`domain/services/`)

## Ports consumed (cross-domain)

This module consumes ports from other domains:

- NOTE_WRITER_PORT (from notes)
- CHECK_ITEM_WRITER_PORT (from check-items)
- TIME_TRACK_WRITER_PORT (from time-tracks)
- TAG_ATTACH_PORT (from tags)
- AUDIO_PURGE_PORT (from audio)

## Module imports (cross-domain dependencies)

- `NotesModule`
- `CheckItemsModule`
- `TimeTracksModule`
- `TagsModule`
- `AudioModule`

## Folder structure

```
note-transfer/
  apps/actions/
    export-note-action/
    import-note-action/
    merge-into-note-action/
    merge-notes-action/
  domain/
    services/note-transfer-service/
      note-transfer.service.ts
      export-note.ts
      import-note.ts
      note-export-converter.ts
    ports/                      # consumes ports from other domains
      note-writer.port.ts
      check-item-writer.port.ts
      time-track-writer.port.ts
      tag-attacher.port.ts
      audio-purge.port.ts
  note-transfer.module.ts
```
