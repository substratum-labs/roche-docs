---
sidebar_position: 1
---

# Roadmap

## Phase 1 — MVP (Complete)

- [x] Docker provider (create / exec / destroy / list)
- [x] CLI with clap (`roche create`, `exec`, `destroy`, `list`)
- [x] Python SDK (`roche-sandbox` on PyPI)
- [x] AI-safe defaults (network off, readonly FS, timeout, PID limit)
- [x] Integration tests

## Phase 2 — Multi-Provider + Daemon (In Progress)

- [x] gRPC daemon (`roched`) for persistent sandbox management
- [x] Firecracker provider (microVM isolation)
- [x] TypeScript SDK (`roche-sandbox` on npm)
- [x] Enhanced Docker provider (pause/unpause, copy, garbage collection)
- [ ] WASM provider (wasmtime) — experimental
- [ ] Sandbox pooling (pre-warmed containers for reduced cold start)

## Phase 3 — Ecosystem Integration

- [ ] E2B provider (cloud-hosted Firecracker compatibility)
- [ ] Kubernetes provider (pod-based sandboxes)
- [ ] GPU passthrough support
- [ ] OpenTelemetry metrics and tracing
- [ ] MCP server (expose sandbox as Model Context Protocol tools)

## Phase 4 — Production Hardening

- [ ] Sandbox snapshot and restore
- [ ] Multi-tenant resource quotas
- [ ] Audit logging
- [ ] Web dashboard for sandbox management
