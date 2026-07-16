---
tags: [architecture, infrastructure-layer, integration]
---

# RemoteCaller Pattern

## Purpose

A **RemoteCaller** sends commands or requests to external services. It encapsulates outbound HTTP calls, SDK invocations, or other remote communication behind a clean interface — keeping the domain unaware of transport details.

RemoteCallers are the answer to: *"How do we call an external service without coupling the domain to HTTP clients, SDKs, or transport protocols?"*

---

## When to Use

| Situation | Pattern |
| --------- | ------- |
| Send a command or request to an external service | **RemoteCaller** |
| Publish domain events to messaging infrastructure | Dispatcher |
| Handle ambient infrastructure context (transactions, traces) | Hook |

Use a RemoteCaller when:

- You need to **invoke an external API** (REST, gRPC, etc.)
- You need to **send a command** to another service (as opposed to publishing an event)
- The external call should be **abstracted** so the domain does not depend on HTTP clients or SDKs

---

## Key Characteristics

1. **External service communication** — encapsulates outbound calls.
2. **Infrastructure layer** — lives alongside Repositories and Dispatchers.
3. **Command/request handling** — sends specific commands, not broadcast events.
4. **Abstracted transport** — the domain consumes a port; the RemoteCaller implements the transport.

---

## Anatomy

### RemoteCaller Implementation

```typescript
@Injectable()
export class ExternalServiceRemoteCaller {
  constructor(private readonly httpClient: HttpClient) {}

  async sendCommand(command: ExternalCommand): Promise<ExternalResponse> {
    const response = await this.httpClient.post(
      EXTERNAL_SERVICE_URL,
      command,
    );
    return response.data;
  }
}
```

### With Port Abstraction

```typescript
// domain/ports/external-service.remote-caller.port.ts
export const EXTERNAL_SERVICE_CALLER = Symbol('EXTERNAL_SERVICE_CALLER');

export type ExternalServiceCallerPort = {
  sendCommand(command: ExternalCommand): Promise<ExternalResponse>;
};
```

```typescript
// infrastructure/remote-callers/external-service.remote-caller.ts
@Injectable()
export class ExternalServiceRemoteCaller implements ExternalServiceCallerPort {
  constructor(private readonly httpClient: HttpClient) {}

  async sendCommand(command: ExternalCommand): Promise<ExternalResponse> {
    return (await this.httpClient.post(EXTERNAL_SERVICE_URL, command)).data;
  }
}
```

---

## Dependency Rules

| Aspect | Rule |
| ------ | ---- |
| **Can inject** | Repositories (for data needed for the command), HTTP clients, SDK clients |
| **Cannot inject** | Transaction Scripts, Domain Services, other RemoteCallers |
| **Consumed via** | Port injection — `@Inject(SYMBOL_TOKEN)` with a port type |
| **Same-level rule** | RemoteCallers must not inject other RemoteCallers |

---

## Naming Conventions

| Artifact | Convention | Example |
| -------- | ---------- | ------- |
| Class name | `{Purpose}RemoteCaller` | `ExternalServiceRemoteCaller` |
| File name | `{purpose}.remote-caller.ts` | `external-service.remote-caller.ts` |
| Folder | `{module}/infrastructure/remote-callers/` or `{module}/domain/remote-callers/` | |
| Port type | `{Purpose}CallerPort` or `{Purpose}RemoteCallerPort` | `ExternalServiceCallerPort` |
| Token | `{PURPOSE}_CALLER` (Symbol) | `EXTERNAL_SERVICE_CALLER` |

---

## Dispatcher vs RemoteCaller

| Aspect | Dispatcher | RemoteCaller |
| ------ | ---------- | ------------ |
| Direction | Publish events (broadcast) | Send commands (targeted) |
| Coupling | Loose — consumers may or may not exist | Tight — expects a specific service to respond |
| Transport | Message queue (SQS, SNS, Kafka) | HTTP, gRPC, SDK |
| Response | Fire-and-forget (typically) | Expects a response |

---

## Anti-Patterns

| Anti-Pattern | Why It's Wrong | Correct Approach |
| ------------ | -------------- | ---------------- |
| Domain code importing HTTP clients directly | Couples domain to transport | Define a port; implement the RemoteCaller in infrastructure |
| RemoteCaller injecting a Transaction Script | Dependency flows the wrong direction | Transaction Scripts consume RemoteCallers through ports |
| Business logic in a RemoteCaller | RemoteCallers handle transport, not decisions | Move business logic to a Transaction Script |
| One RemoteCaller injecting another | Same-level injection violation | Keep each RemoteCaller independent |
