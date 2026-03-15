---
sidebar_position: 1
---

# Architecture Overview

Roche is a layered system: users interact through CLI or SDKs, which dispatch operations to sandbox providers via a unified trait.

## System Layers

```
┌─────────────────────────────────────────────────────┐
│                   User Layer                         │
│                                                     │
│   CLI (roche)    Python SDK    TypeScript SDK        │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│               roche-core (Library)                   │
│                                                     │
│  ┌────────────────────────────────────────────────┐  │
│  │           SandboxProvider trait                 │  │
│  │  create() / exec() / destroy() / list()        │  │
│  └────────────────────┬───────────────────────────┘  │
│                       │                              │
│         ┌─────────────┼──────────────┐               │
│         ▼             ▼              ▼               │
│  ┌───────────┐ ┌────────────┐ ┌───────────┐         │
│  │  Docker   │ │ Firecracker│ │   WASM    │         │
│  │ Provider  │ │ Provider   │ │ Provider  │         │
│  └───────────┘ └────────────┘ └───────────┘         │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│               Sandbox Runtime                        │
│                                                     │
│    Docker Engine    Firecracker VMM    wasmtime      │
└─────────────────────────────────────────────────────┘
```

## Crate Structure

Roche is a Rust workspace with clear separation of concerns:

| Crate | Role | Dependencies |
|-------|------|-------------|
| `roche-core` | Library: traits, types, provider implementations | tokio, serde, thiserror |
| `roche-cli` | Binary: CLI argument parsing and output formatting | roche-core, clap |
| `roche-daemon` | gRPC daemon for long-running sandbox management | roche-core, tonic |

**Key rule:** `roche-core` contains no CLI logic, no IO formatting, no user interaction. SDKs depend on roche-core's type definitions (via JSON schema or gRPC proto).

## Core Traits

### SandboxProvider

Required for all providers. Defines the four fundamental operations:

```rust
pub trait SandboxProvider {
    async fn create(&self, config: &SandboxConfig) -> Result<SandboxId, ProviderError>;
    async fn exec(&self, id: &SandboxId, request: &ExecRequest) -> Result<ExecOutput, ProviderError>;
    async fn destroy(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn list(&self) -> Result<Vec<SandboxInfo>, ProviderError>;
}
```

### SandboxFileOps (optional)

File transfer between host and sandbox:

```rust
pub trait SandboxFileOps {
    async fn copy_to(&self, id: &SandboxId, src: &Path, dest: &str) -> Result<(), ProviderError>;
    async fn copy_from(&self, id: &SandboxId, src: &str, dest: &Path) -> Result<(), ProviderError>;
}
```

### SandboxLifecycle (optional)

Pause/resume and garbage collection:

```rust
pub trait SandboxLifecycle {
    async fn pause(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn unpause(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn gc(&self) -> Result<Vec<SandboxId>, ProviderError>;
}
```

## Core Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `SandboxConfig` | Creation parameters | provider, image, memory, cpus, timeout_secs, network, writable, env, mounts |
| `ExecOutput` | Command result | exit_code, stdout, stderr |
| `SandboxInfo` | Sandbox metadata | id, status, provider, image, expires_at |
| `ProviderError` | Error variants | NotFound, CreateFailed, ExecFailed, Unavailable, Timeout, Unsupported, Paused |

## SDK Architecture

Both SDKs follow the same pattern:

```
SDK Client (Roche / AsyncRoche)
    │
    ├── detect daemon
    │
    ├── gRPC Transport ──→ roched (daemon) ──→ Provider
    │
    └── CLI Transport ──→ roche binary ──→ Provider
```

Transport selection is automatic. The SDK checks for a running daemon; if unavailable, it falls back to CLI subprocess invocation.

## Ecosystem Position

```
Agent Framework (LangChain, CrewAI, AutoGen, ...)
    │
    ├── Castor    ← Logical security (budgets, HITL, replay)
    │
    └── Roche     ← Physical security (container/VM isolation)
         │
         ├── Docker provider
         ├── Firecracker provider
         └── WASM provider
```

Castor and Roche are orthogonal — they solve different layers of the AI agent security stack.
