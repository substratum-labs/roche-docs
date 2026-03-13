---
sidebar_position: 3
---

# Architecture

## Overview

Roche is structured as a Rust workspace with two crates:

```
roche/
├── crates/
│   ├── roche-core/     # Library: traits, types, providers
│   │   └── src/
│   │       ├── lib.rs
│   │       ├── types.rs         # SandboxConfig, ExecOutput, etc.
│   │       └── provider/
│   │           ├── mod.rs       # SandboxProvider trait
│   │           └── docker.rs    # Docker provider
│   └── roche-cli/      # Binary: clap CLI
│       └── src/
│           └── main.rs          # create/exec/destroy/list
└── sdk/
    └── python/          # Python SDK (future: PyO3 bindings)
```

## Core Abstraction

The `SandboxProvider` trait defines four operations:

```rust
pub trait SandboxProvider {
    async fn create(&self, config: &SandboxConfig) -> Result<SandboxId, ProviderError>;
    async fn exec(&self, id: &SandboxId, request: &ExecRequest) -> Result<ExecOutput, ProviderError>;
    async fn destroy(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn list(&self) -> Result<Vec<SandboxInfo>, ProviderError>;
}
```

Any sandbox backend implements this trait. The CLI and SDKs dispatch to the appropriate provider.

## Ecosystem Position

```
Agent Framework (LangChain, CrewAI, etc.)
    │
    ├── Castor    ← Logical security (budgets, HITL, replay)
    │
    └── Roche     ← Physical security (container/VM isolation)
         │
         ├── Docker provider
         ├── Firecracker provider (planned)
         └── WASM provider (planned)
```

Castor and Roche are orthogonal. An operator may use both, either, or neither.
