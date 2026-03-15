---
sidebar_position: 1
slug: /
---

# What is Roche?

Roche is a **universal sandbox orchestrator for AI agents**. It provides a single abstraction (`create` / `exec` / `destroy`) over multiple sandbox providers (Docker, Firecracker, WASM) with **AI-optimized security defaults** — network disabled, filesystem readonly, timeout enforced.

> Named after [Édouard Roche](https://en.wikipedia.org/wiki/%C3%89douard_Roche) — the Roche limit is the inviolable physical boundary for celestial bodies; Roche is the inviolable execution boundary for code.

## The Problem

Every AI agent framework independently integrates sandbox providers, creating an N×M complexity problem:

```
LangChain ──┐         ┌── Docker
CrewAI   ───┤  N × M  ├── E2B
AutoGen  ───┘         └── Modal
```

Roche reduces this to N + M:

```
LangChain ──┐              ┌── Docker
CrewAI   ───┤── Roche() ───├── Firecracker
AutoGen  ───┘              └── WASM
```

Frameworks integrate once with Roche. Roche handles the provider abstraction internally. Switching providers is a one-line config change.

## Features

- **AI-safe defaults** — network off, readonly filesystem, 300s timeout
- **Multi-provider** — Docker, Firecracker, WASM
- **CLI + SDKs** — `roche` binary + Python & TypeScript SDKs
- **Resource limits** — memory, CPU, PID limits, timeout enforcement
- **Zero config** — sensible defaults, opt-in for dangerous capabilities
- **gRPC daemon** — persistent daemon mode for high-throughput workloads

## Relationship to Castor

[Castor](https://substratum-labs.github.io/castor-docs/) and Roche are **orthogonal** — they solve different layers of the AI agent security stack:

| Layer | Tool | Purpose |
|-------|------|---------|
| Logical | **Castor** | Capability budgets, HITL approval, checkpoint/replay |
| Physical | **Roche** | Process/container/VM isolation |

Operators can use both, either, or neither. Castor does not depend on Roche.

## Next Steps

- [Installation](./getting-started/installation) — install the CLI, Python SDK, or TypeScript SDK
- [Quickstart](./getting-started/quickstart) — create your first sandbox in 2 minutes
- [Core Concepts](./getting-started/concepts) — providers, security defaults, transport modes
- [Architecture](./architecture) — how Roche is built
