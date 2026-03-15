---
sidebar_position: 5
---

# Providers

Roche supports multiple sandbox backends through the `SandboxProvider` trait. Each provider offers a different isolation level.

## Docker (Stable)

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
- `--security-opt no-new-privileges`
- `--pids-limit 256`
- `--memory` and `--cpus` limits
- Roche-specific labels for tracking and GC

**Supported operations:** create, exec, destroy, list, pause, unpause, copy_to, copy_from, gc.

## Planned Providers

### Firecracker

Lightweight microVMs for stronger isolation than containers. Hardware-level boundary via KVM.

- **Isolation:** VM-level — separate kernel, no shared syscall surface
- **Use case:** Production multi-tenant environments requiring strong isolation guarantees
- **Config:** `--provider firecracker --kernel <path> --rootfs <path>`

### WASM (wasmtime)

WebAssembly sandboxes for ultra-fast startup and minimal overhead. Language-level boundary.

- **Isolation:** WASM sandbox — capability-based, no host access by default
- **Use case:** Lightweight tasks, rapid iteration, serverless-style execution
- **Config:** `--provider wasm`

### E2B (Compatibility)

Cloud-hosted Firecracker sandboxes via E2B API. For teams already using E2B infrastructure.

### Kubernetes

Pod-based sandboxes for teams running on Kubernetes infrastructure.

## Provider Comparison

| Provider | Isolation | Startup | Overhead | Status |
|----------|-----------|---------|----------|--------|
| Docker | Container | ~1s | Medium | Stable |
| Firecracker | MicroVM | ~125ms | Low | Planned |
| WASM | Language | ~5ms | Very low | Planned |
| E2B | MicroVM (hosted) | ~2s | Network | Planned |
| Kubernetes | Pod | ~5s | High | Planned |

All providers implement the same `SandboxProvider` trait — switching providers is a one-line change.
