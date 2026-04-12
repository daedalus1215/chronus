# TypeORM patterns -- quick reference

Curated for patterns used in this project (SQLite database).

## Entity decorators

```typescript
import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn, PrimaryColumn,
} from 'typeorm';

@Entity()  // or @Entity({ name: 'table_name' })
export class MyEntity {
  @PrimaryGeneratedColumn({ type: 'integer' })
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'text' })
  createdAt: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'text' })
  updatedAt: string;
}
```

### Composite primary keys (join tables)

```typescript
@Entity({ name: 'tag_notes' })
export class TagNote {
  @PrimaryColumn({ name: 'tag_id' })
  tagId: number;

  @PrimaryColumn({ name: 'note_id' })
  noteId: number;
}
```

## Repository pattern (project convention)

Repositories wrap the TypeORM `Repository<Entity>` with custom methods:

```typescript
@Injectable()
export class MyRepository {
  constructor(
    @InjectRepository(MyEntity)
    private readonly repository: Repository<MyEntity>,
  ) {}

  async findById(id: number): Promise<MyEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async create(data: Partial<MyEntity>): Promise<MyEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async update(id: number, data: Partial<MyEntity>): Promise<MyEntity> {
    await this.repository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
```

## Common query patterns

### Find with conditions

```typescript
await this.repository.find({
  where: { userId, noteId },
  order: { date: 'DESC', startTime: 'DESC' },
});
```

### Find with multiple OR conditions

```typescript
await this.repository.find({
  where: [
    { issuerUserId: userId },
    { debtorUserId: userId },
  ],
  order: { dueDate: 'DESC' },
});
```

### Query builder -- aggregation

```typescript
const result = await this.repository
  .createQueryBuilder('tt')
  .select('SUM(tt.durationMinutes)', 'total')
  .where('tt.userId = :userId', { userId })
  .andWhere('tt.noteId = :noteId', { noteId })
  .getRawOne();

return result?.total || 0;
```

### Query builder -- group by with multiple selects

```typescript
const rows = await this.repository
  .createQueryBuilder('tt')
  .select([
    'tt.noteId as noteId',
    'SUM(tt.durationMinutes) as totalTime',
    'COUNT(DISTINCT tt.date) as dateCount',
  ])
  .where('tt.userId = :userId', { userId })
  .groupBy('tt.noteId')
  .orderBy('totalTime', 'DESC')
  .getRawMany();
```

### Delete with compound condition

```typescript
const result = await this.repository.delete({ id, userId });
return result.affected > 0;
```

## SQLite-specific notes

- Use `type: 'text'` for timestamp columns (SQLite has no native timestamp)
- Use `type: 'integer'` for primary keys
- Date functions: `strftime('%Y', column)` for year extraction
- Use `BETWEEN :start AND :end` for date ranges
- No `ILIKE` -- use `LOWER(column) LIKE LOWER(:pattern)` for case-insensitive

## Migrations

```bash
npm run migration:generate    # auto-generate from entity changes
npm run migration:run         # apply pending migrations
```

TypeORM config in `app.module.ts` has `synchronize: false` -- always use migrations for schema changes.
