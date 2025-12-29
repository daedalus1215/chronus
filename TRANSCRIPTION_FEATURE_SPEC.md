# Audio Transcription Feature Specification

## Overview

This document outlines the implementation plan for adding real-time audio transcription functionality to notes in the chronus-react-nestjs application. The feature will allow users to record audio via WebSocket streaming and have it transcribed in real-time, with the transcription automatically appended to the existing note text when recording stops.

## Architecture Overview

### Current State

**thoth-backend** (FastAPI):
- Provides WebSocket endpoint `/stream-audio` for real-time audio streaming
- Accepts binary audio chunks via WebSocket
- Returns JSON messages: `{ transcription: string }` as transcription chunks arrive
- Uses Whisper AI for real-time transcription
- Processes audio in 3-second chunks for low latency

**chronus-react-nestjs**:
- Backend: NestJS with modular architecture
- Frontend: React with MUI
- Notes module follows: Action → Service → Transaction Script → Repository pattern
- Already has audio module with remote caller pattern (HermesRemoteCaller)

### Integration Flow

```
Frontend (NotePage)
  ↓ User clicks "Start Recording" button
  ↓ Requests microphone access
  ↓ Connects to WebSocket: ws://chronus-backend/api/notes/:id/transcribe-audio
  ↓ Streams audio chunks (binary) in real-time
Backend (TranscribeAudioGateway)
  ↓ Validates note access and user authentication
  ↓ Connects to thoth-backend WebSocket: ws://thoth-backend/stream-audio
  ↓ Proxies audio chunks: Frontend → thoth-backend
  ↓ Proxies transcription chunks: thoth-backend → Frontend
  ↓ Accumulates transcription text
  ↓ On disconnect: Appends accumulated transcription to existing note description/text
Frontend
  ↓ Receives transcription chunks in real-time
  ↓ Appends transcription chunks directly to note description in editor
  ↓ Existing debounced save mechanism saves updated note automatically
```

## Backend Implementation

### 1. Infrastructure Layer

#### 1.1 WebSocket Client Service
**File**: `backend/src/notes/infra/remote-callers/thoth-websocket-client.service.ts`

- Manages WebSocket connection to thoth-backend
- Handles connection lifecycle (connect, disconnect, reconnect)
- Forwards audio chunks to thoth-backend
- Receives transcription chunks from thoth-backend
- Error handling and logging

**Responsibilities**:
- Connect to thoth-backend WebSocket (`ws://${THOTH_WS_URL}/stream-audio`)
- Send binary audio chunks
- Receive JSON transcription messages
- Handle connection errors and reconnection logic
- Emit events for transcription chunks

**Dependencies**:
- `ws` package for WebSocket client
- Configurable via `THOTH_WS_URL` environment variable

### 2. Domain Layer

#### 2.1 Transaction Script
**File**: `backend/src/notes/domain/transaction-scripts/append-transcription-to-note.transaction.script.ts`

**Responsibilities**:
- Validate note exists and user has access
- Append accumulated transcription to existing note description
- Add appropriate separator (space or newline) between existing text and new transcription
- Save updated note
- Return updated note

**Input**:
- `noteId: number`
- `userId: number`
- `transcription: string` (accumulated transcription text to append)

**Output**:
- Updated `Note` entity

**Logic**:
- If note description is empty: Set transcription as description
- If note description exists: Append transcription with space/newline separator
- Preserve existing formatting and content

### 3. Application Layer

#### 3.1 WebSocket Gateway
**File**: `backend/src/notes/apps/gateways/transcribe-audio.gateway.ts`

**Endpoint**: `ws://chronus-backend/api/notes/:id/transcribe-audio`

**Features**:
- WebSocket gateway using `@nestjs/websockets`
- Protected connection (requires authentication via query params or headers)
- Validates note access on connection
- Manages WebSocket connection lifecycle
- Proxies audio chunks to thoth-backend
- Accumulates transcription chunks
- Appends accumulated transcription to note description on disconnect

**Connection Flow**:
1. Client connects: `ws://api/notes/:id/transcribe-audio?token=JWT_TOKEN`
2. Gateway validates JWT and note access
3. Gateway connects to thoth-backend WebSocket
4. Gateway forwards binary audio chunks: `client → thoth-backend`
5. Gateway forwards transcription JSON: `thoth-backend → client`
6. Gateway accumulates transcription text
7. On disconnect: Gateway appends accumulated transcription to existing note description/text

**Message Types**:
- `audio-chunk` (binary): Audio data from client
- `transcription` (JSON): Transcription chunks from thoth-backend
- `error` (JSON): Error messages
- `connected`: Connection established
- `disconnected`: Connection closed

**Swagger**: Not applicable for WebSocket (document in code comments)

### 4. Module Configuration

**File**: `backend/src/notes/notes.module.ts`

**Add**:
- `WebSocketModule` import (if not global)
- `ThothWebSocketClientService` provider
- `AppendTranscriptionToNoteTransactionScript` provider
- `TranscribeAudioGateway` gateway

**Environment Variables**:
- `THOTH_WS_URL` - WebSocket URL for thoth-backend (e.g., `ws://localhost:8000` or `wss://localhost:8443`)
- `THOTH_API_URL` - HTTP URL for thoth-backend (optional, for health checks)

**Dependencies**:
- `@nestjs/websockets` package
- `@nestjs/platform-socket.io` or `ws` package
- `socket.io` or `ws` client library

## Frontend Implementation

### 1. WebSocket Service

#### 1.1 WebSocket Client Hook
**File**: `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts`

**Features**:
- Manages WebSocket connection to chronus-backend
- Handles authentication (JWT token in query params)
- Streams audio chunks from microphone
- Receives transcription chunks and appends them to note description
- Handles connection lifecycle (connect, disconnect, error)

**API**:
```typescript
const {
  isConnected,
  isRecording,
  error,
  startRecording,
  stopRecording
} = useTranscriptionWebSocket(noteId, onTranscriptionChunk);
```

**onTranscriptionChunk callback**: Receives transcription text and appends it to note description via `useNoteEditor`

### 2. Audio Recording Hook

#### 2.1 Audio Recorder Hook
**File**: `frontend/src/pages/NotePage/hooks/useAudioRecorder/useAudioRecorder.ts`

**Features**:
- Manages microphone access via `getUserMedia`
- Creates AudioContext and processes audio stream
- Uses ScriptProcessorNode to capture audio chunks
- Sends binary audio data to WebSocket
- Handles microphone permissions and errors
- Similar to thoth-frontend AudioRecorder component logic

### 3. UI Components

#### 3.1 Transcription Recorder Component
**File**: `frontend/src/pages/NotePage/components/TranscriptionRecorder/TranscriptionRecorder.tsx`

**Features**:
- Start/Stop recording button with microphone icon
- Connection status indicator
- Error messages for microphone/connection issues
- Loading states during connection and recording
- Transcription chunks automatically append to note description in real-time (no preview area needed)

**UI Elements**:
- Record button (mic icon, changes to stop when recording)
- Status indicator (connected, recording, error)
- Optional: Recording duration timer

**Integration**:
- Transcription text flows directly into the note editor textarea via `useNoteEditor`
- No separate preview area - text appears in real-time in the existing textarea
- Uses existing debounced save mechanism for persistence

#### 3.2 Integration Point

**File**: `frontend/src/pages/NotePage/NotePage.tsx`

**Add**:
- Import `TranscriptionRecorder` component
- Place above or within note editor area
- Only show for memo notes (notes with `isMemo: true`)
- Pass `noteId` and callback to append transcription to note description

**File**: `frontend/src/pages/NotePage/components/NoteEditor/hooks/useNoteEditor.ts`

**Add**:
- Method to append text to description: `appendToDescription(text: string)`
- This will update the description state and trigger debounced save
- Called by transcription WebSocket hook when chunks arrive

**Flow**:
1. User clicks record button in `TranscriptionRecorder`
2. WebSocket receives transcription chunks
3. Each chunk calls `appendToDescription()` in `useNoteEditor`
4. Description state updates, textarea shows new text in real-time
5. Existing debounced save mechanism saves the updated note

### 4. Styling

- Use MUI components (Button, IconButton, CircularProgress)
- Follow existing design patterns
- Responsive design for mobile/desktop

## Configuration

### Backend Environment Variables

Add to `.env` or environment configuration:

```bash
THOTH_WS_URL=ws://localhost:8000
THOTH_API_URL=http://localhost:8000  # Optional, for health checks
```

### Frontend Environment Variables

WebSocket URL is constructed from API base URL:

```bash
# Uses existing API base URL from axios interceptor
# WebSocket URL: ws://${API_BASE_URL}/api/notes/:id/transcribe-audio
```

Or if separate WebSocket server:

```bash
VITE_WS_BASE_URL=ws://localhost:3000
```

## Error Handling

### Backend
- **Note not found**: Close WebSocket with error message
- **Access denied**: Close WebSocket if user doesn't own note
- **Thoth service unavailable**: Close WebSocket with error, log connection failure
- **WebSocket connection errors**: Handle reconnection logic, emit error to client
- **Transcription errors**: Forward error messages from thoth-backend to client

### Frontend
- **Microphone access denied**: Show user-friendly message with instructions
- **WebSocket connection failed**: Show error, allow retry
- **Connection lost during recording**: Attempt reconnection, show status
- **Transcription errors**: Display error messages from backend
- **Network errors**: Handle gracefully, show retry option

## Testing Strategy

### Backend Tests

1. **Unit Tests**:
   - `ThothWebSocketClientService` - Mock WebSocket client, test connection lifecycle
   - `AppendTranscriptionToNoteTransactionScript` - Mock dependencies, test note append logic

2. **Integration Tests**:
   - WebSocket gateway connection handling
   - Audio chunk forwarding to thoth-backend
   - Transcription chunk forwarding to client
   - Transcription accumulation and appending to note
   - Mock thoth-backend WebSocket server

3. **E2E Tests**:
   - Full flow: Client connects → streams audio → receives transcription → transcription appended to note

### Frontend Tests

1. **Component Tests**:
   - `TranscriptionRecorder` - Test recording states, button interactions, error display

2. **Hook Tests**:
   - `useTranscriptionWebSocket` - Test WebSocket connection, message handling
   - `useAudioRecorder` - Test microphone access, audio processing

3. **Integration Tests**:
   - Full recording flow with mock WebSocket server

## Future Enhancements

1. **Audio Playback**: Play recorded audio before/after transcription
2. **Language Selection**: Allow user to specify language for transcription
3. **Transcription Formatting**: Auto-format transcription (punctuation, capitalization)
4. **Pause/Resume**: Allow pausing and resuming recording
5. **Voice Activity Detection**: Auto-stop recording after silence
6. **Transcription Editing**: Allow users to edit transcription in the editor as it's being added

## Implementation Checklist

### Backend
- [ ] Install `@nestjs/websockets` and `ws` packages
- [ ] Create `ThothWebSocketClientService` in infrastructure layer
- [ ] Create `AppendTranscriptionToNoteTransactionScript`
- [ ] Create `TranscribeAudioGateway` WebSocket gateway
- [ ] Add WebSocket authentication/authorization
- [ ] Add `WebSocketModule` to notes module
- [ ] Add environment variable configuration (`THOTH_WS_URL`)
- [ ] Implement audio chunk forwarding (binary data)
- [ ] Implement transcription chunk forwarding (JSON)
- [ ] Implement transcription accumulation
- [ ] Implement append transcription to note on disconnect
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Write E2E tests

### Frontend
- [ ] Create `useTranscriptionWebSocket` hook
- [ ] Create `useAudioRecorder` hook (microphone access, audio processing)
- [ ] Create `TranscriptionRecorder` component
- [ ] Integrate component into `NotePage`
- [ ] Add JWT token to WebSocket connection
- [ ] Add `appendToDescription` method to `useNoteEditor` hook
- [ ] Connect transcription chunks to append to note description in real-time
- [ ] Add error handling and loading states
- [ ] Add connection status indicators
- [ ] Transcription automatically appears in textarea and saves via existing debounced save
- [ ] Write component tests
- [ ] Write hook tests
- [ ] Write integration tests

### Documentation
- [ ] Update API documentation
- [ ] Add environment variable documentation
- [ ] Update README with setup instructions

## Dependencies

### Backend
- `@nestjs/websockets` - WebSocket support
- `@nestjs/platform-socket.io` or `ws` - WebSocket platform adapter
- `socket.io` or `ws` - WebSocket client library (for connecting to thoth-backend)
- `@nestjs/jwt` - JWT validation for WebSocket authentication (if not already present)

### Frontend
- No new dependencies required (uses native WebSocket API and existing React/MUI)

## Security Considerations

1. **WebSocket Authentication**: Validate JWT token on WebSocket connection
2. **Note Access Control**: Verify user owns note before allowing connection
3. **Rate Limiting**: Consider rate limiting WebSocket connections per user
4. **Connection Timeout**: Set maximum connection duration to prevent abuse
5. **Audio Data Validation**: Validate audio chunk format and size
6. **CORS**: Ensure thoth-backend allows WebSocket connections from chronus-react-nestjs backend
7. **Secure WebSocket**: Use `wss://` in production for encrypted connections

## Performance Considerations

1. **Audio Chunk Size**: Optimize chunk size (4096 samples from thoth-frontend) for balance between latency and overhead
2. **Connection Pooling**: Reuse WebSocket connections when possible
3. **Transcription Buffering**: Buffer transcription chunks to reduce database writes
4. **Memory Management**: Clean up audio processing resources on disconnect
5. **Connection Limits**: Set maximum concurrent WebSocket connections per server
6. **Thoth Backend Load**: Monitor thoth-backend performance and scale accordingly

## Deployment Notes

1. Ensure thoth-backend is accessible from chronus-react-nestjs backend
2. Configure `THOTH_WS_URL` in production environment (use `wss://` for secure connections)
3. Update CORS settings in thoth-backend to allow WebSocket connections from chronus-react-nestjs
4. Configure WebSocket gateway in NestJS (Socket.IO or native WebSocket)
5. Set up reverse proxy (nginx) to handle WebSocket upgrades if needed
6. Monitor WebSocket connection health and performance
7. Monitor thoth-backend transcription service health
8. Set appropriate connection timeouts and limits

