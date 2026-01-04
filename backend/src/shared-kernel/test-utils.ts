import { Logger } from 'nestjs-pino';

export const generateRandomNumbers = (min: number = 0, max: number = 20) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const createMock = <T>(overrides: Partial<T> = {}): jest.Mocked<T> =>
  overrides as unknown as jest.Mocked<T>;

export const createLoggerMock = () =>
  createMock<Logger>({
    log: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });