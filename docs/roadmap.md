---
sidebar_position: 100
---

# Roadmap

## Phase 1: MVP (Complete)

Docker provider, CLI, and Python SDK are fully functional.

| Milestone | Status | Features |
|---|---|---|
| Docker provider | Complete | create, exec, destroy, list, pause, unpause, copy, gc |
| CLI | Complete | AI-safe defaults, resource limits, `gc` subcommand |
| Python SDK | Complete | Sync + async clients, context manager, gRPC + CLI transport |
| TypeScript SDK | Complete | Promise-based API, `using` support, gRPC + CLI transport |
| gRPC daemon | Complete | Persistent daemon mode (`roched`) for high-throughput workloads |
| Agent framework examples | Complete | OpenAI, LangChain, CrewAI, Anthropic, AutoGen, Camel-AI |
| crates.io / PyPI publish | Complete | `roche-core`, `roche-cli` on crates.io; `roche-sandbox` on PyPI |

## Phase 2: Multi-Provider (Complete)

| Milestone | Status | Features |
|---|---|---|
| Enhanced Docker | Complete | File transfer, volume mounts, pause/unpause, timeout GC, batch ops |
| Firecracker provider | Complete | MicroVM isolation via KVM, vsock exec, state directory management |
| WASM provider | Complete | Wasmtime + WASI, AOT compilation, in-memory sandbox registry |

## Phase 3: Ecosystem (Planned)

| Component | Priority | Description |
|---|---|---|
| Sandbox pooling | High | Pre-warmed sandbox pool to reduce cold-start latency |
| E2B provider | Medium | Cloud-hosted Firecracker sandbox compatibility |
| Kubernetes provider | Medium | Pod-based sandboxes for K8s infrastructure |
| GPU support | Low | GPU passthrough for ML workloads |
| OpenTelemetry | Low | Structured observability per sandbox operation |

## Status

Roche is in active development. See the [GitHub repo](https://github.com/substratum-labs/roche) for latest progress.
