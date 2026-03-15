---
sidebar_position: 3
---

# Architecture

## Overview

Roche is structured as a Rust workspace with two core crates and multi-language SDKs:

```
roche/
├── crates/
│   ├── roche-core/          # Library: traits, types, providers
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── types.rs     # SandboxConfig, ExecOutput, etc.
│   │       └── provider/
│   │           ├── mod.rs          # SandboxProvider trait + ProviderError
│   │           ├── docker.rs       # Docker provider (container isolation)
│   │           ├── firecracker/    # Firecracker provider (microVM isolation)
│   │           └── wasm/           # WASM provider (wasmtime + WASI)
│   └── roche-cli/           # Binary: clap CLI
│       └── src/
│           └── main.rs      # create/exec/destroy/list/gc subcommands
├── sdk/
│   ├── python/              # Python SDK (roche-sandbox on PyPI)
│   │   └── src/roche_sandbox/
│   │       ├── client.py    # Roche / AsyncRoche
│   │       ├── sandbox.py   # Sandbox / AsyncSandbox
│   │       └── transport/   # CLI + gRPC backends
│   └── typescript/          # TypeScript SDK (roche-sandbox on npm)
│       └── src/
│           ├── client.ts    # Roche class
│           └── sandbox.ts   # Sandbox class
├── proto/                   # gRPC service definitions
└── examples/                # Agent framework integration examples
```

## Core Abstraction

The `SandboxProvider` trait defines the provider interface:

```rust
pub trait SandboxProvider {
    async fn create(&self, config: &SandboxConfig) -> Result<SandboxId, ProviderError>;
    async fn exec(&self, id: &SandboxId, request: &ExecRequest) -> Result<ExecOutput, ProviderError>;
    async fn destroy(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn list(&self) -> Result<Vec<SandboxInfo>, ProviderError>;
}
```

Additional traits for extended operations:

```rust
pub trait SandboxFileOps {
    async fn copy_to(&self, id: &SandboxId, src: &Path, dest: &str) -> Result<(), ProviderError>;
    async fn copy_from(&self, id: &SandboxId, src: &str, dest: &Path) -> Result<(), ProviderError>;
}

pub trait SandboxLifecycle {
    async fn pause(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn unpause(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn gc(&self) -> Result<Vec<SandboxId>, ProviderError>;
}
```

Any sandbox backend implements these traits. The CLI and SDKs dispatch to the appropriate provider.

## Layers

```
┌─────────────────────────────────────────┐
│  Agent Framework (LangChain, CrewAI...) │
├─────────────────────────────────────────┤
│  SDK (Python / TypeScript)              │
│  ┌──────────┐  ┌──────────┐            │
│  │ CLI Mode │  │ gRPC Mode│            │
│  └────┬─────┘  └────┬─────┘            │
├───────┼──────────────┼──────────────────┤
│  CLI / Daemon (roched)                  │
├─────────────────────────────────────────┤
│  roche-core                             │
│  ┌──────────┐ ┌────────────┐ ┌────────┐│
│  │  Docker  │ │ Firecracker│ │  WASM  ││
│  └──────────┘ └────────────┘ └────────┘│
└─────────────────────────────────────────┘
```

## Docker Provider

The Docker provider manages containers via the Docker CLI:

1. **Create** — `docker create` with security flags (`--network none`, `--read-only`, `--security-opt no-new-privileges`, `--pids-limit 256`)
2. **Exec** — `docker exec` with optional timeout override
3. **Destroy** — `docker rm -f` to force-remove the container
4. **List** — `docker ps` filtered by Roche-specific labels

Container IDs are truncated to 12 characters to match `docker ps` display format.

## SDK Transport

Both SDKs support two transport modes:

- **CLI (Direct)** — invoke the `roche` binary as a subprocess. Zero dependencies beyond the CLI.
- **gRPC (Daemon)** — connect to the `roched` daemon over gRPC for lower latency and connection pooling.

Auto-detection (`mode="auto"`) tries gRPC first, falls back to CLI.

## Ecosystem Position

```
Castor (logical security)        Roche (physical security)
├── Capability budgets           ├── Docker provider
├── HITL approval                ├── Firecracker provider
├── Checkpoint/replay            └── WASM provider
└── Context window management
```

Castor and Roche are orthogonal. An operator may use both, either, or neither.

## Design Principles

- **AI-safe by default** — all dangerous capabilities require explicit opt-in
- **Provider-agnostic** — the `SandboxProvider` trait is the only abstraction boundary
- **Framework-agnostic** — Roche has no opinion on which agent framework you use
- **Local-first** — runs entirely on your machine, no cloud dependency
