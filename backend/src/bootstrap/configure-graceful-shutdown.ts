import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';

const SHUTDOWN_TIMEOUT_MS = 10_000;

type ShutdownState = {
  shutdownInProgress: boolean;
  shutdownTimer: NodeJS.Timeout | null;
  closeInProgress: boolean;
};

/**
 * Configures graceful shutdown handlers for SIGTERM/SIGINT.
 * Prevents duplicate close calls and enforces a timeout to avoid hung processes.
 */
export const configureGracefulShutdown = (
  app: NestExpressApplication,
  logger: Logger,
): void => {
  const state: ShutdownState = {
    shutdownInProgress: false,
    shutdownTimer: null,
    closeInProgress: false,
  };

  const originalClose = app.close.bind(app);
  app.close = async (): Promise<void> => {
    if (state.closeInProgress) {
      return;
    }
    state.closeInProgress = true;
    return originalClose();
  };

  const shutdown = async (signal: string): Promise<void> => {
    if (state.shutdownInProgress) {
      return;
    }

    state.shutdownInProgress = true;
    logger.log(`Received ${signal}. Starting graceful shutdown...`);

    state.shutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    try {
      await app.close();
      if (state.shutdownTimer) {
        clearTimeout(state.shutdownTimer);
      }
      logger.log('Application successfully shut down.');
      process.exit(0);
    } catch (error) {
      if (state.shutdownTimer) {
        clearTimeout(state.shutdownTimer);
      }
      logger.error('Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  process.removeAllListeners('SIGTERM');
  process.removeAllListeners('SIGINT');
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};
