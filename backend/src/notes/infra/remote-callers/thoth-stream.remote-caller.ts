import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { isIP } from 'net';
// Named import, not default: tsconfig has allowSyntheticDefaultImports without
// esModuleInterop, so `import WebSocket from 'ws'` compiles but is undefined at runtime.
import { WebSocket, type RawData } from 'ws';

export type ThothStreamHandlers = {
  onTranscription: (text: string) => void;
  onError: (error: Error) => void;
  onClose: () => void;
};

export type ThothStreamHandle = {
  send(chunk: Buffer): void;
  close(): void;
};

/**
 * WebSocket client for thoth's `/stream-audio` endpoint.
 *
 * Mirrors HermesRemoteCaller: config read in the constructor with a hard failure
 * on a missing URL, a class-named Logger, and errors mapped rather than leaked.
 *
 * See specs/transcription-gateway.md §6.5.
 */
@Injectable()
export class ThothStreamRemoteCaller {
  private readonly logger = new Logger(ThothStreamRemoteCaller.name);
  private readonly thothWsUrl: string;
  private readonly ca?: Buffer;

  constructor(private readonly configService: ConfigService) {
    // Deliberately does NOT throw when unset. Deployment copies a fixed .env
    // over this host, so a missing variable must degrade transcription only —
    // not prevent the whole backend from booting. open() rejects instead, and
    // the gateway closes the browser socket with 1011.
    const url = this.configService.get<string>('THOTH_WS_URL');
    if (!url) {
      this.logger.error(
        'THOTH_WS_URL is not set — transcription is disabled. Every recording ' +
          'will fail with "Transcription service unavailable" until it is configured.'
      );
      this.thothWsUrl = '';
      return;
    }
    this.thothWsUrl = url.replace(/\/+$/, '');

    const caPath = this.configService.get<string>('THOTH_CA_CERT');
    if (caPath) {
      try {
        this.ca = readFileSync(caPath);
      } catch (error) {
        throw new Error(
          `THOTH_CA_CERT points at ${caPath}, which cannot be read ` +
            `(${(error as NodeJS.ErrnoException).code}). Use an absolute path to a ` +
            `PEM the backend process can read, and make sure the directory exists ` +
            `before redirecting openssl output into it.`
        );
      }
      // An empty or malformed PEM is worse than none: passing it as `ca`
      // REPLACES Node's trust store, so every verification fails with a
      // confusing "unable to verify the first certificate" instead of an
      // obvious file error. Fail at boot rather than at the first recording.
      const certCount = (
        this.ca.toString().match(/-----BEGIN CERTIFICATE-----/g) ?? []
      ).length;
      if (certCount === 0) {
        throw new Error(
          `THOTH_CA_CERT (${caPath}) contains no PEM certificate. ` +
            `Check the file — a failed "openssl s_client" pipeline writes an empty file.`
        );
      }
      this.logger.log(
        `Loaded ${certCount} certificate(s) from THOTH_CA_CERT (${caPath})`
      );
    } else if (this.thothWsUrl.startsWith('wss://')) {
      // Do not silently fall back to rejectUnauthorized: false. If thoth's
      // self-signed cert is not trusted, the connection should fail loudly.
      this.logger.warn(
        'THOTH_WS_URL is wss:// but THOTH_CA_CERT is not set. ' +
          'Connections will fail unless thoth uses a publicly trusted certificate.'
      );
    }

    this.logger.log(`Initialized with Thoth WS URL: ${this.thothWsUrl}`);
  }

  /**
   * Opens one upstream socket per call. Deliberately NOT pooled or shared:
   * thoth's streaming buffer is process-global, so a reused socket would splice
   * unrelated audio together.
   *
   * Resolves once the upstream connection is open.
   */
  open(handlers: ThothStreamHandlers): Promise<ThothStreamHandle> {
    if (!this.thothWsUrl) {
      return Promise.reject(
        new Error('Transcription service unavailable: THOTH_WS_URL is not set')
      );
    }
    const url = `${this.thothWsUrl}/stream-audio`;

    return new Promise((resolve, reject) => {
      // No `origin` option. Thoth rejects handshakes carrying an Origin header
      // as a browser-blocking measure — see thoth-backend/specs/
      // stream-audio-hardening.md §3. Adding one here breaks the integration.
      const upstream = new WebSocket(url, {
        ...(this.ca ? { ca: this.ca } : {}),
      });

      let opened = false;

      upstream.on('open', () => {
        opened = true;
        this.logger.debug(`Upstream thoth stream opened: ${url}`);
        resolve({
          send: (chunk: Buffer) => {
            if (upstream.readyState === WebSocket.OPEN) {
              upstream.send(chunk);
            }
          },
          close: () => {
            if (
              upstream.readyState === WebSocket.OPEN ||
              upstream.readyState === WebSocket.CONNECTING
            ) {
              upstream.close();
            }
          },
        });
      });

      upstream.on('message', (data: RawData) => {
        const text = this.parseTranscription(data);
        if (text !== null) {
          handlers.onTranscription(text);
        }
      });

      upstream.on('error', (error: Error) => {
        this.logger.error(`Thoth stream error: ${error.message}`);
        const remedy = this.tlsRemedy(error);
        if (remedy) {
          this.logger.error(remedy);
        }
        if (!opened) {
          reject(new Error('Transcription service unavailable'));
          return;
        }
        handlers.onError(error);
      });

      // No reconnect. Thoth resets its buffer in a `finally` on disconnect, so a
      // silent reconnect would splice unrelated audio into one Whisper window.
      // A dropped upstream ends the session.
      upstream.on('close', () => {
        this.logger.debug('Upstream thoth stream closed');
        if (opened) {
          handlers.onClose();
        }
      });
    });
  }

  /**
   * TLS failures against thoth are a configuration problem with a specific fix,
   * not a transient outage. Say so in the log rather than making the next person
   * rediscover it.
   */
  private tlsRemedy(error: Error): string | null {
    const code = (error as NodeJS.ErrnoException).code ?? '';
    // Read the address back out of config rather than naming a host here. No
    // deployment address belongs in the source tree, and the operator needs the
    // address THIS process is actually dialing, not the one in someone's notes.
    const { authority, hostname } = this.upstreamAddress();

    if (code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      // Distinct from the self-signed case: THOTH_CA_CERT is set and loaded, but
      // it is not the certificate that signed what thoth presents.
      return (
        `THOTH_CA_CERT is loaded but does not verify thoth's certificate chain. ` +
        `Usually this means the file holds the LEAF certificate instead of its ` +
        `ISSUER. Compare what thoth serves against what you saved:\n` +
        `  openssl s_client -connect ${authority} -showcerts </dev/null 2>/dev/null \\\n` +
        `    | grep -c "BEGIN CERTIFICATE"      # how many certs thoth sends\n` +
        `  openssl x509 -in $THOTH_CA_CERT -noout -subject -issuer\n` +
        `If subject == issuer the cert is self-signed and should work as a CA. ` +
        `If they differ, save the issuer's certificate instead — or, when thoth ` +
        `sends more than one cert, save the whole chain to the PEM.`
      );
    }

    if (
      code === 'DEPTH_ZERO_SELF_SIGNED_CERT' ||
      code === 'SELF_SIGNED_CERT_IN_CHAIN'
    ) {
      return (
        `Thoth's certificate is not trusted, and THOTH_CA_CERT is not set — ` +
        `there is no "Loaded N certificate(s)" line above, so this process is ` +
        `using the system trust store.\n` +
        `Point THOTH_CA_CERT at an ABSOLUTE path to the same .crt file thoth is ` +
        `serving (the one passed to uvicorn's --ssl-certfile). Copy it to this ` +
        `host if thoth runs elsewhere. To fetch it over the wire instead:\n` +
        `  openssl s_client -connect ${authority} -showcerts </dev/null 2>/dev/null \\\n` +
        `    | sed -n '/BEGIN CERTIFICATE/,/END CERTIFICATE/p' > <a-path-that-exists>/thoth-ca.pem\n` +
        `Then restart. Do NOT set rejectUnauthorized:false — that accepts any ` +
        `certificate, which is what the certificate exists to prevent.`
      );
    }

    if (code === 'ERR_TLS_CERT_ALTNAME_INVALID') {
      return (
        `Thoth's certificate is trusted but does not cover the address in ` +
        `THOTH_WS_URL. Regenerate it with a matching subjectAltName, e.g.\n` +
        `  openssl req -x509 -newkey rsa:2048 -nodes -days 825 \\\n` +
        `    -keyout thoth.key -out thoth.crt -subj "/CN=thoth" \\\n` +
        `    -addext "subjectAltName=${isIP(hostname) ? 'IP' : 'DNS'}:${hostname}"\n` +
        `then redistribute the PEM to THOTH_CA_CERT on this host.`
      );
    }

    return null;
  }

  /**
   * The configured upstream, split for use in shell examples. Falls back to
   * placeholders when THOTH_WS_URL is absent or unparseable, so a diagnostic
   * message never throws on its way out.
   */
  private upstreamAddress(): { authority: string; hostname: string } {
    try {
      const { hostname, port } = new URL(this.thothWsUrl);
      return { authority: `${hostname}:${port || '443'}`, hostname };
    } catch {
      return { authority: '<thoth-host>:<port>', hostname: '<thoth-host>' };
    }
  }

  private parseTranscription(data: RawData): string | null {
    try {
      const payload = JSON.parse(data.toString()) as {
        transcription?: unknown;
      };
      if (typeof payload.transcription !== 'string') {
        return null;
      }
      const trimmed = payload.transcription.trim();
      return trimmed.length > 0 ? trimmed : null;
    } catch {
      this.logger.debug('Ignoring unparseable frame from thoth');
      return null;
    }
  }
}
