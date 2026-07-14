---
title: Fitness Functions Implementation
status: draft
project: chronus-react-nestjs
location: specs/fitness-functions-implementation.md
created: 2026-07-13
tags: [architecture, quality-gates, automation, typeorm]
---

# Fitness Functions Implementation

## Context

The project currently has a `test:fitness` npm script in `backend/package.json` that references `rules/run-all-fitness-checks.ts`, but this file does not exist. This spec defines the implementation of fitness functions for the Chronus backend, following the pattern established in Callisto.

## Goal

Implement automated fitness functions that run as part of CI/CD to enforce architectural and naming conventions, preventing technical debt accumulation.

## Fitness Functions to Implement

### 1. Migration Naming Convention Check

**Purpose:** Enforce consistent TypeORM migration file naming conventions.

**Convention:**
- **Filename:** `{unix_timestamp}-{action}__{description}__{table_name}_table.ts`
- **Class:** `{Action}_{Description}_{TableName}Table{timestamp}`
- **Name:** `'{Action}_{Description}_{TableName}Table{timestamp}'`

**Rules:**
- Timestamp: 13-digit unix timestamp
- Action: `create` | `alter` | `seed` | `update` | `drop`
- Description: required for alter/update/drop, optional for create/seed
  - lowercase snake_case with hyphens allowed
- Table name: lowercase snake_case (embedded before `_table` suffix)
- Suffix: `_table` or `_tables`
- Extension: `.ts` only
- Class name: PascalCase conversion of filename segments joined by `_`
- Name property: must equal the class name as a string literal

**Exceptions:**
- Grandfather existing migrations that are already tracked in the database
- Maintain a `KNOWN_EXCEPTIONS` set for pre-existing violations

**File:** `backend/fitness-functions-rules/naming-rules/check-migration-naming.ts`

---

### 2. Architecture Dependency Check

**Purpose:** Prevent circular dependencies and enforce domain boundaries.

**Current State:**
The project already uses `dependency-cruiser` with rules in `backend/rules/common.rules.ts`:
- `no-orphans`: Detects files with no incoming or outgoing dependencies
- `cases-entities-no-records-entities`: Prevents cases domain from depending on records domain
- `records-entities-no-cases-entities`: Prevents records domain from depending on cases domain

**Enhancement:**
Add a fitness function that runs `depcruise` and fails the build on any violations.

**File:** `backend/fitness-functions-rules/architecture/check-dependencies.ts`

---

## Directory Structure

```
backend/
├── fitness-functions-rules/
│   ├── naming-rules/
│   │   └── check-migration-naming.ts
│   ├── architecture/
│   │   └── check-dependencies.ts
│   └── run-all-fitness-checks.ts
└── rules/
    └── common.rules.ts  (existing)
```

## Implementation: Migration Naming Check

```typescript
/**
 * Migration Naming Convention Fitness Function
 *
 * Enforces that TypeORM migration files follow the naming convention.
 *
 * Usage: npx ts-node -r tsconfig-paths/register fitness-functions-rules/naming-rules/check-migration-naming.ts
 */

import * as fs from 'fs';
import * as path from 'path';

type ViolationType = 'filename' | 'class-name' | 'name-property';

type Violation = {
  type: ViolationType;
  filename: string;
  message: string;
};

const MIGRATIONS_DIR = path.resolve('src/typeorm/migrations');

const VALID_ACTIONS = ['create', 'alter', 'seed', 'update', 'drop'] as const;

// create/seed: description is optional
// alter/update/drop: description is required
const CREATE_SEED_PATTERN =
  /^\d{13}-(create|seed)(__[a-z][a-z0-9_-]*)?__[a-z][a-z0-9_-]*_tables?\.ts$/;

const ALTER_UPDATE_DROP_PATTERN =
  /^\d{13}-(alter|update|drop)__[a-z][a-z0-9_-]*__[a-z][a-z0-9_-]*_tables?\.ts$/;

/**
 * Pre-existing migrations that violate the convention.
 * These cannot be renamed because they are tracked in TypeORM's migrations table.
 */
const KNOWN_FILENAME_EXCEPTIONS = new Set<string>([
  // Add existing migration filenames here as they are identified
]);

const KNOWN_INTERNAL_EXCEPTIONS = new Set<string>([
  // Add existing migration filenames here as they are identified
]);

const isValidMigrationName = (filename: string): boolean =>
  CREATE_SEED_PATTERN.test(filename) || ALTER_UPDATE_DROP_PATTERN.test(filename);

const toPascalCase = (segment: string): string =>
  segment
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

const deriveExpectedClassName = (filename: string): string | undefined => {
  const match = filename.match(/^(\d{13})-(.+)\.ts$/);
  if (!match) return undefined;
  const [, timestamp, body] = match;
  const segments = body.split('__');
  const pascalSegments = segments.map(toPascalCase);
  return `${pascalSegments.join('_')}${timestamp}`;
};

const diagnoseFilenameViolation = (filename: string): string => {
  if (!filename.endsWith('.ts')) {
    return 'Migration files must use .ts extension.';
  }
  const timestampMatch = filename.match(/^(\d+)-/);
  if (!timestampMatch || timestampMatch[1].length !== 13) {
    return 'Filename must start with a 13-digit unix timestamp followed by a hyphen.';
  }
  const afterTimestamp = filename.slice(14);
  const actionMatch = afterTimestamp.match(/^([a-z_]+?)__/);
  if (!actionMatch) {
    return 'Missing double-underscore separator after the action. Expected: {timestamp}-{action}__{description}__{table}_table.ts';
  }
  const action = actionMatch[1];
  if (!VALID_ACTIONS.includes(action as (typeof VALID_ACTIONS)[number])) {
    return `Invalid action "${action}". Must be one of: ${VALID_ACTIONS.join(', ')}.`;
  }
  if (!filename.match(/_tables?\.ts$/)) {
    return 'Filename must end with _table.ts or _tables.ts.';
  }
  return `Does not match expected pattern. Use: {timestamp}-${action}__{description}__{table_name}_table.ts`;
};

const checkFilenameConventions = (files: string[]): Violation[] =>
  files
    .filter(
      (filename) =>
        !KNOWN_FILENAME_EXCEPTIONS.has(filename) && !isValidMigrationName(filename),
    )
    .map((filename) => ({
      type: 'filename' as const,
      filename,
      message: diagnoseFilenameViolation(filename),
    }));

const checkInternalNaming = (files: string[]): Violation[] => {
  const violations: Violation[] = [];
  const validFiles = files.filter(
    (f) => isValidMigrationName(f) && !KNOWN_INTERNAL_EXCEPTIONS.has(f),
  );
  for (const filename of validFiles) {
    const expectedClassName = deriveExpectedClassName(filename);
    if (!expectedClassName) continue;
    
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const classMatch = content.match(/export\s+class\s+(\S+?)[\s{]/);
    const actualClassName = classMatch?.[1];
    
    if (!actualClassName) {
      violations.push({
        type: 'class-name',
        filename,
        message: 'Could not find exported class declaration.',
      });
      continue;
    }
    
    const cleanClassName = actualClassName.replace(/\s+implements\s+.*/, '');
    if (cleanClassName !== expectedClassName) {
      violations.push({
        type: 'class-name',
        filename,
        message: `Class name mismatch.\n   Actual:   ${cleanClassName}\n   Expected: ${expectedClassName}`,
      });
    }
    
    const nameMatch = content.match(/name\s*=\s*['"]([^'"]+)['"]/);
    const actualNameProp = nameMatch?.[1];
    
    if (!actualNameProp) {
      violations.push({
        type: 'name-property',
        filename,
        message: `Could not find name property. Expected: name = '${expectedClassName}'`,
      });
    } else if (actualNameProp !== expectedClassName) {
      violations.push({
        type: 'name-property',
        filename,
        message: `Name property mismatch.\n   Actual:   '${actualNameProp}'\n   Expected: '${expectedClassName}'`,
      });
    }
  }
  return violations;
};

const main = (): void => {
  console.log('🔍 Checking migration file naming conventions...\n');
  
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.log(`Migration directory not found: ${MIGRATIONS_DIR}`);
    process.exit(0);
  }
  
  const files = fs.readdirSync(MIGRATIONS_DIR);
  const filenameViolations = checkFilenameConventions(files);
  const internalViolations = checkInternalNaming(files);
  const allViolations = [...filenameViolations, ...internalViolations];
  
  if (allViolations.length === 0) {
    console.log('✅ No migration naming violations found.\n');
    console.log('Migration files correctly follow the naming convention:');
    console.log('  Filename: {timestamp}-{action}__{description}__{table_name}_table.ts');
    console.log('  Class:    {Action}_{Description}_{TableName}Table{timestamp}');
    console.log("  Name:     '{Action}_{Description}_{TableName}Table{timestamp}'");
    process.exit(0);
  }
  
  console.log(`❌ Found ${allViolations.length} migration naming violation(s):\n`);
  
  for (const violation of allViolations) {
    const icon = violation.type === 'filename' ? '📁' : '📄';
    console.log(`${icon} ${violation.filename}`);
    console.log(`   ${violation.message}\n`);
  }
  
  console.log('\n💡 Naming convention:');
  console.log('  Filename: {timestamp}-{action}__{description}__{table_name}_table.ts');
  console.log('  Class:    {Action}_{Description}_{TableName}Table{timestamp}');
  console.log("  Name:     '{Action}_{Description}_{TableName}Table{timestamp}'");
  console.log(`\n  Actions: ${VALID_ACTIONS.join(' | ')}`);
  console.log('  Description: required for alter/update/drop, optional for create/seed');
  
  process.exit(1);
};

main();
```

## Implementation: Architecture Dependency Check

```typescript
/**
 * Architecture Dependency Fitness Function
 *
 * Runs dependency-cruiser to detect:
 * - Orphan files (unused code)
 * - Domain boundary violations
 * - Circular dependencies
 *
 * Usage: npx ts-node -r tsconfig-paths/register fitness-functions-rules/architecture/check-dependencies.ts
 */

import { execSync } from 'child_process';
import * as path from 'path';

const DEP_CRUISE_CONFIG = path.resolve('load-depcruise-config.js');

const main = (): void => {
  console.log('🔍 Checking architecture dependencies...\n');
  
  try {
    execSync(
      `npx depcruise --config ${DEP_CRUISE_CONFIG} --output-type err src`,
      {
        stdio: ['inherit', 'pipe', 'pipe'],
        cwd: path.resolve('.'),
      }
    );
    console.log('✅ No dependency violations found.\n');
    process.exit(0);
  } catch (error: any) {
    console.log('❌ Architecture dependency violations found:\n');
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.log(error.stderr.toString());
    process.exit(1);
  }
};

main();
```

## Implementation: Master Runner

```typescript
/**
 * Run All Fitness Checks
 *
 * Orchestrates all fitness functions and reports aggregated results.
 *
 * Usage: npm run test:fitness
 */

import { execSync } from 'child_process';
import * as path from 'path';

interface CheckConfig {
  name: string;
  script: string;
}

const CHECKS: CheckConfig[] = [
  {
    name: 'Migration Naming Convention',
    script: 'fitness-functions-rules/naming-rules/check-migration-naming.ts',
  },
  {
    name: 'Architecture Dependencies',
    script: 'fitness-functions-rules/architecture/check-dependencies.ts',
  },
];

const runCheck = (check: CheckConfig): { name: string; passed: boolean; output: string } => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${check.name}`);
  console.log('='.repeat(60));
  
  try {
    const output = execSync(
      `npx ts-node -r tsconfig-paths/register ${check.script}`,
      {
        encoding: 'utf-8',
        stdio: ['inherit', 'pipe', 'pipe'],
      }
    );
    console.log(output);
    return { name: check.name, passed: true, output };
  } catch (error: any) {
    const output = error.stdout || error.message;
    console.log(output);
    return { name: check.name, passed: false, output };
  }
};

const main = (): void => {
  console.log('\n🏃 Running all fitness functions...\n');
  
  const results = CHECKS.map(runCheck);
  
  console.log('\n' + '='.repeat(60));
  console.log('FITNESS CHECKS SUMMARY');
  console.log('='.repeat(60));
  
  let passedCount = 0;
  let failedCount = 0;
  
  for (const result of results) {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
    if (result.passed) passedCount++;
    else failedCount++;
  }
  
  console.log('='.repeat(60));
  console.log(`\nTotal: ${results.length} | ✅ Passed: ${passedCount} | ❌ Failed: ${failedCount}`);
  
  if (failedCount > 0) {
    console.log('\n❌ Fitness checks failed. Fix violations before committing.\n');
    process.exit(1);
  }
  
  console.log('\n✅ All fitness checks passed!\n');
  process.exit(0);
};

main();
```

## Integration Steps

1. **Create directory structure:**
   ```bash
   mkdir -p backend/fitness-functions-rules/naming-rules
   mkdir -p backend/fitness-functions-rules/architecture
   ```

2. **Create the fitness function files** with content above.

3. **Update `package.json` scripts:**
   - Ensure `test:fitness` points to `fitness-functions-rules/run-all-fitness-checks.ts`

4. **Add to CI pipeline:**
   ```yaml
   # .github/workflows/ci.yml or equivalent
   - name: Run Fitness Functions
     run: npm run test:fitness
   ```

5. **Add to pre-commit (optional):**
   ```bash
   # .husky/pre-commit or lint-staged
   npm run test:fitness
   ```

6. **Populate exception lists:**
   - Run the migration check against existing migrations
   - Add grandfathered migrations to `KNOWN_FILENAME_EXCEPTIONS` and `KNOWN_INTERNAL_EXCEPTIONS`

## Success Criteria

- [ ] `npm run test:fitness` executes without errors
- [ ] Migration naming violations are detected and reported with clear messages
- [ ] Dependency violations are detected and reported
- [ ] CI pipeline fails if fitness checks fail
- [ ] All existing migrations are grandfathered via exception lists
- [ ] Documentation exists for the naming convention

## Open Questions

1. Should we add a fitness function for entity naming conventions?
2. Should we enforce test file naming patterns (`*.spec.ts`, `*.e2e-spec.ts`)?
3. Should we add a check for console.log statements in production code?
4. What other architectural boundaries should be enforced beyond cases/records separation?
