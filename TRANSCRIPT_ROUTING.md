# Assessment: Routing transcription audio through the Chronus backend

## TL;DR

The frontend opens a **direct, unauthenticated WebSocket from the browser to thoth** at
`wss://x.x.x.61:8443/stream-audio`, completely bypassing the NestJS backend. That
"hides" the traffic from *your own* logging, rate limiting, and auth — not from anyone
else. Any client that can reach that host gets free, anonymous Whisper transcription.

Your repo already contains the blueprint for the fix: `TRANSCRIPTION_FEATURE_SPEC.md`
describes a backend `TranscribeAudioGateway` proxying to thoth. It has one design flaw
(double-append) that you must resolve before building. Below: the traced current path,
the threat model, the target architecture, an implementation plan, and the questions I'd
grill you on before green-lighting it.

---

## 1. What is actually wired today

Traced end to end:

| Step | Where | What happens |
|---|---|---|
| Mic capture | `frontend/src/pages/NotePage/hooks/useAudioRecorder/useAudioRecorder.ts:157-189` | `ScriptProcessorNode` at 16 kHz, mono, 4096-sample buffers. RMS gate, then `onAudioChunk(inputData.buffer)` — raw `Float32Array` bytes |
| Chunk send | `useAudioRecorder` → `sendAudioChunk` (the recorder's `onAudioChunk` prop) | `TranscriptionRecorder.tsx:89-92` wires recorder → WS hook |
| Socket open | `frontend/src/pages/NotePage/hooks/useTranscriptionWebSocket/useTranscriptionWebSocket.ts:103-110` | `new WebSocket(\`${env.VITE_THOTH_WS_URL}/stream-audio\`)` — **direct to thoth** |
| Socket send | `useTranscriptionWebSocket.ts:246-276` | `wsRef.current.send(chunk)` when `OPEN` and `isRecording` |
| Transcriptions back | `useTranscriptionWebSocket.ts:121-184` | `JSON.parse(event.data)`, extracts `transcription`, calls the ref'd callback which appends to the editor description |
| Endpoint config | `frontend/vite.env.config.ts:5` | `VITE_THOTH_WS_URL: 'wss://x.x.x.61:8443'` |

Auth context:

- The only JWT machinery is the axios interceptor (`frontend/src/api/axios.interceptor.ts:18-21`),
  which prefixes `/api` and attaches `Authorization: Bearer <localStorage.jwt_token>`.
- The WebSocket does **not** go through axios. It carries **no token at all**.
- Backend auth is `passport-jwt` Bearer-header only (`backend/src/auth/jwt.strategy.ts:13-26`),
  applied per-controller via `JwtAuthGuard`. There is **no WebSocket surface** in the backend —
  no `@nestjs/websockets`, no `ws`, no socket.io installed.
- The hook's `noteId` and `enabled` props are dead (`useTranscriptionWebSocket.ts:20,22` — "Kept for
  future use", "Intentionally unused").

Also notable: `socket.io-client@^4.8.3` is in `frontend/package.json:52` but never imported, and
`useNoteStorage.ts` reads a wrong token key (`'token'`) but is dead code.

---

## 2. Why this is a problem — and the "hide the traffic" misunderstanding

**What is being hidden today is your own infrastructure, not your traffic:**

1. **No authentication.** The handshake carries no JWT, no cookie, nothing. Anyone who can route to
   `x.x.x.61:8443` can stream arbitrary audio and consume Whisper compute. The backend's own
   audio endpoints are `@UseGuards(JwtAuthGuard)` — this path has no equivalent.
2. **No note/user binding.** `noteId` is never sent. Server-side, you cannot answer "which user
   recorded this, against which note?". That kills audit, storage association, and abuse attribution.
3. **No rate limiting, no connection caps.** The backend's global `ThrottlerGuard` does not apply to
   WebSockets. Whisper is CPU-heavy — a handful of malicious sessions can DoS thoth.
4. **Bypasses all backend observability.** pino logs, ownership checks, CORS policy — none of it
   sees this stream. If you ever thought "the backend will log/audit transcription", it doesn't.
5. **Internal IP baked into a committed file.** `x.x.x.61:8443` is RFC1918. Browsers must reach
   it directly, which means: firewall rules client→thoth, WSS against an IP (TLS cert SAN problems),
   and the address leaks into any deploy config that ships `vite.env.config.ts` as-is.

**The real "hide the traffic" fix** is not to make the browser→thoth path sneaky — it's to make
thoth *unreachable from clients entirely* and have the backend mediate it.

---

## 3. Your spec already describes the fix — but has a design flaw

`TRANSCRIPTION_FEATURE_SPEC.md` is the right shape:

- `ThothWebSocketClientService` (infra remote caller, mirroring `HermesRemoteCaller`)
- `TranscribeAudioGateway` at `/api/notes/:id/transcribe-audio`
- JWT validation + note ownership on connect
- `AppendTranscriptionToNoteTransactionScript` on disconnect

**The flaw:** the spec has the backend *accumulate* transcription and append it to the note on
disconnect (lines 71-92, 117). But the frontend today appends each chunk **live** into the editor
description, which the existing debounced save persists (`useTranscriptionWebSocket.ts:121-184` →
`appendToDescription`). If you build the spec as written **and** keep the current live-append, every
recording is written twice — once by the editor's debounced save, once by the backend TS.

**Decision: who owns the note text mutation?**

| Option | Behavior | Pros | Cons |
|---|---|---|---|
| **A. Thin authenticated proxy** | Gateway validates auth + ownership, relays binary frames both ways. Frontend keeps live-append + debounced save. No new DB writes. | Closes the security hole with minimal behavior change; no double-write; smallest surface | Transcription only persists if the editor save runs; no server-side copy of the recording |
| **B. Server-owned append** (spec as written) | Gateway buffers, appends on disconnect, frontend stops editing the description during recording | Single server-side source of truth; survives a dropped browser tab | Bigger UX change; needs a "transcription preview" state so text isn't invisible while recording |

**Recommendation:** Option A now (close the hole, low risk), Option B later as a proper feature.
If you pick B, the frontend must stop calling `appendToDescription` live, or you'll ship a
double-append bug on day one.

---

## 4. Target architecture

```
Browser (native WebSocket, binary frames + JSON)
  │
  └─ wss://chronus/api/notes/:id/transcribe-audio        (JWT via Sec-WebSocket-Protocol)
       │
       ▼
  TranscribeAudioGateway  (@nestjs/websockets + @nestjs/platform-ws)
       │
       ├─ WsJwtGuard  ── validate token ──► userId
       ├─ NoteOwnershipPort.verifyOwnership(noteId, userId)   (reuse existing port/adapter)
       │
       └─ ThothWebSocketClientService   (infra, `ws` client — mirrors HermesRemoteCaller)
            │
            ▼
       wss://thoth:8443/stream-audio
```

Notes:

- **Zero Vite changes needed.** The dev/preview proxy already forwards WS upgrades on `/api`
  (`frontend/vite.config.ts:72-79, 94-101`, `ws: true`), and the backend global prefix is already
  `api` (`backend/src/main.ts:23`).
- **The frontend should stop knowing thoth exists.** `VITE_THOTH_WS_URL` gets deleted; the hook
  derives the WS URL from the API origin and the note id.
- **Thoth's port becomes backend-only.** Firewall `x.x.x.61:8443` so only the NestJS host can
  reach it. That is the "hide the traffic" step.

---

## 5. Implementation plan

### Phase 0 — Decisions (see §7)
Freeze: Option A vs B, WS platform, token transport.

### Phase 1 — Backend WS foundation + auth
- Install `@nestjs/websockets`, `@nestjs/platform-ws`, `ws`.
- `backend/src/notes/apps/gateways/transcribe-audio.gateway.ts` — `@WebSocketGateway({ namespace: 'notes/:id/transcribe-audio' })`.
- **Do not** reuse `JwtAuthGuard` — passport-jwt reads the Bearer header, which browsers cannot set
  on a WebSocket handshake. Write a small `WsJwtGuard` that validates a token from
  `sec-websocket-protocol` (recommended) or a query param, using the same `JwtService`/secret.
- Wire the gateway into `NotesModule`.

### Phase 2 — Thoth client (infra)
- `backend/src/notes/infra/remote-callers/thoth-websocket-client.service.ts` — a `ws` client that
  connects to `${THOTH_WS_URL}/stream-audio`, owns reconnect/close, `send(binary)`, and emits
  `transcription` events. Mirror the `HermesRemoteCaller` shape (constructor guard on missing env,
  error mapping). This is where Option B's accumulation would live if chosen.

### Phase 3 — Ownership check
- Reuse the existing cross-module port: `NoteOwnershipPort` / `NoteOwnershipAdapter`
  (`backend/src/audio/domain/ports/note-ownership.port.ts`,
  `backend/src/notes/apps/adapters/note-ownership.adapter.ts`). Verify on connect, close with an
  error if not owner. `ThrottlerGuard` won't help — add per-user connection caps and a max session
  duration in the gateway.

### Phase 4 — Append TS (only if Option B)
- `backend/src/notes/domain/transaction-scripts/append-transcription-to-note.transaction.script.ts`
  per spec. Skip entirely under Option A.

### Phase 5 — Frontend rewire
- `useTranscriptionWebSocket.ts:103-110`: build `wss://<apiOrigin>/api/notes/${noteId}/transcribe-audio`,
  pass the JWT via `Sec-WebSocket-Protocol` (or query param per decision), wire up the currently
  dead `noteId`/`enabled` props, and delete the `VITE_THOTH_WS_URL` import.
- Delete `VITE_THOTH_WS_URL` from `vite.env.config.ts` and the sample.
- Remove the dead `socket.io-client` dependency (unless Option B uses it — it shouldn't).

### Phase 6 — Ops
- Backend env: `THOTH_WS_URL` (and `.env.sample`), e.g. `wss://thoth:8443`.
- Firewall: `x.x.x.61:8443` allow-list to backend hosts only.
- TLS: backend→thoth must trust thoth's cert (pin/trust the self-signed cert in the backend's ca
  store; do **not** ship `rejectUnauthorized: false` as a default).
- PWA: the service worker's `navigateFallbackAllowlist: [/^\/(?!api\/).*$/]` already excludes
  `/api`, so `/api/notes/:id/transcribe-audio` won't be swallowed by the SW — no change needed.

---

## 6. Key decisions

| Decision | Options | Recommendation |
|---|---|---|
| WS platform | `@nestjs/platform-ws` (raw) vs `@nestjs/platform-socket.io` | **Raw `ws`.** Matches the current browser `WebSocket` protocol; zero change to the binary-frame/JSON contract; no protocol migration on the client. |
| Token transport | Query param vs `Sec-WebSocket-Protocol` subprotocol vs cookie | **Subprotocol** (`new WebSocket(url, [token])`). Query params leak into access logs, proxy logs, and Referer; cookies bring CSRF into scope. If you must use the query param, scrub it from all logs. |
| Note-text ownership | A (thin proxy) vs B (server append) | **A now, B later.** Avoids the double-append bug in §3. |
| Backend→thoth TLS | wss with trusted/pinned cert vs ws | **wss + trusted cert.** Thoth is internal, but don't ship a known-unsafe client as the default. |
| Thoth abuse protection | None today | Firewall to backend-only + per-user WS caps + max session duration in the gateway. Whisper is expensive. |
| Persistence | Editor debounced save (A) vs DB (B) | A: none extra. B: `note_audios`-style table or description append. |

---

## 7. The grilling — questions I'd ask you before building this

1. **Who owns the note text — the editor or the server?** If you don't answer this, you will ship
   the double-append bug (§3). Current code is "editor owns it." Are you okay with that?
2. **Is `jwt_token` in `localStorage` acceptable for a WS credential?** XSS in the frontend = token
   theft today for the HTTP API too, so this isn't new — but are you sure you don't want
   short-lived WS tokens or an httpOnly cookie for the socket specifically?
3. **Does thoth itself accept any credential?** Nothing is sent today. After the fix, thoth's only
   trust boundary is the backend. Are you comfortable with thoth having **zero** auth and relying on
   the firewall alone? (That's defensible — but only if the firewall is actually enforced.)
4. **What's the concurrency model?** Is thoth single-tenant per session (1 client socket → 1 thoth
   socket)? What happens when two browser tabs transcribe the same note at once — do you allow it,
   reject the second, or queue?
5. **What is `x.x.x.61` / `x.x.x.119` in prod terms?** Is this a LAN app where the threat
   model is "trusted-ish internal users," or does it face the public internet? That changes whether
   the firewall-only posture is fine or reckless.
6. **What happens when the browser dies mid-recording?** Under Option A the transcription is lost
   unless the editor saved chunks as they arrived. Is losing the last ~N seconds acceptable?
7. **Who cleans up the thoth socket?** The gateway must tear down the upstream thoth connection when
   the client disconnects (abrupt or graceful) — thoth shouldn't be left transcribing dead sessions.
8. **Do you want a connection-kill timeout?** A cap (say 30 min) prevents an abandoned tab from
   holding a Whisper session forever. Configurable?
9. **Are you okay deleting `VITE_THOTH_WS_URL`?** The frontend should no longer know thoth's address
   at all. If some other flow depends on it, say so now.

---

## 8. Order of operations and verification

1. Phase 0 decisions (§7).
2. Backend: deps → `WsJwtGuard` → gateway skeleton (echo/health) → manual `wscat` test with a token.
3. Backend: `ThothWebSocketClientService` with a mocked thoth (a tiny `ws` server in the test suite
   that echoes `{ transcription: ... }`).
4. Ownership check wired in; verify a non-owner's connect is rejected with a closed socket.
5. Frontend: repoint the hook at the backend, verify dev-mode streaming through the Vite proxy.
6. Verify firewall: attempt a browser→thoth direct connect from a client — it must fail; only the
   backend host succeeds.
7. Cleanup: remove `VITE_THOTH_WS_URL`, dead `socket.io-client`, dead `useNoteStorage`.

Verification commands (backend):
```bash
npm run lint && npm run test   # unit tests; __specs__/ co-located, SUT named `target`
```
Manual smoke:
```bash
# token from login; echo-server style check via wscat against the gateway, then real mic test
wscat -c "wss://localhost:3000/api/notes/1/transcribe-audio" -H "Sec-WebSocket-Protocol: <token>"
```

---

## Bottom line

The direct browser→thoth socket is the security hole; your own `TRANSCRIPTION_FEATURE_SPEC.md` is
the fix, with one unresolvable-in-isolation question (who appends transcription). Decide §7.1
(Option A vs B), build the gateway as a thin authenticated proxy, firewall thoth to backend-only,
and delete every trace of thoth from the frontend. That is how you "hide the traffic" — by making
thoth invisible to clients, not by making the connection quiet.