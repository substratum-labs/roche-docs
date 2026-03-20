---
sidebar_position: 1
---

# Python SDK

The Python SDK (`roche-sandbox`) provides both synchronous and asynchronous APIs for managing sandboxes.

## Installation

```bash
pip install roche-sandbox
```

Requirements: Python >= 3.10, Roche CLI on `PATH` or daemon running.

## Client

### Sync Client

```python
from roche_sandbox import Roche

roche = Roche(
    mode="auto",           # "auto" | "direct" (CLI only)
    daemon_port=None,      # int — override gRPC daemon port
    provider="docker",     # default provider
    binary="roche",        # path to roche CLI binary
)
```

### Async Client

```python
from roche_sandbox import AsyncRoche

roche = AsyncRoche()
sandbox = await roche.create(image="python:3.12-slim")
output = await sandbox.exec(["echo", "hello"])
await sandbox.destroy()
```

## Creating Sandboxes

```python
sandbox = roche.create(
    image="python:3.12-slim",    # container image
    memory="512m",               # memory limit
    cpus=1.0,                    # CPU limit
    timeout_secs=600,            # sandbox timeout
    network=False,               # enable network (default: off)
    writable=False,              # enable writable FS (default: off)
    env={"API_KEY": "secret"},   # environment variables
    mounts=[Mount(host_path="./data", container_path="/data", readonly=True)],
)
```

## Sandbox Operations

```python
# Execute commands
output = sandbox.exec(["python3", "-c", "print('hello')"])
print(output.stdout)       # "hello\n"
print(output.stderr)       # ""
print(output.exit_code)    # 0

# Pause and unpause
sandbox.pause()
sandbox.unpause()

# Copy files
sandbox.copy_to("./local/file.py", "/sandbox/file.py")
sandbox.copy_from("/sandbox/output.json", "./local/output.json")

# Destroy
sandbox.destroy()
```

## Context Manager

Use `with` for automatic cleanup:

```python
with roche.create(image="python:3.12-slim") as sandbox:
    output = sandbox.exec(["echo", "hello"])
    print(output.stdout)
# sandbox automatically destroyed, even on exceptions
```

Async equivalent:

```python
async with await roche.create(image="python:3.12-slim") as sandbox:
    output = await sandbox.exec(["echo", "hello"])
```

## Client-Level Operations

```python
# List all active sandboxes
sandboxes = roche.list()
for sb in sandboxes:
    print(f"{sb.id} ({sb.status}) - {sb.image}")

# Garbage collect expired sandboxes
destroyed_ids = roche.gc(dry_run=False)

# Execute on existing sandbox by ID
output = roche.exec("abc123def456", ["echo", "hello"])

# Destroy by ID
roche.destroy("abc123def456")
```

## Error Handling

All errors inherit from `RocheError`:

```python
from roche_sandbox import RocheError, SandboxNotFound, ProviderUnavailable

try:
    sandbox = roche.create()
except ProviderUnavailable:
    print("Docker is not running")

try:
    sandbox.exec(["echo", "hello"])
except SandboxNotFound:
    print("Sandbox was destroyed")
except RocheError as e:
    print(f"Roche error: {e}")
```

| Exception | When |
|-----------|------|
| `RocheError` | Base exception for all Roche errors |
| `SandboxNotFound` | Sandbox ID does not exist |
| `SandboxPaused` | Operation attempted on a paused sandbox |
| `ProviderUnavailable` | Provider not installed or not running |
| `TimeoutError` | Operation exceeded timeout |
| `UnsupportedOperation` | Provider does not support requested operation |

## Types

```python
from roche_sandbox import SandboxConfig, ExecOutput, SandboxInfo, Mount, SandboxStatus

# SandboxStatus is a Literal type
SandboxStatus = Literal["running", "paused", "stopped", "failed"]
```

## Transport

The SDK auto-detects whether the Roche gRPC daemon is running:

- **Auto mode** (default): tries gRPC, falls back to CLI
- **Direct mode**: forces CLI subprocess transport

```python
roche = Roche(mode="direct")  # always use CLI
```

## Further Reading

- [API Reference](../api-reference) — complete type and method reference
- [Framework Integration](./framework-integration) — use with LangChain, CrewAI, etc.
