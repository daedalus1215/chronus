---
tags: [architecture, testing, nestjs]
---

# Testing Conventions

## Overview

Tests live in `__specs__/` folders adjacent to the source file they test. Every pattern (Transaction Scripts, Repositories, Aggregators, etc.) has a corresponding spec file. These conventions apply across all spec files in Chronus.

---

## File and Folder Conventions

```
{module}/
└── domain/
    └── transaction-scripts/
        └── fetch-case-detail-TS/
            ├── fetch-case-detail.transaction.script.ts
            └── __specs__/
                └── fetch-case-detail.transaction.script.spec.ts
```

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Spec folder | `__specs__/` adjacent to the source file | `transaction-scripts/fetch-case-detail-TS/__specs__/` |
| Spec file name | `{original-name}.spec.ts` | `fetch-case-detail.transaction.script.spec.ts` |

---

## Naming Conventions

| Role | Naming | Example |
| ---- | ------ | ------- |
| System under test | `target` | `let target: FetchCaseDetailTS` |
| Mocked dependency | `{dependency}Mock` (camelCase + `Mock` suffix) | `caseRepositoryMock`, `noteAggregatorMock` |
| Spy on a method | `{method}Spy` (camelCase + `Spy` suffix) | `findByIdSpy` |

---

## Mock Helpers — Always Use These

### `createApplyMock<T>()`

Use `createApplyMock` to mock classes that have an `apply` method (Transaction Scripts, Aggregators, Mappers, etc.).

**Correct:**
```typescript
uploadStartTSMock = createApplyMock<UploadStartTS>();
```

**Incorrect:**
```typescript
uploadStartTSMock = {
  apply: jest.fn(),
} as unknown as jest.Mocked<UploadStartTS>;
```

For classes with multiple methods, pass an object:
```typescript
noteAggregatorMock = createApplyMock<RecordAggregator>({
  createRecords: jest.fn(),
  fetchFilesByRecordId: jest.fn(),
});
```

### `createMockLogger()`

Use `createMockLogger` when the `Logger` is a provider in the module under test.

**Correct:**
```typescript
{
  provide: Logger,
  useValue: createMockLogger(),
},
```

**Incorrect:**
```typescript
loggerMock = createMock<Logger>({
  debug: jest.fn(),
});
```

Both helpers are imported from `src/test-utils/test-utils`.

---

## Test Structure

Use `given / when / then` describe labels and `Arrange / Act / Assert` comments within each test body.

```typescript
describe('given: FetchCaseDetailTS', () => {
  let target: FetchCaseDetailTS;
  let caseRepositoryMock: jest.Mocked<CaseRepository>;

  beforeEach(async () => {
    // Arrange
    caseRepositoryMock = createApplyMock<CaseRepository>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FetchCaseDetailTS,
        { provide: CaseRepository, useValue: caseRepositoryMock },
      ],
    }).compile();

    target = module.get<FetchCaseDetailTS>(FetchCaseDetailTS);
  });

  describe('when: fetching case detail', () => {
    test('then: should return case projection', async () => {
      // Arrange
      const caseId = 42;
      const mockCase = { id: caseId, shortName: 'Smith v Jones', fullName: 'Smith v Jones LLC' };
      caseRepositoryMock.apply.mockResolvedValue(mockCase);

      // Act
      const result = await target.apply(caseId);

      // Assert
      expect(caseRepositoryMock.apply).toHaveBeenNthCalledWith(1, caseId);
      expect(result).toEqual({
        caseID: caseId.toString(),
        caseShortName: mockCase.shortName,
        caseFullName: mockCase.fullName,
      });
    });
  });
});
```

---

## Coverage Requirement

**Minimum 80% coverage** for all production code. All production classes (Transaction Scripts, Repositories, Aggregators, Domain Services, Converters, Assemblers, Mappers) require tests. End-to-end tests are excluded from this requirement.

---

## Test Data Helpers

Use factory helpers from `src/test-utils/test-utils` and domain-specific `test-utils` files for random test data:

```typescript
import { createApplyMock, generateRandomString } from 'src/test-utils/test-utils';
import { createMockUploadStartParams } from 'src/file-objects/test-utils';

const params = createMockUploadStartParams();
const randomId = generateRandomString(10);
```

Domain-specific test helpers (`createMock{Entity}`, `createMock{Params}`) live in the module's own `test-utils` file.

---

## Full Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { FileObjectAggregator } from '../file-object.aggregator';
import { UploadStartTS } from '../../transaction-scripts/upload-start-TS/upload-start.transaction.script';
import { DeleteFileTS } from '../../transaction-scripts/delete-file-TS/delete-file.transaction.script';
import { DeleteParams } from 'src/generic/domain/file-object/file-object.aggregator.port';
import { createApplyMock, generateRandomString } from 'src/test-utils/test-utils';
import { createMockUploadStartParams } from 'src/file-objects/test-utils';

describe('given: FileObjectAggregator', () => {
  let target: FileObjectAggregator;
  let uploadStartTSMock: jest.Mocked<UploadStartTS>;
  let deleteFileTSMock: jest.Mocked<DeleteFileTS>;

  beforeEach(async () => {
    // Arrange
    uploadStartTSMock = createApplyMock<UploadStartTS>();
    deleteFileTSMock = createApplyMock<DeleteFileTS>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileObjectAggregator,
        { provide: UploadStartTS, useValue: uploadStartTSMock },
        { provide: DeleteFileTS, useValue: deleteFileTSMock },
      ],
    }).compile();

    target = module.get<FileObjectAggregator>(FileObjectAggregator);
  });

  describe('when: starting upload', () => {
    test('then: should delegate to UploadStartTS', async () => {
      // Arrange
      const params = createMockUploadStartParams();
      const expectedUploadId = generateRandomString(10);
      uploadStartTSMock.apply.mockResolvedValue(expectedUploadId);

      // Act
      const result = await target.uploadStart(params);

      // Assert
      expect(uploadStartTSMock.apply).toHaveBeenNthCalledWith(1, params);
      expect(result).toBe(expectedUploadId);
    });
  });

  describe('when: deleting file', () => {
    test('then: should delegate to DeleteFileTS', async () => {
      // Arrange
      const params: DeleteParams = { bucket: 'test-bucket', key: 'test/path/file.pdf' };
      deleteFileTSMock.apply.mockResolvedValue(undefined);

      // Act
      await target.delete(params);

      // Assert
      expect(deleteFileTSMock.apply).toHaveBeenCalledWith(params);
    });

    test('then: should propagate errors from DeleteFileTS', async () => {
      // Arrange
      const params: DeleteParams = { bucket: 'test-bucket', key: 'test/path/file.pdf' };
      const expectedError = new Error('Delete failed');
      deleteFileTSMock.apply.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(target.delete(params)).rejects.toThrow(expectedError);
    });
  });
});
```

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Inline mock objects (`{ apply: jest.fn() } as unknown as jest.Mocked<T>`) | Brittle; misses type safety | Use `createApplyMock<T>()` |
| `createMock<Logger>(...)` for the logger | Inconsistent; misses standard mock setup | Use `createMockLogger()` |
| Naming the system under test `service`, `ts`, `aggregator` | Inconsistent across spec files | Always use `target` |
| Calling `toHaveBeenCalled()` without checking call count or args | Misses call-order and argument bugs | Use `toHaveBeenNthCalledWith(1, ...)` for single calls |
| Skipping tests for error paths | Missing coverage for exception handling | Test both happy path and error propagation |
