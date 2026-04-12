# Backend — NestJS operational hints

## Commands

```bash
cd backend
npm run start:dev          # dev server with hot reload
npm run test               # Jest unit tests
npm run test:watch         # Jest in watch mode
npm run migration:generate # generate a TypeORM migration
npm run build              # production build
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

## Folder naming

Actions live under `apps/actions/` (most modules) or `app/actions/` (some older modules like `tags`, `users`). Both are valid; match the existing convention within that module.

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
