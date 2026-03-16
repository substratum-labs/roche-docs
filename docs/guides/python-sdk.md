---
sidebar_position: 1
---

# Python SDK

The Python SDK provides both sync and async APIs for managing Roche sandboxes.

## Installation

```bash
pip install roche-sandbox          # SDK only (requires Roche CLI installed separately)
pip install roche-sandbox[cli]     # SDK + auto-download prebuilt CLI binary
```

Requires Python >= 3.10.

## Sync API

### Basic Usage

```python
from roche_sandbox import Roche

roche = Roche()
sandbox = roche.create(image="python:3.12-slim")

output = sandbox.exec(["python3", "-c", "print('Hello!')"])
print(output.stdout)   # Hello!\n
print(output.exit_code) # 0

sandbox.destroy()
```

### Context Manager

```python
with roche.create(image="python:3.12-slim") as sandbox:
    output = sandbox.exec(["echo", "auto-cleanup"])
# sandbox destroyed automatically
```

### Configuration

```python
sandbox = roche.create(
    image="python:3.12-slim",
    memory="512m",
    cpus=1.0,
    timeout_secs=600,
    network=False,      # default: AI-safe
    writable=False,     # default: AI-safe
    env={"API_KEY": "secret"},
)
```

### File Operations

```python
# Upload a file to the sandbox
sandbox.copy_to("/local/data.csv", "/data/data.csv")

# Download a file from the sandbox
sandbox.copy_from("/output/result.json", "/local/result.json")
```

### Pause / Resume

```python
sandbox.pause()    # Freeze all processes
sandbox.unpause()  # Resume execution
```

## Async API

For use in async frameworks (FastAPI, OpenAI Agents SDK, etc.).

```python
import asyncio
from roche_sandbox import AsyncRoche

async def main():
    roche = AsyncRoche()

    async with await roche.create(image="python:3.12-slim") as sandbox:
        output = await sandbox.exec(["python3", "-c", "print('async!')"])
        print(output.stdout)

asyncio.run(main())
```

:::warning
The sync `Roche`/`Sandbox` classes use `asyncio.run()` internally. They **cannot** be used inside an already-running event loop. If your framework is async (OpenAI Agents SDK, LangGraph async mode), use `AsyncRoche`/`AsyncSandbox` instead.
:::

## `@roche_sandbox` Decorator

The decorator automatically creates and injects a sandbox into your function — no manual lifecycle management needed. Works with both sync and async functions.

```python
from roche_sandbox import roche_sandbox

@roche_sandbox(image="python:3.12-slim")
def run_code(code: str, sandbox) -> str:
    result = sandbox.exec(["python3", "-c", code])
    return result.stdout

output = run_code("print('hello')")  # sandbox is auto-managed
```

### Async

```python
@roche_sandbox(image="python:3.12-slim")
async def run_code(code: str, sandbox) -> str:
    result = await sandbox.exec(["python3", "-c", code])
    return result.stdout
```

### Agent Framework Integration

The decorator strips the `sandbox` parameter from the function signature, so agent frameworks only see user-facing parameters:

```python
from agents import function_tool

@function_tool
@roche_sandbox(image="python:3.12-slim")
def run_code(code: str, sandbox) -> str:
    """Execute Python code in a sandbox."""
    return sandbox.exec(["python3", "-c", code]).stdout
```

### Decorator Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `image` | `str` | `"python:3.12-slim"` | Container image |
| `provider` | `str` | `"docker"` | Sandbox provider |
| `network` | `bool` | `False` | Enable network access |
| `writable` | `bool` | `False` | Enable writable filesystem |
| `timeout_secs` | `int` | `300` | Sandbox timeout |
| `memory` | `str \| None` | `None` | Memory limit (e.g. `"512m"`) |
| `cpus` | `float \| None` | `None` | CPU limit |
| `sandbox_param` | `str` | `"sandbox"` | Name of the injected parameter |

## Transport

The SDK auto-detects the best transport:

1. Checks for a running Roche daemon → uses gRPC (fastest)
2. Falls back to CLI subprocess → invokes `roche` binary

Force CLI mode:

```python
roche = Roche(mode="direct")
```

Force a specific daemon port:

```python
roche = Roche(daemon_port=50051)
```

## Client Operations

Beyond the `Sandbox` handle, the `Roche` client provides direct operations:

```python
# List all active sandboxes
sandboxes = roche.list()
for s in sandboxes:
    print(f"{s.id} ({s.status}) - {s.image}")

# Execute on a sandbox by ID
output = roche.exec("abc123def456", ["echo", "hello"])

# Destroy by ID
roche.destroy("abc123def456")

# Garbage collect expired sandboxes
destroyed = roche.gc()
```

## Error Handling

```python
from roche_sandbox import (
    RocheError,
    SandboxNotFound,
    SandboxPaused,
    ProviderUnavailable,
    TimeoutError,
)

try:
    sandbox.exec(["long-running-command"])
except TimeoutError:
    print("Command timed out")
except SandboxNotFound:
    print("Sandbox was destroyed")
except ProviderUnavailable:
    print("Docker is not running")
except RocheError as e:
    print(f"Unexpected error: {e}")
```

## Public Exports

```python
from roche_sandbox import (
    # Clients
    Roche, AsyncRoche,
    # Sandbox handles
    Sandbox, AsyncSandbox,
    # Decorator
    roche_sandbox,
    # Types
    SandboxConfig, ExecOutput, SandboxInfo, Mount, SandboxStatus,
    # Errors
    RocheError, SandboxNotFound, SandboxPaused,
    ProviderUnavailable, TimeoutError, UnsupportedOperation,
)
```
