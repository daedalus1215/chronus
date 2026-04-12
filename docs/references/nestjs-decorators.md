# NestJS decorators -- quick reference

Curated for decorators actually used in this project.

## Class decorators

| Decorator | Import | Purpose |
|-----------|--------|---------|
| `@Module({ imports, controllers, providers, exports })` | `@nestjs/common` | Define a feature module |
| `@Controller('path')` | `@nestjs/common` | Register a controller with a route prefix |
| `@Injectable()` | `@nestjs/common` | Mark a class as a provider (service, repo, etc.) |

## Route decorators

| Decorator | HTTP method | Example |
|-----------|-------------|---------|
| `@Get('path?')` | GET | `@Get(':id')` |
| `@Post('path?')` | POST | `@Post()` |
| `@Put('path?')` | PUT | `@Put(':id')` |
| `@Patch('path?')` | PATCH | `@Patch(':id')` |
| `@Delete('path?')` | DELETE | `@Delete(':id')` |

## Parameter decorators

| Decorator | Extracts | Example |
|-----------|----------|---------|
| `@Body()` | Request body | `@Body() dto: CreateDto` |
| `@Param('name')` | Route parameter | `@Param('id') id: string` |
| `@Query('name?')` | Query string | `@Query('page') page: string` |

## Guards and auth (project-specific)

| Decorator | Purpose |
|-----------|---------|
| `@UseGuards(JwtAuthGuard)` | Require JWT authentication |
| `@GetAuthUser()` | Extract authenticated user from request (returns `AuthUser`) |
| `@ProtectedAction(SwaggerConfig)` | Custom decorator combining Swagger docs + auth metadata |

## Swagger decorators

| Decorator | Purpose |
|-----------|---------|
| `@ApiTags('Tag Name')` | Group endpoints in Swagger UI |
| `@ApiBearerAuth()` | Mark endpoint as requiring Bearer token |
| `@ApiOperation({ summary })` | Describe the endpoint |
| `@ApiResponse({ status, description, type? })` | Document a response |

## class-validator decorators (for DTOs)

| Decorator | Validates |
|-----------|-----------|
| `@IsString()` | String type |
| `@IsNumber()` | Number type |
| `@IsInt()` | Integer |
| `@IsOptional()` | Field is optional |
| `@IsNotEmpty()` | Not empty string/array |
| `@IsEmail()` | Valid email format |
| `@IsDateString()` | ISO date string |
| `@Min(n)` / `@Max(n)` | Numeric bounds |
| `@MinLength(n)` / `@MaxLength(n)` | String length bounds |
| `@IsEnum(MyEnum)` | Value from an enum |
| `@IsPositive()` | Positive number |
| `@IsArray()` | Array type |
| `@ValidateNested()` | Validate nested objects (use with `@Type(() => ChildDto)`) |

## TypeORM integration

| Decorator/Function | Import | Purpose |
|--------------------|--------|---------|
| `@InjectRepository(Entity)` | `@nestjs/typeorm` | Inject TypeORM repo into a provider |
| `TypeOrmModule.forFeature([Entity])` | `@nestjs/typeorm` | Register entities for a module |
| `TypeOrmModule.forRootAsync({...})` | `@nestjs/typeorm` | Configure DB connection at app level |

## Config and environment

| Pattern | Purpose |
|---------|---------|
| `ConfigModule.forRoot({ isGlobal: true })` | Load `.env` globally |
| `@Inject(ConfigService)` / constructor injection | Read env vars via `configService.get('KEY')` |

## Event system (used in this project)

| Pattern | Purpose |
|---------|---------|
| `EventEmitterModule.forRoot()` | Enable event emitter |
| `this.eventEmitter.emitAsync(EVENT_NAME, payload)` | Emit cross-domain events |
| `@OnEvent(EVENT_NAME)` | Listen for events |
