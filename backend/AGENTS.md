# Backend — NestJS operational hints

## Commands

```bash
cd backend
npm run dev               # dev server (runs migrations first)
npm run dev:watch          # dev server with hot reload
npm run test               # Jest unit tests
npm run test:watch         # Jest in watch mode
npm run test:cov           # Jest with coverage report
npm run test:integration   # integration tests
npm run test:e2e           # end-to-end tests
npm run test:architecture  # dependency-cruiser architecture checks
npm run test:fitness       # fitness function checks (naming, etc.)
npm run migration:generate # generate a TypeORM migration
npm run migration:run      # run pending migrations
npm run migration:revert   # revert last migration
npm run build              # production build
npm run lint               # eslint --fix
npm run lint:check         # eslint check only (no fix)
npm run format             # prettier --write
npm run format:check       # prettier --check
```

## Module wiring

Every domain module is registered in `src/app.module.ts` (imports array). A feature module wires its own controllers, services, transaction scripts, and repositories:

```typescript
// src/{module}/{module}.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([MyEntity])],
  controllers: [CreateMyThingAction, GetMyThingAction],
  providers: [MyService, CreateMyThingTransactionScript, MyRepository],
  exports: [MyAggregator],   // only if other modules need cross-domain access
})
export class MyModule {}
```

### Registry pattern (when modules grow)

When a module has 3+ providers of the same type, extract them into registries instead of inlining in `@Module()`:

```
{module}/registries/
  action.registry.ts               // spreads into controllers: []
  transaction-script.registry.ts   // spreads into providers: []
  repository.registry.ts           // spreads into providers: []
```

```typescript
// registries/action.registry.ts
export const actionRegistry = [
  FetchCaseDetailByIdAction,
  SearchCasesAction,
];

// {module}.module.ts
@Module({
  controllers: [...actionRegistry],
  providers: [MyService, ...transactionScriptRegistry, ...repositoryRegistry],
})
export class MyModule {}
```

Registries are plain arrays of class references -- no logic, no decorators. See `docs/patterns/registry-pattern.md` for the full spec.

## Folder naming

Actions live under `apps/actions/` (most modules) or `app/actions/` (some older modules like `tags`, `users`, `auth`, `folders`). Both are valid; match the existing convention within that module.

Infrastructure is `infra/` in most modules, `infrastructure/` in others (e.g. `audio`). Match the existing convention.

## Pattern inventory (what's in this codebase)

| Pattern | In use? | Count | Example module |
|---------|---------|-------|----------------|
| Action | Yes | ~63 | time-tracks, notes, tags, check-items, audio, folders, note-transfer, users |
| Domain Service | Yes | 9 | time-tracks, notes, tags, audio, check-items, note-transfer, users, auth |
| Transaction Script | Yes | ~45 | all domain modules |
| Repository | Yes | 9 | all modules with persistence |
| Entity | Yes | 10 | all modules with persistence |
| Converter | Yes | 2 | notes (update-note-params-to-entity), time-tracks (update-time-track-note) |
| Aggregator | Yes | 7 | notes, tags, time-tracks, audio, check-items, security-events, users |
| Port | Yes | 7 | note-transfer (6), audio (1) |
| Responder | Yes | 5 | notes (3), time-tracks (1), audio (1) |
| Listener | Yes | 4 | notes (2), check-items (1), tags (1) -- via EventEmitter2 |
| Projection | Yes | 1 | tags (get-tags-by-user-id.projection.ts) |
| Assembler | Not yet | 0 | -- |
| Mapper | Not yet | 0 | -- |
| Validator | Not yet | 0 | -- |
| Comparator | Not yet | 0 | -- |
| Registry | Not yet | 0 | -- |
| Runner | Not yet | 0 | -- |
| Dispatcher | Not yet | 0 | -- |
| Webhook | Not yet | 0 | -- |

> The Converter pattern IS in use (notes, time-tracks). The architecture.mdc cursor rule saying "Converters are not currently used" is stale.

## Pattern reference docs

Full pattern documentation with dependency rules, anti-patterns, naming conventions, and worked examples is in `docs/patterns/`. Start with:

- `docs/patterns/design-philosophy.md` -- the three paradigms (Functional, OOP, Structured) and four design goals (Modular, Scalable, Clarity, Maintainability)
- `docs/patterns/dependency-hierarchy.md` -- master dependency graph, layer boundary rules, full injection matrix
- `docs/patterns/README.md` -- index of all 24 pattern pages

Key pattern docs by layer:

| Layer | Pattern | Doc path |
|-------|---------|----------|
| Application | Action | `docs/patterns/application/action-pattern.md` |
| Application | DTO | `docs/patterns/application/dto-pattern.md` |
| Application | Listener | `docs/patterns/application/listener-pattern.md` |
| Application | Webhook | `docs/patterns/application/webhook-pattern.md` |
| Application | Testing | `docs/patterns/application/testing-conventions.md` |
| Domain | Domain Service | `docs/patterns/domain/domain-service-pattern.md` |
| Domain | Transaction Script | `docs/patterns/domain/transaction-script-pattern.md` |
| Domain | Aggregator | `docs/patterns/domain/aggregator-pattern.md` |
| Domain | Mapper | `docs/patterns/domain/mapper-pattern.md` |
| Domain | Assembler | `docs/patterns/domain/assembler-pattern.md` |
| Domain | Converter | `docs/patterns/domain/converter-pattern.md` |
| Domain | Comparator | `docs/patterns/domain/comparator-pattern.md` |
| Domain | Validator | `docs/patterns/domain/validator-pattern.md` |
| Domain | Projection | `docs/patterns/domain/projection-pattern.md` |
| Domain | Entity | `docs/patterns/domain/entity-pattern.md` |
| Domain | Runner | `docs/patterns/domain/runner-pattern.md` |
| Infrastructure | Repository | `docs/patterns/infrastructure/repository-pattern.md` |
| Infrastructure | Dispatcher | `docs/patterns/infrastructure/dispatcher-pattern.md` |
| Infrastructure | RemoteCaller | `docs/patterns/infrastructure/remote-caller-pattern.md` |
| Infrastructure | Messaging | `docs/patterns/infrastructure/messaging-pattern.md` |
| Cross-cutting | Registry | `docs/patterns/registry-pattern.md` |
| Cross-cutting | Outbox flows | `docs/patterns/outbox-emission-flows.md` |

## Naming conventions summary

| Artifact | Convention | Example |
|----------|-----------|---------|
| Action class (GET) | `Fetch{Resource}Action` | `FetchTimeTracksByDateRangeAction` |
| Action class (POST) | `{Verb}{Resource}Action` or `{Verb}{Resource}` | `CreateTimeTrackAction`, `CopyFile` |
| Action file | `{action-name}.action.ts` | `fetch-time-tracks-by-date-range.action.ts` |
| Swagger file | `{action-name}.swagger.ts` | `fetch-time-tracks-by-date-range.swagger.ts` |
| Responder file | `{action-name}.responder.ts` | `time-track-with-note-names.responder.ts` |
| Service class | `{Module}Service` | `TimeTrackService`, `NoteService` |
| Service file | `{module-name}.service.ts` | `time-track.service.ts` |
| TS class | `{Action}{Entity}TransactionScript` | `CreateTimeTrackTransactionScript` |
| TS file | `{action-name}.transaction.script.ts` | `create-time-track.transaction.script.ts` |
| TS folder | `{transaction-name}-TS/` or `{transaction-name}/` | `create-time-track-TS/` |
| Converter class | `{Source}To{Target}Converter` or `{Purpose}Converter` | `UpdateNoteParamsToEntityConverter`, `UpdateTimeTrackPayloadConverter` |
| Converter file | `{purpose}.converter.ts` | `update-time-track-note.converter.ts` |
| Aggregator class | `{Domain}Aggregator` | `NoteAggregator`, `TimeTracksAggregator` |
| Aggregator file | `{domain}.aggregator.ts` | `note.aggregator.ts` |
| Repository class | `{Entity}Repository` | `TimeTrackRepository`, `NoteAudioRepository` |
| Repository file | `{repository-name}.repository.ts` | `time-track.repository.ts` |
| Entity class | `{EntityName}` (PascalCase, singular) | `TimeTrack`, `Note`, `Tag` |
| Entity file | `{entity-name}.entity.ts` | `time-track.entity.ts` |
| Port token | `{PURPOSE}_PORT` (Symbol) | `TIME_TRACK_WRITER_PORT`, `NOTE_OWNERSHIP_PORT` |
| Port file | `{purpose}.port.ts` | `time-track-writer.port.ts` |
| Projection type | `{Entity}Projection` | `TagsByUserIdProjection` |
| Projection file | `{purpose}.projection.ts` | `get-tags-by-user-id.projection.ts` |
| Listener class | `{EventName}Listener` | `GetNoteDetailsListener`, `DeleteCheckItemsByNoteListener` |
| Listener file | `{event-name}.listener.ts` | `get-note-details.listener.ts` |
| Request DTO | `{Action}{Entity}DTO` or `{Action}{Entity}Dto` | `CreateTimeTrackDto`, `UpdateCheckItemDTO` |
| Response DTO | `{Entity}ResponseDto` | `TimeTrackResponseDto`, `NoteResponseDto` |
| DTO file | `{purpose}.dto.ts` | `create-time-track.dto.ts`, `time-track.response.dto.ts` |
| Spec file | `{name}.spec.ts` in `__specs__/` | `create-time-track.transaction.script.spec.ts` |

### Critical: no "Dto" in domain layer

The domain layer must NOT use "Dto" in type names, class names, or file names. Domain inputs are **Commands** or **Params**; domain outputs are **Projections**. This is enforced by fitness functions.

| Layer | Input naming | Output naming |
|-------|-------------|---------------|
| Application | `*DTO` / `*Dto` | `*ResponseDTO` / `*ResponseDto` |
| Domain | `*Command`, `*Params` | `*Projection` |

> NOTE: The existing codebase has `TimeTrackResponseDto` used as a TS return type in the domain layer. This is a known violation -- new code should use Projections for domain output and map to DTOs in the Action/Responder layer.

## Testing conventions

### File and folder

Tests live in `__specs__/` folders adjacent to the source file they test.

```
{module}/domain/transaction-scripts/create-time-track-TS/
  create-time-track.transaction.script.ts
  __specs__/
    create-time-track.transaction.script.spec.ts
```

### Naming

| Role | Naming | Example |
|------|--------|---------|
| System under test | `target` | `let target: CreateTimeTrackTransactionScript` |
| Mocked dependency | `{dependency}Mock` | `timeTrackRepositoryMock` |
| Spy on a method | `{method}Spy` | `findByIdSpy` |

### Mock helpers

Always use the standard mock helpers from `src/test-utils/test-utils`:

```typescript
// For classes with an apply method (TS, Aggregators, Mappers, Repositories)
const timeTrackRepositoryMock = createApplyMock<TimeTrackRepository>();

// For the Logger provider
{ provide: Logger, useValue: createMockLogger() }
```

Do NOT inline mock objects like `{ apply: jest.fn() } as unknown as jest.Mocked<T>`.

### Test structure

Use `given / when / then` describe labels and `Arrange / Act / Assert` comments:

```typescript
describe('given: CreateTimeTrackTransactionScript', () => {
  let target: CreateTimeTrackTransactionScript;
  let timeTrackRepositoryMock: jest.Mocked<TimeTrackRepository>;

  beforeEach(async () => {
    // Arrange
    timeTrackRepositoryMock = createApplyMock<TimeTrackRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTimeTrackTransactionScript,
        { provide: TimeTrackRepository, useValue: timeTrackRepositoryMock },
      ],
    }).compile();

    target = module.get<CreateTimeTrackTransactionScript>(CreateTimeTrackTransactionScript);
  });

  describe('when: creating a time track', () => {
    test('then: should persist and return the result', async () => {
      // Arrange
      const command = { date: '2026-01-01', startTime: '09:00', durationMinutes: 60, noteId: 1, userId: 1 };
      timeTrackRepositoryMock.apply.mockResolvedValue({ id: 1, ...command });

      // Act
      const result = await target.apply(command);

      // Assert
      expect(timeTrackRepositoryMock.apply).toHaveBeenNthCalledWith(1, command);
      expect(result.id).toBe(1);
    });
  });
});
```

### Integration tests

`*.integration.spec.ts` files run against a real Postgres (excluded from `npm run test`,
picked up by `npm run test:integration` via `test/jest-integration.json`).

```bash
docker compose -f ../docker-compose.test.yml up -d   # from backend/
npm run test:integration
```

Conventions:

- One shared DB (`chronus_test` on port 5433); the config runs a single worker.
- Bootstrap the data source with `createIntegrationDataSource()` from
  `src/shared-kernel/integration-test-data-source.ts` — it runs the real migration
  chain (`migrationsRun`, no `synchronize`), so the schema under test is the
  production schema.
- Wipe state with `truncateIntegrationTables(dataSource)` in `beforeEach` so tests
  are isolated and identities are deterministic.
- The SUT is constructed directly (`new MyRepo(ds.getRepository(X), ...)`) — no Nest
  module needed for repository-level integration tests.

### Coverage

Minimum 80% coverage for all production code. All production classes (Transaction Scripts, Repositories, Aggregators, Domain Services, Converters) require tests.

### Anti-patterns

| Anti-pattern | Correct approach |
|-------------|-----------------|
| Inline mock objects (`{ apply: jest.fn() } as unknown as ...`) | Use `createApplyMock<T>()` |
| Naming the SUT `service`, `ts`, `aggregator` | Always use `target` |
| `toHaveBeenCalled()` without checking args | Use `toHaveBeenNthCalledWith(1, ...)` |
| Skipping error path tests | Test both happy path and error propagation |

## Worked example: creating a POST endpoint

Below is the **complete file set** for a `POST /time-tracks` endpoint. Use this as a template.

### 1. Request DTO (`apps/dtos/requests/create-time-track.dto.ts`)

```typescript
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateTimeTrackDto {
  @IsString()
  date: string;

  @IsString()
  startTime: string;

  @IsNumber()
  @Min(1)
  @Max(1440)
  durationMinutes: number;

  @IsNumber()
  noteId: number;

  @IsString()
  @IsOptional()
  note: string;
}
```

### 2. Action (`apps/actions/create-time-track-action/create-time-track.action.ts`)

```typescript
import { Post, Body, Controller, UseGuards } from '@nestjs/common';
import { TimeTrackService } from '../../../domain/services/time-track-service/time-track.service';
import { CreateTimeTrackSwagger } from './create-time-track.swagger';
import { ProtectedAction } from '../../../../shared-kernel/apps/decorators/protected-action.decorator';
import { AuthUser, GetAuthUser } from 'src/shared-kernel/apps/decorators/get-auth-user.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/shared-kernel/apps/guards/jwt-auth.guard';
import { CreateTimeTrackDto } from '../../dtos/requests/create-time-track.dto';

@Controller('time-tracks')
@UseGuards(JwtAuthGuard)
@ApiTags('Time Tracks')
@ApiBearerAuth()
export class CreateTimeTrackAction {
  constructor(private readonly timeTrackService: TimeTrackService) {}

  @Post()
  @ProtectedAction(CreateTimeTrackSwagger)
  async apply(@Body() dto: CreateTimeTrackDto, @GetAuthUser() user: AuthUser) {
    return this.timeTrackService.createTimeTrack({ ...dto, user });
  }
}
```

### 3. Swagger (`apps/actions/create-time-track-action/create-time-track.swagger.ts`)

```typescript
import { ProtectedActionOptions } from 'src/shared-kernel/apps/decorators/protected-action.decorator';
import { TimeTrack } from '../../../domain/entities/time-track-entity/time-track.entity';

export const CreateTimeTrackSwagger: ProtectedActionOptions = {
  tag: 'Time Tracks',
  summary: 'Create a new time track entry for a note',
  additionalResponses: [
    { status: 201, description: 'Time track entry created successfully.', type: TimeTrack },
    { status: 404, description: 'Note not found.' },
    { status: 400, description: 'Invalid time track data.' },
  ],
};
```

### 4. Service (`domain/services/time-track-service/time-track.service.ts`)

The service validates cross-domain concerns via an **Aggregator**, then delegates to the **Transaction Script**:

```typescript
async createTimeTrack(command: CreateTimeTrackCommand) {
  await this.noteAggregator.belongsToUser({
    noteId: command.noteId,
    user: { id: command.user.userId },
  });
  return this.createTimeTrackTS.apply(command);
}
```

### 5. Transaction Script (`domain/transaction-scripts/create-time-track.transaction.script.ts`)

```typescript
@Injectable()
export class CreateTimeTrackTransactionScript {
  constructor(private readonly timeTrackRepository: TimeTrackRepository) {}

  async apply(command: CreateTimeTrackCommand): Promise<TimeTrackResponseDto> {
    const timeTrack = await this.timeTrackRepository.create({
      ...command,
      userId: command.user.userId,
      date: command.date,
    });
    return new TimeTrackResponseDto(timeTrack);
  }
}
```

### 6. Repository (`infra/repositories/time-track.repository.ts`)

```typescript
@Injectable()
export class TimeTrackRepository {
  constructor(
    @InjectRepository(TimeTrack)
    private readonly repository: Repository<TimeTrack>,
  ) {}

  async create(timeTrack: Partial<TimeTrack>): Promise<TimeTrack> {
    const newTimeTrack = this.repository.create(timeTrack);
    return this.repository.save(newTimeTrack);
  }
}
```

### 7. Entity (`domain/entities/time-track-entity/time-track.entity.ts`)

```typescript
@Entity()
export class TimeTrack {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'note_id' })
  noteId: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'duration_minutes' })
  durationMinutes: number;
}
```

## Entity conventions

- Use `snake_case` for column names (`@Column({ name: 'user_id' })`)
- Use `PrimaryGeneratedColumn({ type: 'integer' })` for auto-increment IDs
- Timestamp columns use `CreateDateColumn` / `UpdateDateColumn` with `type: 'text'` (SQLite)
- Database is **SQLite** -- no Postgres-specific syntax
- Entities belong to their domain: `{module}/domain/entities/`
- Shared join entities (M:N) live in `shared-kernel/domain/entities/` and are anemic (no business logic)
- No cross-domain entity references via TypeORM relationships -- use Aggregators

## Design philosophy reference

The patterns in this codebase are not arbitrary. They synthesize three paradigms:

- **Functional** -- `const` over `let`, `map`/`filter` over loops, stateless Converters, immutable Commands/Params
- **OOP** -- every pattern is an `@Injectable()` class, SOLID principles govern injection rules
- **Structured** -- top-down hierarchy (Action -> Service -> TS -> Mapper -> Assembler -> Converter -> Repository), cohesion-based file placement

Four goals: Modular, Scalable, Clarity, Maintainability. See `docs/patterns/design-philosophy.md` for the full intellectual lineage.
