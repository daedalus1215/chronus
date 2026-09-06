import { Controller, Get } from '@nestjs/common';

/**
 * Liveness probe for Docker and Traefik. Deliberately touches nothing — no
 * database, no Hermes, no Thoth. A health check that depends on a downstream
 * service reports "unhealthy" when that service is down, and Traefik then stops
 * routing to a container that was perfectly capable of serving the rest of the app.
 *
 * Reachable at /api/healthz: the global prefix in main.ts supplies the /api.
 */
@Controller('healthz')
export class HealthController {
  @Get()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
