# Validator Pattern

## Purpose

A **Validator** asserts a domain invariant or precondition and throws if it is violated. Validators return `void` — they guard state transitions rather than producing or transforming data.

Validators are the answer to: *"Where does a precondition check live when it is complex enough to warrant its own class?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Assert a precondition / business invariant that throws on violation | **Validator** |
| Transform data between representations | Converter |
| Assemble an object from converters and repository lookups | Assembler |
| Define a reusable ordering strategy | Comparator |

Use a Validator when:

- A **conditional check** must pass before a Transaction Script (or other consumer) can proceed
- The check is **important enough to test in isolation** — extracting it makes the consuming class simpler and the invariant independently verifiable
- The check may need **repository access** or other dependencies that would clutter the consumer

---

## Key Characteristics

1. **Asserts, does not produce** — returns `void` (or `Promise<void>`); never returns data.
2. **Throws on violation** — uses a domain or framework exception to signal failure.
3. **Single `apply` method** — consistent with every other domain pattern.
4. **`@Injectable()`** — participates in NestJS DI like all other patterns.
5. **Level-agnostic** — a Validator's position in the hierarchy is determined by its dependencies, not by a fixed slot:

| Dependencies needed | Hierarchy level |
| ------------------- | --------------- |
| Nothing | Same level as Converters / Comparators |
| Repositories (shallow) | Same level as Assemblers |
| Assemblers / Converters | Same level as Mappers |

6. **Co-located with consumer** — lives next to the Transaction Script (or other pattern) that calls it.

---

## Anatomy

### Validator that needs a Repository (Assembler level)

```typescript
@Injectable()
export class NoSelfLockoutValidator {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async apply(roleId: number, allowedCells: AllowedCell[]): Promise<void> {
    const roleHasManagerAccess =
      await this.permissionRepository.roleHasPermission(
        roleId,
        RESOURCE_KEY_TYPES.ATLAS_PERMISSIONS_MANAGER,
        'read',
      );
    if (!roleHasManagerAccess) {
      return;
    }
    const wouldRetainManagerRead = allowedCells.some(
      (cell) =>
        cell.resourceKey === RESOURCE_KEY_TYPES.ATLAS_PERMISSIONS_MANAGER &&
        cell.action === 'read',
    );
    const wouldRetainManagerUpdate = allowedCells.some(
      (cell) =>
        cell.resourceKey === RESOURCE_KEY_TYPES.ATLAS_PERMISSIONS_MANAGER &&
        cell.action === 'update',
    );
    if (!wouldRetainManagerRead || !wouldRetainManagerUpdate) {
      throw new ForbiddenException(
        'You cannot remove your own access to the Atlas Permissions Manager.',
      );
    }
  }
}
```

### Pure Validator (Converter level — no dependencies)

```typescript
@Injectable()
export class NonEmptyFileListValidator {
  apply(files: FileAttachment[]): void {
    if (files.length === 0) {
      throw new BadRequestException('At least one file is required.');
    }
  }
}
```

### Consumption in a Transaction Script

```typescript
@Injectable()
export class UpdatePermissionsMatrixTS {
  constructor(
    private readonly permissionRepository: PermissionRepository,
    private readonly noSelfLockoutValidator: NoSelfLockoutValidator,
  ) {}

  async apply(command: UpdatePermissionsMatrixCommand): Promise<void> {
    const { roleId, allowedCells, requestingUser } = command;
    await this.noSelfLockoutValidator.apply(roleId, allowedCells);
    const userIdentity =
      requestingUser.identity?.userId ?? requestingUser.username;
    await this.permissionRepository.replaceRolePermissions({
      roleId,
      allowedCells,
      userIdentity,
    });
  }
}
```

---

## Hierarchy Position

Validators are **level-agnostic**. Their position is determined by what they inject:

```
Domain Services
  ↓
Aggregators (via ports)
  ↓
Transaction Scripts
  ↓
Mappers              ← Validator here if it needs Assemblers/Converters
  ↓
Assemblers           ← Validator here if it needs Repositories
  ↓
Converters / Comparators  ← Validator here if it needs nothing
  ↓
Repositories (shallow, data only)
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Whatever the hierarchy level it occupies allows |
| **Cannot inject** | Patterns above the level it occupies |
| **Injected by** | The pattern one level above (typically a Transaction Script) |
| **Same-level rule** | Validators must not inject other Validators at the same level |
| **Blackbox principle** | Applies as usual — if a Validator uses a Converter, the TS should not also inject that Converter directly |

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Purpose}Validator` | `NoSelfLockoutValidator`, `NonEmptyFileListValidator` |
| File name | `{purpose}.validator.ts` | `no-self-lockout.validator.ts` |
| Folder | Co-located with the consuming Transaction Script | `{ts-name}/{purpose}.validator.ts` |
| Spec file | `{purpose}.validator.spec.ts` in `__specs__/` | adjacent `__specs__/` folder |

---

## Validator vs Guard

Validators and NestJS Guards both enforce rules, but they differ in what they check:

| Aspect | Guard | Validator |
| ------ | ----- | --------- |
| **Lives in** | Application layer | Domain layer |
| **Answers** | "Can this user call this endpoint?" | "Would this specific mutation violate a business rule?" |
| **Inputs** | Request metadata, user identity, role | Request payload, current domain state |
| **Runs** | Before the handler (NestJS pipeline) | Inside the Transaction Script (domain logic) |
| **Depends on** | User's permissions matrix | Payload content + database state |

A single endpoint may use **both**: a Guard to authorize the caller, then a Validator inside the TS to enforce domain invariants on the payload.

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Validator returning data | Validators assert; they do not produce output | Use a Converter, Assembler, or Mapper for data transformation |
| Inlining the check as a private method in a Transaction Script | Harder to test in isolation; clutters the TS | Extract to a Validator class |
| Validator injecting a pattern above its level | Breaks the dependency hierarchy | Move the Validator up a level, or restructure so it doesn't need the higher dependency |
| Using a Guard for payload-dependent business rules | Guards run pre-handler and check identity, not domain invariants | Use a Validator inside the TS for payload + state checks |
| Validator injecting another Validator | Same-level injection violation | If two invariants must be checked together, the consuming pattern orchestrates both |

---

## Origin

Extracted from the `UpdatePermissionsMatrixTS` in the Chronus auth module, where a private `assertNoSelfLockout` method checked whether a role update would remove the caller's own access to the Permissions Manager. The check was promoted to a standalone `@Injectable()` class (`NoSelfLockoutValidator`) to follow single-responsibility and enable isolated testing.
