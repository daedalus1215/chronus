import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { ServerOptions } from 'https';

/**
 * Resolves HTTPS options from environment variables or default shared-certs location.
 * Returns undefined if no certificates are found, allowing the app to fall back to HTTP.
 */
export const getHttpsOptions = (): ServerOptions | undefined => {
  const sslKeyPath = process.env.SSL_KEYFILE;
  const sslCertPath = process.env.SSL_CERTFILE;

  if (sslKeyPath && sslCertPath) {
    return loadCertificatesFromPaths(sslKeyPath, sslCertPath);
  }

  return loadCertificatesFromDefaults();
};

const loadCertificatesFromPaths = (
  keyPath: string,
  certPath: string,
): ServerOptions | undefined => {
  try {
    if (!existsSync(keyPath) || !existsSync(certPath)) {
      console.warn('SSL certificate files not found at specified paths');
      return undefined;
    }
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  } catch (error) {
    console.warn(
      `Failed to load SSL certificates: ${error instanceof Error ? error.message : String(error)}`,
    );
    console.warn('Falling back to HTTP');
    return undefined;
  }
};

const loadCertificatesFromDefaults = (): ServerOptions | undefined => {
  const programmingDir = join(__dirname, '../../..');
  const sharedCertsPath = join(programmingDir, 'shared-certs');
  const keyPath = join(sharedCertsPath, 'server.key');
  const certPath = join(sharedCertsPath, 'server.crt');

  if (!existsSync(keyPath) || !existsSync(certPath)) {
    return undefined;
  }

  try {
    console.log(`Using SSL certificates from: ${sharedCertsPath}`);
    return {
      key: readFileSync(keyPath),
      cert: readFileSync(certPath),
    };
  } catch (error) {
    console.warn(
      `Failed to read SSL certificates: ${error instanceof Error ? error.message : String(error)}`,
    );
    return undefined;
  }
};
