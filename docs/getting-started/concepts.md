---
sidebar_position: 3
---

# Core Concepts

## Sandbox

A sandbox is an isolated execution environment. It has:

- A **unique ID** (e.g., `abc123def456`)
- A **container image** (e.g., `python:3.12-slim`)
- **Security constraints** (network, filesystem, timeout)
- A **lifecycle**: created → running → destroyed

Sandboxes are long-lived — you create one, execute multiple commands, then destroy it.

## Provider

A provider is a backend that implements sandbox isolation. Roche currently supports:

| Provider | Isolation Level | Startup Time | Status |
|----------|----------------|-------------|--------|
| **Docker** | Container | ~2s | Stable |
| **Firecracker** | MicroVM | ~125ms | Available |
| **WASM** | Language-level | ~1ms | Experimental |

All providers implement the same `SandboxProvider` trait, so switching providers is a one-line change:

```bash
roche create --provider docker      # Container isolation
roche create --provider firecracker  # MicroVM isolation
```

## AI-Safe Defaults

Roche is built for AI agent workloads where **untrusted code execution is the norm**. Every sandbox starts locked down:

| Setting | Default | Override | Why |
|---------|---------|----------|-----|
| Network | **off** | `--network` | Prevent data exfiltration, C2 communication |
| Filesystem | **readonly** | `--writable` | Prevent persistent compromise |
| Timeout | **300s** | `--timeout` | Prevent resource exhaustion |
| PID limit | **256** | — | Prevent fork bombs |
| Privileges | **no-new-privileges** | — | Prevent privilege escalation |

The philosophy is **deny by default, opt-in explicitly**. If an agent needs network access, the operator must say so — there are no "smart defaults" that guess.

## Transport

The Python and TypeScript SDKs communicate with Roche through a **transport layer**:

1. **gRPC transport** — connects to the Roche daemon (`roched`) for best performance
2. **CLI transport** — falls back to invoking `roche` as a subprocess

Transport selection is automatic: if the daemon is running, the SDK uses gRPC. Otherwise, it falls back to CLI. You can force CLI mode:

```python
roche = Roche(mode="direct")  # Always use CLI subprocess
```

## Relationship to Castor

Roche and [Castor](https://substratum-labs.github.io/castor-docs/) are orthogonal:

| Layer | Tool | Purpose |
|-------|------|---------|
| **Logical security** | Castor | Capability budgets, HITL approval, checkpoint/replay |
| **Physical security** | Roche | Process/container/VM isolation |

An operator can use both, either, or neither. Castor manages *what tools an agent can call*. Roche manages *what system resources that tool code can access*.
