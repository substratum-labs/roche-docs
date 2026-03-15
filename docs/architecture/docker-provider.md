---
sidebar_position: 2
---

# Docker Provider

The Docker provider is the default and most mature sandbox backend. It uses the Docker CLI to manage containers.

## How It Works

### Container Lifecycle

```
create()
   │
   ├── docker create (apply security flags + resource limits)
   ├── docker start
   └── return SandboxId (first 12 chars of container ID)
         │
exec()   │
   │     │
   ├── docker exec <id> <command...>
   ├── capture stdout, stderr, exit code
   └── return ExecOutput
         │
destroy()│
   │     │
   ├── docker stop <id>
   ├── docker rm -f <id>
   └── return Ok(())
```

### Security Configuration

Every `docker create` applies these flags:

```bash
docker create \
  --network none \                    # No network (default)
  --read-only \                       # Readonly filesystem (default)
  --memory 512m \                     # Memory limit (if specified)
  --cpus 1.0 \                        # CPU limit (if specified)
  --pids-limit 256 \                  # Fork bomb protection
  --security-opt no-new-privileges \  # No privilege escalation
  --label roche.managed=true \        # Roche tracking label
  python:3.12-slim \
  sleep infinity                      # Keep container alive
```

### Why `sleep infinity`?

Containers are long-lived: create once, execute many times. The `sleep infinity` command keeps the container running between `exec` calls, avoiding cold start overhead.

### Why Docker CLI (not Engine API)?

The MVP uses `docker create`/`docker exec`/`docker rm` via `tokio::process::Command` rather than the Docker Engine HTTP API. This is deliberate:

- **Zero dependencies** — no HTTP client or socket handling needed
- **Debuggable** — you can reproduce any Roche operation with `docker` commands
- **Available everywhere** — if Docker is installed, the CLI is available

The trait interface doesn't change if we switch to the Engine API later.

## Container Labels

Roche tracks containers using Docker labels:

| Label | Value | Purpose |
|-------|-------|---------|
| `roche.managed` | `true` | Identifies Roche containers |
| `roche.sandbox_id` | `<12-char-hex>` | Sandbox ID |
| `roche.created_at` | `<ISO 8601>` | Creation timestamp |

The `list()` operation uses `docker ps --filter label=roche.managed=true` to find only Roche containers.

## Timeout Enforcement

Two levels of timeout:

1. **Sandbox timeout** (`SandboxConfig.timeout_secs`, default 300s) — the sandbox auto-expires after this duration
2. **Exec timeout** (`ExecRequest.timeout_secs`) — individual command timeout

Timeouts are enforced via `tokio::time::timeout` wrapping the `docker exec` process.

## Error Handling

| Scenario | Docker Behavior | Roche Error |
|----------|----------------|-------------|
| Docker not installed | Command not found | `ProviderError::Unavailable` |
| Docker daemon not running | Connection refused | `ProviderError::Unavailable` |
| Image doesn't exist | `docker create` fails | `ProviderError::CreateFailed` |
| Container doesn't exist | `docker exec` fails | `ProviderError::NotFound` |
| Command exceeds timeout | tokio timeout fires | `ProviderError::Timeout` |
| Container already stopped | `docker exec` fails | `ProviderError::ExecFailed` |
