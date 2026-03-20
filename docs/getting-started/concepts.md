---
sidebar_position: 3
---

# Core Concepts

## Sandbox Lifecycle

Every sandbox follows a simple lifecycle:

```
create → exec (repeatable) → destroy
```

- **Create** — launch an isolated environment, get back a sandbox ID
- **Exec** — run commands inside the sandbox (repeatable)
- **Destroy** — tear down the sandbox and free resources

Additional lifecycle operations:

- **Pause / Unpause** — suspend and resume a sandbox without destroying it
- **Copy To / Copy From** — transfer files between host and sandbox
- **GC** — garbage collect expired sandboxes

## Providers

A **provider** is a sandbox backend. Roche abstracts over multiple providers through the `SandboxProvider` trait:

| Provider | Isolation Level | Status | Use Case |
|----------|----------------|--------|----------|
| **Docker** | Container | Stable | General purpose, development, CI |
| **Firecracker** | MicroVM | Stable | Production, multi-tenant, strong isolation |
| **WASM** | Language sandbox | Stable | Ultra-fast startup, lightweight tasks |

All providers implement the same interface. Switching providers is a one-line change:

```bash
roche create --provider docker    # container isolation
roche create --provider firecracker  # microVM isolation
```

## Security Defaults

Roche is designed for AI agent workloads where **untrusted code execution is the norm**. Every sandbox starts locked down:

| Setting | Default | Override | Rationale |
|---------|---------|----------|-----------|
| Network | **disabled** | `--network` | Prevent data exfiltration and C2 communication |
| Filesystem | **readonly** | `--writable` | Prevent persistent compromise and file tampering |
| Timeout | **300s** | `--timeout` | Prevent resource exhaustion and infinite loops |
| PID limit | **256** | — | Prevent fork bombs |
| Privileges | **no-new-privileges** | — | Prevent privilege escalation |

Capabilities must be **explicitly granted**, never implicitly available. This is the opposite of typical Docker defaults.

## Transport Modes

The SDKs support two transport modes for communicating with the Roche backend:

### CLI Mode (Direct)

The SDK invokes the `roche` CLI binary as a subprocess for each operation. Simple, no daemon required.

```python
roche = Roche(mode="direct")  # force CLI mode
```

### Daemon Mode (gRPC)

The Roche daemon (`roched`) runs as a persistent gRPC server. The SDK connects over gRPC for lower latency and connection pooling.

```bash
# Start the daemon
roched --port 50051

# SDK auto-detects the daemon
roche = Roche()  # mode="auto" by default
```

### Auto Mode (Default)

By default, the SDK uses `mode="auto"` — it tries to connect to the gRPC daemon first, and falls back to CLI mode if the daemon is unavailable.

## Resource Limits

Sandboxes can be constrained with resource limits:

```bash
roche create \
  --memory 512m \     # Memory limit (e.g. 512m, 1g)
  --cpus 0.5 \        # CPU limit (e.g. 0.5, 1.0, 2.0)
  --timeout 60        # Timeout in seconds
```

```python
sandbox = roche.create(
    memory="512m",
    cpus=0.5,
    timeout_secs=60,
)
```

## Environment Variables and Mounts

Pass environment variables and mount host directories into sandboxes:

```bash
roche create --env API_KEY=secret --env DEBUG=1
```

```python
sandbox = roche.create(
    env={"API_KEY": "secret", "DEBUG": "1"},
    mounts=[Mount(host_path="./data", container_path="/data", readonly=True)],
)
```

Mounts are readonly by default — consistent with the AI-safe philosophy.

## Next Steps

- [Architecture](../architecture/overview) — how Roche is structured internally
- [Python SDK Guide](../guides/python-sdk) — detailed Python API walkthrough
- [Security Model](../architecture/security-model) — deep dive into the security model
