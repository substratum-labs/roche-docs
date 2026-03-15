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

## Firecracker (Stable)

Lightweight microVMs for stronger isolation than containers. Hardware-level boundary via KVM.

**Requirements:** Linux with KVM enabled, Firecracker binary installed, kernel image and rootfs.

```bash
roche create --provider firecracker --kernel /path/to/vmlinux --rootfs /path/to/rootfs.ext4 --memory 512m
```

**How it works:**
- Spawns Firecracker process, configures VM via REST API over Unix socket
- Executes commands via vsock protocol (guest agent listens on vsock port 52)
- State stored in `~/.roche/firecracker/<vm-id>/`
- Cross-platform compilation; runtime check returns `ProviderError::Unavailable` on non-Linux

**Supported operations:** create, exec, destroy, list, pause, unpause, gc.

**Not supported (MVP):** copy_to, copy_from (requires SSH or virtio-fs).

## WASM / Wasmtime (Stable)

WebAssembly sandboxes for ultra-fast startup and minimal overhead. Language-level boundary via WASI.

**Requirements:** Cargo feature `wasmtime` enabled at build time.

```bash
roche create --provider wasm --image /path/to/module.wasm
```

**How it works:**
- Pre-compiles `.wasm` module at create time (AOT compilation)
- Each `exec()` instantiates a fresh WASI context with captured stdout/stderr
- Sandboxes stored in-memory (no filesystem state)
- Mounts map to WASI preopened directories

**Supported operations:** create, exec, destroy, list, gc.

**Not supported:** pause, unpause (WASM is per-exec, no persistent process), copy_to, copy_from, network (WASI does not expose sockets).

## Planned Providers

### E2B (Compatibility)

Cloud-hosted Firecracker sandboxes via E2B API. For teams already using E2B infrastructure.

### Kubernetes

Pod-based sandboxes for teams running on Kubernetes infrastructure.

## Provider Comparison

| Provider | Isolation | Startup | Overhead | Status |
|----------|-----------|---------|----------|--------|
| Docker | Container | ~1s | Medium | Stable |
| Firecracker | MicroVM | ~125ms | Low | Stable |
| WASM | Language | ~5ms | Very low | Stable |
| E2B | MicroVM (hosted) | ~2s | Network | Planned |
| Kubernetes | Pod | ~5s | High | Planned |

All providers implement the same `SandboxProvider` trait — switching providers is a one-line change.
