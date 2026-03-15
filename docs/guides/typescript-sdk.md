---
sidebar_position: 2
---

# TypeScript SDK

The TypeScript SDK (`roche-sandbox`) provides a Promise-based API for managing sandboxes, with support for TC39 Explicit Resource Management (`using`).

## Installation

```bash
npm install roche-sandbox
```

Requirements: Node.js >= 18, Roche CLI on `PATH` or daemon running.

## Client

```typescript
import { Roche } from "roche-sandbox";

const roche = new Roche({
  mode: "auto",          // "auto" | "direct"
  daemonPort: undefined, // override gRPC daemon port
  provider: "docker",    // default provider
  binary: "roche",       // path to roche CLI binary
});
```

## Creating Sandboxes

### Object-oriented (Sandbox handle)

```typescript
const sandbox = await roche.createSandbox({
  image: "python:3.12-slim",
  memory: "512m",
  cpus: 1.0,
  timeout_secs: 600,
  network: false,
  writable: false,
  env: { API_KEY: "secret" },
});

const output = await sandbox.exec(["python3", "-c", "print('hello')"]);
console.log(output.stdout); // hello
await sandbox.destroy();
```

### Flat methods

```typescript
const id = await roche.create({ image: "python:3.12-slim" });
const result = await roche.exec(id, ["echo", "hi"]);
await roche.destroy(id);
```

## Auto-Cleanup with `using`

TypeScript >= 5.2 supports Explicit Resource Management:

```typescript
await using sandbox = await roche.createSandbox();
await sandbox.exec(["echo", "hello"]);
// sandbox.destroy() called automatically when scope exits
```

## Sandbox Operations

```typescript
// Execute commands
const output = await sandbox.exec(["echo", "hello"]);
console.log(output.stdout);    // "hello\n"
console.log(output.stderr);    // ""
console.log(output.exitCode);  // 0

// Pause and unpause
await sandbox.pause();
await sandbox.unpause();

// Copy files
await sandbox.copyTo("./local/file.py", "/sandbox/file.py");
await sandbox.copyFrom("/sandbox/output.json", "./local/output.json");

// Destroy
await sandbox.destroy();
```

## Client-Level Operations

```typescript
// List all active sandboxes
const sandboxes = await roche.list();
for (const sb of sandboxes) {
  console.log(`${sb.id} (${sb.status}) - ${sb.image}`);
}
```

## Error Handling

All errors extend `RocheError`:

```typescript
import { RocheError, SandboxNotFound, ProviderUnavailable } from "roche-sandbox";

try {
  const sandbox = await roche.createSandbox();
} catch (e) {
  if (e instanceof ProviderUnavailable) {
    console.error("Docker is not running");
  } else if (e instanceof RocheError) {
    console.error(`Roche error: ${e.message}`);
  }
}
```

| Error | When |
|-------|------|
| `RocheError` | Base error |
| `SandboxNotFound` | Sandbox ID not found |
| `SandboxPaused` | Operation on paused sandbox |
| `ProviderUnavailable` | Provider not available |
| `TimeoutError` | Operation timed out |
| `UnsupportedOperation` | Provider does not support operation |

## Types

```typescript
interface SandboxConfig {
  provider?: string;           // default: "docker"
  image?: string;              // default: "python:3.12-slim"
  memory?: string;
  cpus?: number;
  timeoutSecs?: number;        // default: 300
  network?: boolean;           // default: false
  writable?: boolean;          // default: false
  env?: Record<string, string>;
  mounts?: Mount[];
}

interface ExecOutput {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface SandboxInfo {
  id: string;
  status: SandboxStatus;
  provider: string;
  image: string;
  expiresAt?: number;
}

type SandboxStatus = "running" | "paused" | "stopped" | "failed";
```

## Further Reading

- [API Reference](../api-reference) — complete type and method reference
- [Framework Integration](./framework-integration) — use with agent frameworks
