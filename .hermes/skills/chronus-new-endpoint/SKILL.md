---
name: chronus-new-endpoint
description: Step-by-step procedure for adding or changing an API endpoint in the NestJS backend.
---

# Add or change a backend API endpoint

## When to use

You are adding a new HTTP endpoint or modifying an existing one in the Chronus NestJS backend.

## Procedure

### Step 1: Create the request DTO

Location: `backend/src/{module}/apps/dtos/requests/{feature}.dto.ts`

Use `class-validator` decorators. One class per file.

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

### Step 2: Create the action (controller)

Location: `backend/src/{module}/apps/actions/{feature}-action/{feature}.action.ts`

Actions are thin -- validate input, call service, return result. Never call a Transaction Script directly.

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

### Step 3: Create the Swagger decorator

Location: next to the action file, `{feature}.swagger.ts`

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

### Step 4: Add or update the service method

Location: `backend/src/{module}/domain/services/{service-name}/{service-name}.service.ts`

The service validates cross-domain concerns (via Aggregators) then delegates to a Transaction Script.

```typescript
async createTimeTrack(command: CreateTimeTrackCommand) {
  await this.noteAggregator.belongsToUser({
    noteId: command.noteId,
    user: { id: command.user.userId },
  });
  return this.createTimeTrackTS.apply(command);
}
```

### Step 5: Create the Transaction Script

Location: `backend/src/{module}/domain/transaction-scripts/{feature}.transaction.script.ts`

All domain logic goes here. One use case per script.

```typescript
import { Injectable } from '@nestjs/common';
import { TimeTrackRepository } from 'src/time-tracks/infra/repositories/time-track.repository';
import { CreateTimeTrackCommand } from './create-time-track-TS/create-time-track.command';
import { TimeTrackResponseDto } from '../../apps/dtos/responses/time-track.response.dto';

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

### Step 6: Create or update the repository method

Location: `backend/src/{module}/infra/repositories/{entity}.repository.ts`

Repositories wrap TypeORM -- no business logic.

```typescript
async create(timeTrack: Partial<TimeTrack>): Promise<TimeTrack> {
  const newTimeTrack = this.repository.create(timeTrack);
  return this.repository.save(newTimeTrack);
}
```

### Step 7: Wire in the module

Location: `backend/src/{module}/{module}.module.ts`

Register the action in `controllers`, and the service, transaction script, and repository in `providers`. If this module exposes an aggregator for other modules, add it to `exports`.

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([TimeTrack])],
  controllers: [CreateTimeTrackAction],
  providers: [TimeTrackService, CreateTimeTrackTransactionScript, TimeTrackRepository],
  exports: [],
})
export class TimeTracksModule {}
```

### Step 8: Add tests

Create `__specs__/{feature}.transaction.script.spec.ts` next to the Transaction Script.

Name the SUT `target`. Follow Arrange-Act-Assert.

## Checklist

- [ ] Request DTO with class-validator decorators
- [ ] Action controller calling service only
- [ ] Swagger decorator next to action
- [ ] Service method with validation via Aggregator (if cross-domain)
- [ ] Transaction Script with domain logic
- [ ] Repository method (data access only)
- [ ] Module wiring (controllers, providers, exports)
- [ ] Tests in `__specs__/`
