# Spec: Route transcription audio through the Chronus backend

**Status:** Ready to implement
**Repos:** `chronus-react-nestjs` (this spec), `thoth-backend` (`specs/stream-audio-hardening.md`)
**Supersedes:** `TRANSCRIPTION_FEATURE_SPEC.md` (kept for history; this spec resolves its double-append flaw)
**Related assessment:** `TRANSCRIPT_ROUTING.md`

---

## 1. Problem

The browser opens an unauthenticated WebSocket straight to thoth:

```
frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts:103-110
  new WebSocket(`${env.VITE_THOTH_WS_URL}/stream-audio`)   // wss://172.16.0.49:8443
```

No JWT, no note binding, no rate limit, no logging, no ownership check. Thoth's `CORS_ORIGINS`
does not help: Starlette's `CORSMiddleware` does not run on WebSocket handshakes, and
`transcription_controller.stream_audio` calls `websocket.accept()` unconditionally. Any host that
can route to thoth gets free anonymous Whisper compute.

**This spec closes that hole and changes nothing else.** Transcription behaviour, persistence, and
UX are identical before and after; only the path the bytes take changes.

## 2. Decisions taken

| # | Decision | Choice |
|---|---|---|
| D1 | Note-text ownership | **Thin authenticated proxy. The editor keeps owning the text.** The gateway validates, relays, and writes nothing to the database. The frontend keeps live-append + the existing debounced save. See §2.1. |
| D2 | Concurrency | **Deferred.** Thoth is single-session per process (§3). We do not build multi-session support. We *do* fail loudly instead of corrupting silently: one session per user, rejected with a defined close code. |
| D3 | WS platform | **Raw `ws`** via `@nestjs/platform-ws`. Preserves the existing binary-frame + JSON contract; no client protocol migration. |
| D4 | Token transport | **`Sec-WebSocket-Protocol` subprotocol.** Browsers cannot set `Authorization` on a WS handshake. Query params leak into access/proxy logs. |
| D5 | Backend → thoth auth | **None in phase 1.** Thoth is not public-facing; network isolation plus an `Origin`-header rejection in thoth is the boundary. A `THOTH_STREAM_TOKEN` hook is specced but disabled. |
| D6 | Thoth address in the frontend | **Deleted.** `VITE_THOTH_WS_URL` and the dead `VITE_USE_TRANSCRIPTION_PROXY` are removed. |

### 2.1 Why D1 is a thin proxy, and what it costs

The alternative ("server owns the append": gateway accumulates transcription and writes it to the
note on disconnect) was evaluated and rejected. Recorded here so it is not re-litigated.

**It buys no security.** Under a thin proxy the client decides what text is written — but it already
could: a user can PUT any description to their own note via `UpdateNoteAction`, which is guarded and
ownership-checked. Both options write to a note the user owns, so there is no privilege escalation.
Server-side ownership of the text protects against a *buggy* client, not a *hostile* one.

**Its durability benefit is under one second.** `useNoteEditor.ts` debounces saves at 1000 ms and
thoth emits a transcription roughly every 3 s (`AUDIO_BUFFER_DURATION_SECONDS=3.0`). Audio still
inside thoth's 3 s buffer is lost under both designs, because thoth never emitted it. A killed tab
therefore loses at most the one chunk that arrived less than a second ago.

**Its cost is a silent data-loss bug waiting to happen.** Server-side append creates a lost-update
race: the gateway writes the transcription to the DB, the user types one character, and
`debouncedSave` fires with React state that never saw the transcription and overwrites it.
Preventing that needs save suspension, a flush-before-connect ordering rule, an `adoptDescription`
path, a read-only textarea, a separate preview region, and a stop-and-wait commit round-trip. All of
it is accident complexity created by the design, and none of it closes the security hole.

**What we give up:** audit granularity. Server-side you will see *"user X held a transcription
session on note Y for 4 minutes"*, but the text arrives through the normal note-update endpoint, so
transcribed text is indistinguishable from typed text at rest. That is a forensics nicety, not an
access control.

**Revisit if** you want a server-side record of transcriptions independent of note text — audit,
re-processing, or a transcription-history view. That is a genuine feature and server-owned append is
its foundation. Spec it on its own terms then; do not ride it along with a security fix. The gateway
built here needs only an accumulation buffer (a few lines) and a transaction script to support it —
the expensive part is the frontend, and that cost is the same whenever it is paid.

## 3. Constraint you must design around: thoth is single-session per *process*

`thoth-backend/app/di/container.py` constructs **one** `InMemoryAudioBuffer` and **one**
`ChunkedWhisperTranscriptionEngine` at boot and wires them through a single
`StreamingTranscriptionDomainService` → `StreamAudioUseCaseImpl` → controller. Every WebSocket
connection shares that state:

- `transcription_controller.stream_audio` calls `reset_stream()` on connect **and** in `finally`.
  A second client connecting wipes the first client's buffer; either client disconnecting wipes
  the other's.
- `StreamingTranscriptionDomainService.process_audio_chunk` appends to one shared list. Two
  concurrent streams interleave float32 samples from different speakers into one Whisper window.

Consequence: a transparent N-clients → N-upstream-sockets relay produces **corrupt** transcriptions
for all participants, not merely degraded ones. Per D2 we accept single-session operation and make
it explicit. The gateway enforces one live session per user; thoth adds a second-connection guard
(thoth spec §4). Lifting this is a separate, specced-but-unscheduled change.

## 4. Target architecture

```
Browser  (native WebSocket, binary PCM frames up, JSON frames down)
   │  wss://chronus.cc-an.com/api/notes/transcribe-audio?noteId=123
   │  Sec-WebSocket-Protocol: chronus.jwt, <token>
   ▼
Vite preview proxy  (frontend/vite.config.ts:94-101, ws: true — already correct, no change)
   ▼
TranscribeAudioGateway            @nestjs/platform-ws
   ├─ authenticate handshake      → userId          (WsJwtAuthenticator)
   ├─ NOTE_OWNERSHIP_PORT.verifyOwnership(noteId, userId)
   ├─ session registry            → one live session per user, max duration cap
   └─ ThothStreamRemoteCaller     (infra, `ws` client — mirrors HermesRemoteCaller)
        ▼
   wss://<THOTH_WS_URL>/stream-audio        ← firewalled to the Chronus backend host only

Transcription text returns to the browser, is appended to the editor, and is persisted by the
existing debounced save through UpdateNoteAction. The gateway performs no database writes.
```

### 4.1 Two NestJS gotchas that shape the URL

1. **`setGlobalPrefix('api')` does not apply to gateways.** `main.ts:23` prefixes HTTP routes only.
   The gateway `path` must spell out `/api` itself.
2. **Gateway `path` is a fixed string — it does not support `:id` params.** Rather than write a
   custom `WsAdapter` to parse `/api/notes/:id/transcribe-audio`, the gateway listens on a fixed
   path and takes `noteId` from the query string. `noteId` is not a secret; the query-param
   objection in D4 applies to the token, which stays in the subprotocol.

Final URL: `wss://<page origin>/api/notes/transcribe-audio?noteId=<id>`

## 5. Wire protocol

**Client → server**

| Frame | Payload |
|---|---|
| binary | raw `Float32Array` buffer, 16 kHz mono, 4096 samples (16384 bytes) — unchanged from today |

That is the entire client-to-server protocol. Stopping is closing the socket; there is no control
message and no commit/discard negotiation, because the gateway owns no state worth committing.

The gateway **must not** relay any text frame upstream. `transcription_controller.stream_audio`
calls `websocket.receive_bytes()` and raises on a text frame. Non-binary frames from the client are
logged and dropped.

**Server → client** (all text frames, JSON)

| Message | Payload | When |
|---|---|---|
| `ready` | `{"type":"ready"}` | auth + ownership passed, upstream thoth socket open. The client must not send audio before this, or chunks are silently dropped. |
| `transcription` | `{"type":"transcription","text":"..."}` | a chunk arrived from thoth |
| `error` | `{"type":"error","code":"...","message":"..."}` | terminal error; followed by a close |

`transcription` deliberately wraps thoth's raw `{"transcription": "..."}` in a typed envelope so the
client is not parsing thoth's shape, and so new message types can be added without ambiguity.

**Close codes**

| Code | Meaning |
|---|---|
| `4401` | missing/invalid/expired JWT |
| `4403` | authenticated but does not own `noteId` |
| `4404` | `noteId` missing, malformed, or no such note |
| `4409` | this user already has a live transcription session |
| `4408` | session exceeded `TRANSCRIPTION_MAX_SESSION_MS` |
| `1011` | upstream thoth unreachable or failed |
| `1000` | normal close |

Session end — any cause, including an abrupt drop — is the same path: cancel the duration timer,
close the upstream thoth socket, release the registry claim. No database interaction on any path.

## 6. Backend implementation

### 6.1 Dependencies

```
npm i @nestjs/websockets @nestjs/platform-ws ws
npm i -D @types/ws
```

`main.ts` — after `app.setGlobalPrefix('api')`:

```ts
import { WsAdapter } from '@nestjs/platform-ws';
app.useWebSocketAdapter(new WsAdapter(app));
```

### 6.2 Files

```
src/notes/
├── apps/
│   ├── gateways/
│   │   ├── transcribe-audio.gateway.ts
│   │   └── __specs__/transcribe-audio.gateway.spec.ts
│   └── guards/
│       ├── ws-jwt.authenticator.ts
│       └── __specs__/ws-jwt.authenticator.spec.ts
├── domain/
│   └── services/
│       ├── transcription-session.registry.ts
│       └── __specs__/transcription-session.registry.spec.ts
└── infra/
    └── remote-callers/
        ├── thoth-stream.remote-caller.ts
        └── __specs__/thoth-stream.remote-caller.spec.ts
```

No transaction script, no repository change, no migration — the gateway does not touch the database.
Naming follows `backend/AGENTS.md`: SUT is `target`, mocks are `{dep}Mock`, specs in co-located
`__specs__/`.

### 6.3 `WsJwtAuthenticator`

Not a `CanActivate` guard. Nest guards run on `@SubscribeMessage` handlers, not on
`handleConnection`, and we must reject **before** accepting audio. This is a plain injectable
called from `handleConnection`.

```ts
@Injectable()
export class WsJwtAuthenticator {
  constructor(private readonly jwtService: JwtService) {}

  // Returns userId, or null if the handshake carries no usable token.
  authenticate(request: IncomingMessage): number | null;
}
```

- Reads `sec-websocket-protocol`, splits on `,`, trims. Expects exactly
  `['chronus.jwt', '<token>']`.
- Verifies with `JwtService.verify` — same secret as `jwt.strategy.ts:13-26`, honouring expiry.
- Maps `payload.sub` → `userId`. `jwt.strategy.ts` returns `{ userId: payload.sub }` as a **string**;
  `NoteOwnershipPort.verifyOwnership(noteId: number, userId: number)` wants a number. Coerce once
  here and fail closed on `NaN`.
- **Subprotocol echo is mandatory.** The server must select one of the offered subprotocols or
  Chrome/Firefox fail the connection client-side. Configure the gateway's `handleProtocols` to
  return `'chronus.jwt'` — never the token itself, which would echo the credential into the
  response headers.

> `JWT_EXPIRES_IN` is `7d` in `.env.sample`, so token lifetime will not truncate a recording.
> Separately: `auth.module.ts:22` defaults to `'1m'` when the env var is absent. Not this spec's
> job to fix, but worth knowing before you debug a 60-second disconnect.

### 6.4 `TranscriptionSessionRegistry`

```ts
@Injectable()
export class TranscriptionSessionRegistry {
  tryClaim(userId: number): boolean;   // false if user already holds a session
  release(userId: number): void;
}
```

In-memory `Map<number, ...>`. Single-process only — documented, acceptable given D2 and the
deployment. `TRANSCRIPTION_MAX_SESSIONS_PER_USER` defaults to `1`.

### 6.5 `ThothStreamRemoteCaller`

Mirrors `src/audio/infrastructure/remote-callers/hermes.remote-caller.ts`: constructor reads
`THOTH_WS_URL` from `ConfigService` and throws if missing; a `Logger` named after the class;
errors mapped, never leaked raw.

```ts
@Injectable()
export class ThothStreamRemoteCaller {
  // One upstream socket per call. NOT a shared/pooled connection — see §3.
  open(handlers: {
    onTranscription: (text: string) => void;
    onError: (error: Error) => void;
    onClose: () => void;
  }): Promise<ThothStreamHandle>;
}

type ThothStreamHandle = {
  send(chunk: Buffer): void;
  close(): void;
};
```

- Connects to `${THOTH_WS_URL}/stream-audio`.
- **No reconnect.** Thoth's buffer state does not survive a reconnect (`reset_stream()` in
  `finally`), so a silent reconnect would splice unrelated audio into one Whisper window. A dropped
  upstream ends the session: `onError` → gateway sends `error` → close `1011`. The client keeps
  whatever it already appended.
- Parses `{"transcription": "..."}`; ignores anything else.
- **Does not set an `Origin` header.** Thoth rejects handshakes that carry one (thoth spec §3).
  This is load-bearing — do not add `origin` to the `ws` client options.
- TLS: thoth serves a self-signed cert on `:8443`. Trust it explicitly by passing `ca` from
  `THOTH_CA_CERT` (path). **Do not ship `rejectUnauthorized: false`.** If `THOTH_CA_CERT` is unset
  and the URL is `wss://`, log a startup warning naming the variable.

### 6.6 Gateway

```ts
@WebSocketGateway({
  path: '/api/notes/transcribe-audio',
  handleProtocols: (protocols: Set<string>) =>
    protocols.has('chronus.jwt') ? 'chronus.jwt' : false,
})
export class TranscribeAudioGateway
  implements OnGatewayConnection, OnGatewayDisconnect {}
```

`handleConnection(client: WebSocket, request: IncomingMessage)`:

1. `userId = wsJwtAuthenticator.authenticate(request)` → null ⇒ close `4401`.
2. Parse `noteId` from `request.url` query → missing/`NaN` ⇒ close `4404`.
3. `noteOwnership.verifyOwnership(noteId, userId)` → false ⇒ close `4403`.
   (Injected via `NOTE_OWNERSHIP_PORT` — already provided in `notes.module.ts` and already
   implemented by `NoteOwnershipAdapter`. No new port needed.)
4. `sessionRegistry.tryClaim(userId)` → false ⇒ close `4409`.
5. `thothStream.open(...)` → throws ⇒ release claim, close `1011`.
6. Arm a `setTimeout` for `TRANSCRIPTION_MAX_SESSION_MS` → on fire, close `4408`.
7. Send `{"type":"ready"}`.

Per-message: binary ⇒ `handle.send(chunk)`. Anything else ⇒ log and drop.

`handleDisconnect`: clear the timer, `handle.close()`, `registry.release(userId)`.

**Every exit path must release the registry claim and close the upstream socket.** A leaked claim
locks the user out until restart; a leaked upstream socket leaves thoth transcribing a dead session
and, given §3, blocking the next one. Put both in a `finally`, and make sure the early rejections in
steps 1–4 do not claim-then-forget.

Logging (pino, already configured): connect with `{ userId, noteId }`, every rejection with its
close code, session duration and relayed-chunk count on close. Never log token or audio bytes.

### 6.7 Module wiring — `src/notes/notes.module.ts`

Add to `providers`: `TranscribeAudioGateway`, `WsJwtAuthenticator`,
`TranscriptionSessionRegistry`, `ThothStreamRemoteCaller`. `AuthModule` is already imported and
exports `JwtModule`'s `JwtService` — confirm the re-export, and add `JwtModule` to `NotesModule`'s
imports if `JwtService` does not resolve.

### 6.8 Environment — `backend/.env.sample`

```bash
# Thoth transcription service (private network only — never exposed to clients)
THOTH_WS_URL=wss://172.16.0.49:8443
# PEM path for thoth's self-signed certificate. Required when THOTH_WS_URL is wss://.
THOTH_CA_CERT=/etc/chronus/thoth-ca.pem
# Hard cap on a single transcription session (ms). Default 30 minutes.
TRANSCRIPTION_MAX_SESSION_MS=1800000
# Live transcription sessions allowed per user. See specs/transcription-gateway.md §3.
TRANSCRIPTION_MAX_SESSIONS_PER_USER=1
```

Add `THOTH_WS_URL` to the Joi schema in `src/app.module.ts` (see `JWT_EXPIRES_IN` at line 38 for
the pattern). Make it `.required()` only if you are comfortable with the backend refusing to boot
without thoth configured — otherwise `.optional()` and have the gateway close `1011`.

## 7. Frontend implementation

D1 means the editor is **untouched**. `useNoteEditor.ts` needs no changes: no save suspension, no
`adoptDescription`, no read-only textarea, no preview region. Transcription still flows into
`appendToDescription` and is persisted by the existing debounced save. The work here is repointing
the socket and deleting debug scaffolding.

### 7.1 `useTranscriptionWebSocket`

`frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts`

- Build the URL from the page origin, not from env:
  `` `${location.origin.replace(/^http/, 'ws')}/api/notes/transcribe-audio?noteId=${noteId}` ``
  This rides the existing Vite proxy (`ws: true`) in dev and preview, and the same origin in prod.
  Delete the `env` import.
- `new WebSocket(url, ['chronus.jwt', localStorage.getItem('jwt_token') ?? ''])`.
  Bail with a clear error before connecting if the token is absent.
- `noteId` and `enabled` stop being dead props (`:20`, `:22`) — `noteId` goes in the URL, `enabled`
  gates the connection. Delete the `void noteId; void enabled;` suppressions and the "Kept for
  future use" / "Intentionally unused" comments.
- Handle the §5 envelope: switch on `data.type` rather than sniffing for a bare `transcription`
  field. `ready` flips a gate that `sendAudioChunk` checks; `transcription` calls `onTranscription`;
  `error` surfaces to the caller.
- **Gate audio on `ready`.** Today the hook starts sending as soon as the socket is `OPEN`. The
  socket is now open before the upstream thoth connection exists, so chunks sent between `open` and
  `ready` are dropped. Track a separate `isReady` ref.
- Map close codes to messages (§7.3).

The return shape is unchanged, so `TranscriptionRecorder` keeps working:

```ts
type UseTranscriptionWebSocketReturn = {
  isConnected: boolean;
  isRecording: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  sendAudioChunk: (chunk: ArrayBuffer) => void;
};
```

**Delete the debug scaffolding while you are in here:**

- The entire `useEffect` at `:42-88`. It calls `.toString()` on the callback and pattern-matches its
  source text to guess whether the editor has mounted. It ships to production and breaks under
  minification, where the source text it matches on no longer exists.
- The `callback.toString()` inspection inside `onmessage` (`isWrapperCallback` and the
  "Callback analysis" log).
- The `Math.random() < 0.01` / `< 0.05` sampled logging in `sendAudioChunk`.

Keep genuine error logging; remove the emoji-tagged tracing.

### 7.2 `TranscriptionRecorder`

`frontend/src/pages/NotePage/components/TranscriptionRecorder/TranscriptionRecorder.tsx`

- Props unchanged.
- Delete the callback-stringifying `useEffect` at `:43-68`, same reasoning as §7.1.
- Surface the new close codes through the existing `Snackbar` (§7.3).
- `handleToggleRecording` already awaits `startWs()` before `startAudio()` — correct, and now more
  important, since `startWs()` resolves on `ready` rather than on socket open. Make sure the promise
  returned by `connect()` resolves on `ready`, not on `onopen`.

### 7.3 Close-code messages

| Code | User-facing message |
|---|---|
| `4401` | "Your session expired — sign in again to keep recording" |
| `4403` | "You don't have access to this note" |
| `4404` | "Note not found" |
| `4409` | "A recording is already in progress" |
| `4408` | "Recording stopped after the maximum session length" |
| `1011` | "Transcription service unavailable" |

### 7.4 Config cleanup

- `frontend/vite.env.config.ts` — delete `VITE_THOTH_WS_URL` and `VITE_USE_TRANSCRIPTION_PROXY`
  (the latter is read by nothing; it is dead from a previous attempt).
- `frontend/vite.env.config.sample.ts` — same.
- `frontend/package.json:52` — remove `socket.io-client`; it is never imported and D3 keeps raw `ws`.
- `frontend/vite.config.ts` — no change. `ws: true` is already set on both `server.proxy` and
  `preview.proxy`.
- Service worker — no change. `navigateFallbackAllowlist: [/^\/(?!api\/).*$/]` already excludes
  `/api`.
- `useNoteStorage.ts` reads the wrong token key (`'token'` vs `'jwt_token'`) and is dead. Delete it
  or fix it; do not leave a wrong-key reader next to a working one.

## 8. Testing

**Backend unit** (`__specs__/`, SUT named `target`, `createApplyMock` from `src/test-utils/test-utils`)

- `WsJwtAuthenticator`: valid token; expired; malformed subprotocol; missing header; non-numeric
  `sub`; token present but wrong secret.
- `TranscriptionSessionRegistry`: claim, double-claim rejected, release, release-then-reclaim.
- `ThothStreamRemoteCaller`: against a real `ws` server started in the test that echoes
  `{transcription: "..."}`. Assert binary passthrough byte-for-byte, JSON parse, **no `Origin`
  header on the handshake**, and no reconnect on upstream close.

**Backend integration** — a fake thoth `ws` server plus a real gateway:

- unauthenticated connect → `4401`
- expired token → `4401`
- non-owner → `4403`
- missing/garbage `noteId` → `4404`
- second concurrent session for one user → `4409`
- happy path: `ready` arrives, audio relayed, `{"type":"transcription"}` returned
- audio sent before `ready` is not silently lost from the user's point of view (client-side gate)
- upstream thoth killed mid-session → `error` + `1011`
- duration cap → `4408`
- **leak check:** after every one of the above, the registry is empty and the upstream socket is
  closed. Assert this explicitly — it is the failure that locks a user out until restart.
- **no DB writes:** assert the note repository is never called by the gateway. This is the guard
  against someone reintroducing server-side append and creating the clobber race described in §2.1.

**Frontend**

- `useTranscriptionWebSocket`: URL construction from origin, subprotocol array shape, missing-token
  bail, each `type` in the envelope, the `ready` gate, close-code → message mapping.
- `TranscriptionRecorder`: `startWs` resolves on `ready` not `open`; error snackbar per close code.

**Manual smoke**

```bash
cd backend && npm run lint && npm run test

# unauthenticated — must be rejected with 4401
wscat -c "wss://localhost:3000/api/notes/transcribe-audio?noteId=1"

# authenticated
wscat -c "wss://localhost:3000/api/notes/transcribe-audio?noteId=1" \
      -s "chronus.jwt" -s "<jwt>"

# someone else's note — must be 4403
wscat -c "wss://localhost:3000/api/notes/transcribe-audio?noteId=<not yours>" \
      -s "chronus.jwt" -s "<jwt>"

# the whole point: this must FAIL from any client machine once thoth is firewalled
wscat -c "wss://172.16.0.49:8443/stream-audio"
```

Then a real mic test through the browser, confirming transcription still lands in the textarea and
still persists via the debounced save.

## 9. Order of operations

1. Deps + `WsAdapter` in `main.ts`; gateway skeleton that accepts and echoes. `wscat` it.
2. `WsJwtAuthenticator` + ownership check + registry + duration cap. Verify
   `4401`/`4403`/`4404`/`4409`/`4408` with `wscat`.
3. `ThothStreamRemoteCaller` against a test `ws` server, then against real thoth. Integration tests
   green, including the leak checks.
4. **Thoth hardening lands here** — `thoth-backend/specs/stream-audio-hardening.md`. Before the
   frontend switch, so there is never a window where both paths are open.
5. Frontend: hook repoint, `ready` gate, close-code messages, debug-cruft deletion. Test through the
   Vite proxy with a real mic.
6. Firewall thoth (thoth spec §7). Verify a direct browser connect fails from a client machine.
7. Cleanup: `VITE_THOTH_WS_URL`, `VITE_USE_TRANSCRIPTION_PROXY`, `socket.io-client`,
   `useNoteStorage`.

Steps 4 and 6 are the ones that actually close the hole. Everything before them is plumbing;
everything after is hygiene.

## 10. Known limitations (write these down, do not rediscover them)

- **One transcription at a time, system-wide.** Enforced per-user in the gateway; thoth adds a
  second-connection guard. Two *different* users recording simultaneously is not prevented by the
  gateway registry — the thoth-side guard is what stops it. Accepted per D2 given single-user
  reality.
- **The registry is per-process.** Multiple backend instances would each allow one session per user.
  Not a concern today; would need Redis or equivalent if the backend is ever scaled out.
- **Transcription durability equals editor durability.** A killed tab loses at most the last chunk
  received within the debounce window (§2.1). No server-side copy exists.
- **No server-side audio or transcription retention.** Nothing distinguishes transcribed text from
  typed text once saved. If you need that, see the revisit condition in §2.1.
- **Thoth is unauthenticated.** Per D5, its only boundaries are the firewall and the `Origin`
  rejection. If thoth ever becomes reachable from an untrusted network, enable `THOTH_STREAM_TOKEN`
  (thoth spec §6) before that happens, not after.
