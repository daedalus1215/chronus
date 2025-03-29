
export const createMock = (overrides: Partial<T> = {}): T => ({
    id: 1,
    name: 'Original Note',
    userId: 'user123',
    archived_date: null,
    memo: null,
    tags: [],
    ...overrides
});