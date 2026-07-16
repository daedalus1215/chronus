---
tags: [architecture, application-layer, nestjs, eventing]
---

# Webhook Pattern

## Purpose

A **Webhook** is an inbound HTTP handler that receives requests from **other backend systems** — as opposed to Actions, which receive requests from the frontend. Webhooks sit at the same level in the dependency hierarchy as Actions and Listeners: they are entry points that delegate to Domain Services.

Webhooks are the answer to: *"How do we handle inbound HTTP callbacks from third-party services (e.g. payment processors, video converters, S3 event notifications)?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Receive an inbound HTTP request from another backend service | **Webhook** |
| Receive an HTTP request from the frontend | Action |
| React to an inbound domain event from a message queue | Listener |

Use a Webhook when:

- A **third-party or internal service** calls your endpoint via HTTP (not a queue)
- The inbound request is **machine-to-machine** (not user-driven)
- You need to handle the callback **synchronously** over HTTP

---

## Key Characteristics

1. **One class per inbound callback type** — mirrors the Action pattern.
2. **Delegates to Domain Service** — Webhooks contain no business logic.
3. **Validates inbound payloads** — uses DTOs and class-validator just like Actions.
4. **May require signature verification** — backend-to-backend calls often include HMAC signatures; verify in a Guard before the handler runs.
5. **Shares the same hierarchy position as Actions** — entry point only; cannot be injected by other patterns.

---

## Anatomy

### Webhook Controller Decorator Factory

```typescript
// application/controllers/webhooks.controller.ts
export const WebhooksController = () =>
  applyDecorators(
    Controller('/webhooks'),
    ApiTags('Webhooks'),
    UseFilters(AllExceptionsFilter),
  );
```

### Webhook Class

```typescript
// application/controllers/webhooks/video-conversion-complete/video-conversion-complete.webhook.ts
@WebhooksController()
export class VideoConversionCompleteWebhook {
  constructor(private readonly videoService: VideoService) {}

  @Post('/video-conversion-complete')
  @UseGuards(HmacSignatureGuard)
  async apply(@Body() body: VideoConversionCompleteRequestDTO): Promise<void> {
    await this.videoService.handleConversionComplete(body.jobId, body.status);
  }
}
```

---

## Hierarchy Position

Webhooks sit at the same level as Actions and Listeners — the top of the application layer:

```
Actions        ← receive front-end requests
Webhooks       ← receive back-end requests   (this pattern)
Listeners      ← receive event messages
  ↓
Domain Services
  ↓
...
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Domain Services |
| **Cannot inject** | Transaction Scripts, Repositories, Aggregators, or any domain pattern below the Service level |
| **Injected by** | Nothing — Webhooks are entry points |

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Event}Webhook` | `VideoConversionCompleteWebhook` |
| File name | `{event-name}.webhook.ts` | `video-conversion-complete.webhook.ts` |
| Folder | `application/controllers/webhooks/{event-name}/` | |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Business logic in a Webhook | Webhooks are thin entry points | Delegate to a Domain Service |
| Webhook injecting a Transaction Script directly | Skips the Service orchestration layer | Webhooks inject Domain Services; Services inject Transaction Scripts |
| No signature verification on machine-to-machine calls | Security risk — any caller can invoke the endpoint | Use a Guard to verify HMAC signatures or shared secrets |
| Using an Action for backend-to-backend callbacks | Naming confusion; Actions are for frontend | Name backend callbacks as Webhooks |
