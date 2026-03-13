---
sidebar_position: 5
---

# Providers

Roche supports multiple sandbox backends through the `SandboxProvider` trait.

## Docker (MVP)

The Docker provider uses the Docker Engine to create isolated containers.

**Requirements:** Docker Engine installed and running.

```bash
roche create --provider docker --image python:3.12-slim --memory 512m
```

**How it works:**
- Creates containers via `docker create` with security flags
- Executes commands via `docker exec`
- Destroys containers via `docker rm -f`
- Lists containers via `docker ps` with Roche label filter

**Security flags applied:**
- `--network none` (unless `--network` specified)
- `--read-only` (unless `--writable` specified)
- `--memory` limit
- `--cpus` limit
- Roche-specific labels for tracking

## Planned Providers

### Firecracker

Lightweight microVMs for stronger isolation than containers. Hardware-level boundary.

### WASM (wasmtime)

WebAssembly sandboxes for ultra-fast startup and minimal overhead. Language-level boundary.

### E2B (compatibility)

Cloud-hosted Firecracker sandboxes via E2B API. For teams already using E2B infrastructure.

### Kubernetes

Pod-based sandboxes for teams running on Kubernetes infrastructure.
