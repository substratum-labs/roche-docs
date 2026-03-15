---
sidebar_position: 2
---

# Quickstart

Create a sandbox, run code, and clean up — in under 2 minutes.

## CLI

```bash
# Create a sandbox (network off, readonly FS by default)
SANDBOX_ID=$(roche create --provider docker --memory 512m)

# Execute code in the sandbox
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

# Create and use a sandbox
sandbox = roche.create(image="python:3.12-slim", memory="512m")
output = sandbox.exec(["python3", "-c", "print('Hello from Roche!')"])
print(output.stdout)  # Hello from Roche!
sandbox.destroy()
```

### Context manager (auto-cleanup)

```python
with roche.create(image="python:3.12-slim") as sandbox:
    result = sandbox.exec(["echo", "hello"])
    print(result.stdout)
# sandbox automatically destroyed
```

### Async API

```python
import asyncio
from roche_sandbox import AsyncRoche

async def main():
    roche = AsyncRoche()
    async with await roche.create(image="python:3.12-slim") as sandbox:
        output = await sandbox.exec(["echo", "hello"])
        print(output.stdout)

asyncio.run(main())
```

## TypeScript SDK

```typescript
import { Roche } from "roche-sandbox";

const roche = new Roche();
const sandbox = await roche.createSandbox({ image: "python:3.12-slim" });
const output = await sandbox.exec(["python3", "-c", "print('Hello!')"]);
console.log(output.stdout); // Hello!
await sandbox.destroy();
```

### Auto-cleanup with `using` (TypeScript >= 5.2)

```typescript
await using sandbox = await roche.createSandbox();
await sandbox.exec(["echo", "hello"]);
// sandbox.destroy() called automatically
```

## What Just Happened?

1. `create` launched a Docker container with AI-safe defaults (no network, readonly filesystem, 300s timeout)
2. `exec` ran a command inside the isolated sandbox
3. `destroy` removed the container and freed resources

No network access, no filesystem writes, no privilege escalation — unless you explicitly opt in.

## Next Steps

- [Core Concepts](./concepts) — understand providers, security model, and transport
- [Python SDK Guide](../guides/python-sdk) — full Python SDK walkthrough
- [TypeScript SDK Guide](../guides/typescript-sdk) — full TypeScript SDK walkthrough
- [Framework Integration](../guides/framework-integration) — use Roche with LangChain, CrewAI, etc.
