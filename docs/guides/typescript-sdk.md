---
sidebar_position: 2
---

# TypeScript SDK

The TypeScript SDK provides an async API for managing Roche sandboxes.

## Installation

```bash
npm install roche-sandbox
```

## Basic Usage

```typescript
import { Roche } from "roche-sandbox";

const roche = new Roche();
const sandbox = await roche.createSandbox({ image: "python:3.12-slim" });

const output = await sandbox.exec(["python3", "-c", "print('Hello!')"]);
console.log(output.stdout);   // Hello!\n
console.log(output.exitCode); // 0

await sandbox.destroy();
```

## Auto-Cleanup

Using TC39 Explicit Resource Management (`using`):

```typescript
await using sandbox = await roche.createSandbox({ image: "python:3.12-slim" });
const output = await sandbox.exec(["echo", "auto-cleanup"]);
// sandbox destroyed automatically when scope exits
```

## Configuration

```typescript
const sandbox = await roche.createSandbox({
  image: "python:3.12-slim",
  memory: "512m",
  cpus: 1.0,
  timeoutSecs: 600,
  network: false,       // default: AI-safe
  writable: false,      // default: AI-safe
  env: { API_KEY: "secret" },
});
```

## File Operations

```typescript
await sandbox.copyTo("/local/data.csv", "/data/data.csv");
await sandbox.copyFrom("/output/result.json", "/local/result.json");
```

## Pause / Resume

```typescript
await sandbox.pause();
await sandbox.unpause();
```

## Client Operations

```typescript
// List all active sandboxes
const sandboxes = await roche.list();

// Execute on a sandbox by ID
const output = await roche.exec("abc123def456", ["echo", "hello"]);

// Destroy by ID
await roche.destroy("abc123def456");
```

## Error Handling

```typescript
import { RocheError, SandboxNotFound, TimeoutError } from "roche-sandbox";

try {
  await sandbox.exec(["long-running-command"]);
} catch (e) {
  if (e instanceof TimeoutError) {
    console.log("Command timed out");
  } else if (e instanceof SandboxNotFound) {
    console.log("Sandbox was destroyed");
  } else if (e instanceof RocheError) {
    console.log(`Roche error: ${e.message}`);
  }
}
```

## Types

```typescript
interface SandboxConfig {
  provider?: string;         // default: "docker"
  image?: string;            // default: "python:3.12-slim"
  memory?: string;
  cpus?: number;
  timeoutSecs?: number;      // default: 300
  network?: boolean;         // default: false
  writable?: boolean;        // default: false
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
