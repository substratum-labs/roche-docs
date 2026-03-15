---
sidebar_position: 2
---

# Quickstart

Create a sandbox, execute code, and clean up — in under 2 minutes.

## CLI

```bash
# Create a sandbox (network off, readonly FS by default)
SANDBOX_ID=$(roche create --provider docker --memory 512m)
echo "Created: $SANDBOX_ID"

# Execute code
roche exec --sandbox $SANDBOX_ID python3 -c "print('Hello from Roche!')"

# List active sandboxes
roche list

# Clean up
roche destroy $SANDBOX_ID
```

## Python SDK

```python
from roche_sandbox import Roche

roche = Roche()

# Create — AI-safe defaults (no network, readonly FS)
sandbox = roche.create(image="python:3.12-slim")
print(f"Created: {sandbox.id}")

# Execute
output = sandbox.exec(["python3", "-c", "print('Hello from Roche!')"])
print(f"stdout: {output.stdout.strip()}")
print(f"exit code: {output.exit_code}")

# Clean up
sandbox.destroy()
```

### Context Manager (auto-cleanup)

```python
with roche.create(image="python:3.12-slim") as sandbox:
    output = sandbox.exec(["echo", "hello"])
    print(output.stdout)
# sandbox auto-destroyed
```

### Async API

```python
import asyncio
from roche_sandbox import AsyncRoche

async def main():
    roche = AsyncRoche()
    async with await roche.create(image="python:3.12-slim") as sandbox:
        output = await sandbox.exec(["python3", "-c", "print('async hello')"])
        print(output.stdout)

asyncio.run(main())
```

## TypeScript SDK

```typescript
import { Roche } from "roche-sandbox";

const roche = new Roche();

// Auto-cleanup with `using` (TC39 Explicit Resource Management)
await using sandbox = await roche.createSandbox({ image: "python:3.12-slim" });
const output = await sandbox.exec(["python3", "-c", "print('Hello!')"]);
console.log(output.stdout);
```

## What Just Happened?

1. **Create** — Roche launched a Docker container with AI-safe defaults:
   - Network disabled (no outbound connections)
   - Filesystem readonly (no persistent writes)
   - 300s timeout (auto-destroyed if idle)
   - PID limit 256 (fork bomb protection)

2. **Exec** — Your command ran inside the isolated container. stdout/stderr were captured and returned.

3. **Destroy** — The container was stopped and removed. No trace left on the host.

## Next Steps

- [Core Concepts](./concepts) — understand providers, security defaults, and transport
- [Python SDK Guide](../guides/python-sdk) — full SDK documentation
- [Framework Integration](../guides/framework-integration) — use Roche with LangChain, CrewAI, etc.
