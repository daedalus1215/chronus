# Spec — users module: extract register into a Transaction Script, fix error mapping, add tests

**Status:** Draft — scope agreed with user 2026-08-23; awaiting OQ3 (scope confirmation) before implementation
**Implementation repo:** `~/app/chronus-react-nestjs` (backend only; frontend untouched)
**Author:** daedalus1215 + Hermes

## Why this exists

A module-level architecture scan (2026-08-23) of `src/users/` found the module half-migrated to
the house Action/TS patterns. Two live problems, both on the register path:

1. `UsersService.register()` -> `createUser()` executes a **write transaction inside a domain
   service** (uniqueness check + `bcrypt.hash` + `save`). Per `docs/patterns/dependency-hierarchy.md`
   (line 136), domain services may touch repositories only for *simple lookups* — writes belong in
   Transaction Scripts. The module's own `update-username`/`update-password` flows already follow
   the correct shape; register is the odd one out.
2. The domain layer imports an **application-layer DTO** (`RegisterUserRequestDto` from
   `app/controllers/dtos/`) — an inverted dependency. The two update Actions build Commands
   correctly; register never got the conversion.

Plus latent bugs the scan surfaced:

3. Both update Transaction Scripts throw bare `new Error(...)` for validation failures
   (`update-username.transaction.script.ts:38,46,50`, `update-password.transaction.script.ts:28,34,52`)
   — these surface as **HTTP 500** instead of 400/404.
4. `update-username` calls `userRepository.findById(userId)` **twice** (lines 44 and 61).
5. The module has **zero tests** (no `__specs__/` anywhere under `src/users/`), violating the
   80%-coverage rule in `backend/AGENTS.md`.

This spec extracts register into a Transaction Script, switches domain outputs to a Projection,
fixes the error mapping, and adds the missing specs. **No endpoint, route, method, or wire-format
changes.**

## Current state (verified by reading the code, 2026-08-23)

### Endpoints (4)

| Endpoint | Guard | Throttle | Handler | Notes |
|---|---|---|---|---|
| `GET /users/profile` | JWT | — | `UsersController.getProfile` | returns `req.user` (legacy controller) |
| `POST /users/register` | public | 5/60s | `UsersController.register` | 201; legacy controller |
| `PUT /users/username` | JWT | — | `UpdateUsernameAction` | builds `UpdateUsernameCommand` (correct pattern) |
| `PUT /users/password` | JWT | — | `UpdatePasswordAction` | builds `UpdatePasswordCommand`; validates `confirmPassword` match in the Action |

### Frontend consumers (verified)

`frontend/src/api/requests/users.requests.ts` calls exactly: `GET /users/profile`,
`PUT /users/username`, `PUT /users/password`; `frontend/src/auth/useAuth.ts:94` calls
`POST /users/register`. **The frontend cannot reach `UsersService.findByUsername` / `findById` /
`updateEmail` — they are service methods with no HTTP endpoint** (confirmed by grep of
`frontend/src`: no other users calls exist).

### Service pass-throughs (KEEP — user decision 2026-08-23)

`UsersService.findByUsername`, `findById`, `updateEmail` have **no callers anywhere in
`src/`** (auth consumes `UserAggregator`, not the service). The user wants them retained pending
further analysis (suspected frontend use — disproven above, but the decision stands). Consequence:
`UserRepository` **stays** in the `UsersService` constructor.

### Current register flow (the violation)

```
UsersController.register(dto, req)
  -> UsersService.register(dto: RegisterUserRequestDto, context: DisabledRegistrationContext)
       gate: NODE_ENV default, configService.get('ALLOW_REGISTRATION'),
             disabled -> securityEventAggregator.logDisabledRegistrationAttempt(context) + 403
       -> UsersService.createUser(dto)            <-- write transaction in a domain service
            userRepository.findByUsername -> 409 ConflictException
            bcrypt.hash(rawPassword, 10)
            userRepository.create({username, password})
            return omit(savedUser, ['password'])  <-- entity-derived shape, not a Projection
```

### File inventory (17 source files)

```
users/
  users.module.ts
  AGENTS.md
  domain/
    users.service.ts                     (service at domain root; module doc says domain/services/)
    entities/user.entity.ts              (id, username unique(20), password(100), email?(255))
    aggregators/user.aggregator.ts       (UserProjection; findByUsernameForAuth, findById, findUsernameById)
    transaction-scripts/
      update-username-TS/  (transaction.script.ts, command.ts)
      update-password-TS/  (transaction.script.ts, command.ts)
  app/
    controllers/
      users.controller.ts                (legacy: profile + register)
      dtos/requests/create-user.request.dto.ts   (RegisterUserRequestDto)
    actions/
      update-username-action/  (action.ts, swagger.ts, dtos/requests/update-username.dto.ts)
      update-password-action/  (action.ts, swagger.ts, dtos/requests/update-password.dto.ts)
  infra/repositories/user.repository.ts  (findByUsername, findById, create, update)
```

### Quirk noted for OQ1

`RegisterUserRequestDto` validates `username` with **`@IsEmail()`** + 4–20 chars, while
`UpdateUsernameTransactionScript` only enforces 4–20 chars (no email check). Today a user can
register with an email-style username and then change it to a non-email. Behavior question, not a
refactor item — see OQ1.

## Scope

**IN (agreed steps 1, 2, 4, 5, 6 from the 2026-08-23 discussion):**

1. New `RegisterUserTransactionScript` + `RegisterUserCommand` for the live register path.
2. `UsersService.register()` keeps the `ALLOW_REGISTRATION` gate + security-event logging,
   delegates persistence to the new TS.
4. DTO -> Command at the boundary: the controller builds `RegisterUserCommand`; the domain
   layer never imports `RegisterUserRequestDto`.
5. Update-username/update-password TS: bare `Error` -> Nest exceptions (400/404), single
   `findById` in the username TS, stale "CreateUserDto" comments fixed.
6. Jest specs for all three TSs + the service register gate, in house style.

Plus (small, load-bearing):

- New `UserResponseProjection` domain type; all three TS return types and the service's
  `updateUsername` signature move to it (wire-compatible — see D3).
- `users.module.ts`: register the new TS provider.
- `users/AGENTS.md`: add `RegisterUserTransactionScript` to the Transaction Scripts list.

**OUT (explicit):**

- **No deletion of `findByUsername` / `findById` / `updateEmail`** (user decision; further analysis pending).
- **Step 6b deferred:** no `RegisterUserAction`/`GetProfileAction`, no DTO move to
  `app/dtos/requests/`, no deletion of `app/controllers/`, no `PATCH`->`PUT` doc fix in the module
  AGENTS.md. The legacy controller stays as-is except for the one-line command build in `register`.
- No endpoint/route/method changes. No wire-format changes. No DB schema changes (no migrations).
- No change to `updateEmail`, `UserAggregator`, or auth module behavior.

## Proposed changes

### New files

**N1. `domain/transaction-scripts/register-user-TS/register-user.command.ts`**

```typescript
export type RegisterUserCommand = {
  username: string;
  password: string;
};
```

(Mirrors `update-username.command.ts` — plain type, no `user` field: registration is
unauthenticated.)

**N2. `domain/transaction-scripts/register-user-TS/register-user.transaction.script.ts`**

`RegisterUserTransactionScript`, injects `UserRepository`, `async apply(command:
RegisterUserCommand): Promise<UserResponseProjection>`:

1. `findByUsername(command.username)` -> if exists, `throw new ConflictException('Username already exists')`.
2. `const hashedPassword = await bcrypt.hash(command.password, 10)` (rounds stay 10 — D5).
3. `const savedUser = await this.userRepository.create({ username, password: hashedPassword })`,
   wrapped so a unique-constraint race (concurrent register of the same username ->
   `QueryFailedError`) maps to `ConflictException('Username already exists')` instead of 500.
4. Return a `UserResponseProjection` built from `savedUser` minus `password`
   (`{ id, username, email, createdAt, updatedAt }`).

All current `createUser` logic moves here; nothing is added to the behavior except the
race-condition mapping and the exception-consistent conflict.

**N3. `domain/transaction-scripts/user-response.projection.ts`**

```typescript
export type UserResponseProjection = {
  id: number;
  username: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
};
```

Placed at the `domain/transaction-scripts/` level because three TSs consume it — colocation
follows the only projection precedent in the repo (`tags/domain/transaction-scripts/
get-tags-by-user-id.projection.ts`). Shape is exactly today's `Omit<User, 'password'>`
serialization: `email` is optional and absent from the register/update responses in practice
(undefined keys are omitted by JSON), and the frontend `UserResponse` DTO
(`frontend/src/api/dtos/users.dtos.ts`) is a subset of this. **Wire-compatible.**

### Modified files

**M1. `domain/users.service.ts`**

- Constructor: add `RegisterUserTransactionScript` (6 dependencies total; `UserRepository`
  **remains** — see D1).
- `register(command: RegisterUserCommand, context: DisabledRegistrationContext):
  Promise<UserResponseProjection>` — gate logic byte-for-byte unchanged (NODE_ENV default,
  `configService.get('ALLOW_REGISTRATION')`, `ForbiddenException`,
  `securityEventAggregator.logDisabledRegistrationAttempt(context)`), then
  `return this.registerUserTransactionScript.apply(command)`.
- **Delete `createUser`** — its logic now lives in the TS (OQ2; only `register` called it, and
  nothing outside the module calls it).
- Delete `import { RegisterUserRequestDto }` (the domain -> application inversion is gone).
- `updateUsername` return type -> `UserResponseProjection`.
- `findByUsername`, `findById`, `updateEmail`, `updatePassword`: **untouched**.

**M2. `app/controllers/users.controller.ts`** (register endpoint only)

- `register(@Body() registerUserRequestDto, @Req() req)`: build
  `const command: RegisterUserCommand = { username: dto.username, password: dto.password }` and
  call `this.usersService.register(command, { ip, userAgent })`. The DTO stays on the endpoint
  for class-validator (that is where it belongs).
- `getProfile`: untouched.

**M3. `domain/transaction-scripts/update-username-TS/update-username.transaction.script.ts`**

- `throw new Error('Username must be between 4 and 20 characters')` -> `BadRequestException`.
- Both `throw new Error('User not found')` -> `NotFoundException`.
- `throw new Error('New username must be different from current username')` -> `BadRequestException`.
- Collapse the two `findById(userId)` calls (lines 44, 61) into one: the fetched entity includes
  `password` (the repository returns the full `User`), so it serves both the username comparison
  and `bcrypt.compare`. **Check order preserved exactly**: not-found -> same-as-current ->
  taken-by-other -> password (tests assert this priority).
- Return type -> `UserResponseProjection`.
- Stale comment "matching CreateUserDto" -> "matching RegisterUserRequestDto".

**M4. `domain/transaction-scripts/update-password-TS/update-password.transaction.script.ts`**

- `throw new Error('Password must be between 6 and 50 characters')` -> `BadRequestException`.
- `throw new Error('User not found')` -> `NotFoundException`.
- `throw new Error('New password must be different from current password')` -> `BadRequestException`.
- Stale comment "matching CreateUserDto" -> "matching RegisterUserRequestDto".
- Return type stays `Promise<void>`; behavior otherwise unchanged.

**M5. `users.module.ts`**

- `providers`: add `RegisterUserTransactionScript`.

**M6. `users/AGENTS.md`**

- Transaction Scripts list: add `RegisterUserTransactionScript`. (One line. The other doc
  drifts — service path, `app/dtos/`, PATCH-vs-PUT — are 6b follow-ups, not touched here.)

### New test files (house style)

House test style (verified against
`time-tracks/domain/transaction-scripts/__specs__/create-time-track.transaction.script.spec.ts`):
SUT named `target`, repository mocked inline (`useValue: { method: jest.fn() }`),
`generateRandomNumbers` from `src/shared-kernel/test-utils`, `// Arrange / Act / Assert` comments.
(Note: the `createApplyMock` helper named in `backend/AGENTS.md` does **not exist in this repo** —
do not use it; D6.)

- **T1. `domain/transaction-scripts/register-user-TS/__specs__/register-user.transaction.script.spec.ts`**
  - happy path: hashes password (result has no `password` key), returns projection, `create`
    called with `{ username, password: <hash> }`.
  - existing username -> `ConflictException`.
  - `create` rejects with `QueryFailedError` (unique constraint) -> `ConflictException`.
- **T2. `domain/transaction-scripts/update-username-TS/__specs__/update-username.transaction.script.spec.ts`**
  - happy path: `findById` called **once** with `userId`, `update` called with trimmed username,
    returns projection.
  - `user.userId !== command.userId` -> `UnauthorizedException` (401).
  - username too short / too long -> `BadRequestException` (400).
  - user not found -> `NotFoundException` (404).
  - new username === current -> `BadRequestException` (400).
  - username taken by another user -> `ConflictException` (409).
  - wrong current password -> `UnauthorizedException` (401).
- **T3. `domain/transaction-scripts/update-password-TS/__specs__/update-password.transaction.script.spec.ts`**
  - happy path: verifies current, rejects same password, `update` called with new hash.
  - not own account -> 401; length violation -> 400; user not found -> 404;
    wrong current password -> 401; new === current -> 400.
- **T4. `domain/__specs__/users.service.spec.ts`**
  - registration disabled in production (NODE_ENV=production, no env override) -> 403,
    `securityEventAggregator.logDisabledRegistrationAttempt` called with the context, TS **not**
    called.
  - `ALLOW_REGISTRATION=false` explicit -> 403 + event.
  - `ALLOW_REGISTRATION=true` -> delegates to TS with the exact command, event **not** logged.
  - TS rejections propagate.

  bcrypt: use the real library in specs (no mock — 10 rounds is fast enough; if runtimes prove
  slow, `jest.spyOn(bcrypt, ...)` is the fallback, not a plan change).

## Decisions (locked, with rationale)

- **D1. Pass-throughs stay.** `findByUsername`/`findById`/`updateEmail` remain on `UsersService`;
  `UserRepository` stays in its constructor. User decision 2026-08-23 pending further analysis.
  (Factual note recorded: none of the three is reachable via HTTP — no endpoint wraps them — so
  keeping them is zero-risk, zero-API-surface.)
- **D2. No action/controller migration this pass.** 6b is a separate future spec.
- **D3. One projection, all three TSs.** Introducing `UserResponseProjection` only for the new TS
  while siblings keep returning `Omit<User, 'password'>` would be inconsistent. Switching all
  three is wire-identical (same JSON), so the cost is near-zero. If the user objects, fallback is
  "projection only on the new TS" — recorded as the reversible alternative.
- **D4. Exception mapping.** validation -> `BadRequestException` (400); missing user ->
  `NotFoundException` (404); conflict -> `ConflictException` (409); auth -> `UnauthorizedException`
  (401). Matches what the two swagger files already document (they already advertise 400/401/409 —
  the code just wasn't honoring it).
- **D5. bcrypt rounds stay 10** (parity with existing call sites; not a refactor concern).
- **D6. Test style follows the repo's actual conventions**, not the `createApplyMock` convention
  in `backend/AGENTS.md` — that helper does not exist in this repo. (The AGENTS.md drift is noted
  for a future docs pass; not fixed here.)

## Open questions

**OQ1. Email constraint on username change.** Register enforces `@IsEmail()` on username;
update-username does not. Should `UpdateUsernameTransactionScript` also enforce email format?
_Default: No — that's a behavior/product change outside this refactor; record as a follow-up._

**OQ2. Delete `UsersService.createUser`?** Its logic moves into the new TS; `register` was its
only caller and nothing outside the module calls it. The three pass-throughs the user wants kept
are untouched by this. _Default: delete (absorb into TS)._

**OQ3. Scope confirmation — the "skip 6" ambiguity.** The request read "do 1-6, don't do step 3 …
we can do 1-6 (skip 6)". This spec is written as **1, 2, 4, 5, 6 in scope; only 3 excluded**
(i.e. tests ARE included). If step 6 (tests) was actually meant to be skipped, say so and T1–T4
drop — but note that would leave the new TS untested against the repo's own 80% rule.
_Default: tests in scope._

## Edge cases

- **Concurrent duplicate registration:** two requests with the same username pass the
  `findByUsername` check simultaneously; the second `create` hits the entity's `unique` constraint.
  Handled: `QueryFailedError` -> `ConflictException` (409). Today this is an unhandled 500.
- **Registration disabled:** 403 + security event with `{ ip, userAgent }` — unchanged.
- **`ALLOW_REGISTRATION` unset:** NODE_ENV=production defaults to disabled; anything else
  defaults to enabled — unchanged.
- **Register response:** 201 with `{ id, username, createdAt, updatedAt }` — `email` undefined and
  omitted from JSON — wire-identical to today.
- **Username TS single-fetch:** the one fetched entity includes `password` (needed for
  `bcrypt.compare`) — no behavior change; check order preserved (see M3).
- **No DB schema change** — no migrations generated or run.

## Verification (repo gates)

From `backend/`:

1. `npm run test` — new specs + existing suite green.
2. `npm run test:architecture` — depcruise; the removed domain->application import must not break
   anything and no new violations may appear.
3. `npm run test:fitness` — naming/layer fitness checks (command/projection names must pass).
4. `npm run lint:check` and `npm run format:check`.
5. `npm run build`.

Manual spot-check (optional): `POST /users/register` returns 201 with the same JSON shape;
`PUT /users/username` with a 3-char username now returns 400 (was 500).

## Follow-ups (explicitly out of scope, recorded for the next spec)

1. **6b:** convert register + profile to Actions (`RegisterUserAction`, `GetProfileAction`),
   move `RegisterUserRequestDto` to `app/dtos/requests/`, delete `app/controllers/`, fix the
   module AGENTS.md (PATCH->PUT, service path, `app/dtos/` block).
2. Delete `findByUsername`/`findById`/`updateEmail` once the user's frontend analysis concludes.
3. OQ1 answer (email constraint on username change) — product decision.
4. Move service to `domain/services/users-service/` per convention (pure file move, optional).
5. Fix `backend/AGENTS.md` test-convention drift (`createApplyMock` vs. the repo's actual inline
   mock style).
