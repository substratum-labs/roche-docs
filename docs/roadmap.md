---
sidebar_position: 100
---

# Roadmap

## Phase 1: MVP (Complete)

Docker provider, CLI, and Python SDK are fully functional.

| Milestone | Status | Features |
|---|---|---|
| Docker provider | Complete | create, exec, destroy, list via Docker CLI |
| CLI | Complete | AI-safe defaults, resource limits, `gc` subcommand |
| Python SDK | Complete | Sync + async clients, context manager, gRPC + CLI transport |
| TypeScript SDK | Complete | Promise-based API, `using` support, gRPC + CLI transport |
| gRPC daemon | Complete | Persistent daemon mode (`roched`) for high-throughput workloads |
| Agent framework examples | Complete | OpenAI, LangChain, CrewAI, Anthropic, AutoGen, Camel-AI |
| crates.io / PyPI publish | Complete | `roche-core`, `roche-cli` on crates.io; `roche-sandbox` on PyPI |

## Phase 2: Multi-Provider (Planned)

| Component | Priority | Description |
|---|---|---|
| Enhanced Docker | High | Docker Engine API (replace CLI subprocess), connection pooling |
| Firecracker provider | High | MicroVM-level isolation for production multi-tenant deployments |
| WASM provider | Medium | Wasmtime-based sandboxes for ultra-fast startup |
| Sandbox pooling | Medium | Pre-warmed sandbox pool to reduce cold-start latency |

## Phase 3: Ecosystem (Planned)

| Component | Priority | Description |
|---|---|---|
| E2B provider | Medium | Cloud-hosted Firecracker sandbox compatibility |
| Kubernetes provider | Medium | Pod-based sandboxes for K8s infrastructure |
| GPU support | Low | GPU passthrough for ML workloads |
| OpenTelemetry | Low | Structured observability per sandbox operation |

## Status

Roche is in active development. See the [GitHub repo](https://github.com/substratum-labs/roche) for latest progress.
