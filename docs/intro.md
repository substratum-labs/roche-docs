---
sidebar_position: 1
slug: /
---

# Roche

**Universal sandbox orchestrator for AI agents.**

Roche provides a single abstraction (`create` / `exec` / `destroy`) over multiple sandbox providers with **AI-optimized security defaults** — network disabled, filesystem readonly, timeout enforced.

> Named after [Édouard Roche](https://en.wikipedia.org/wiki/%C3%89douard_Roche) — the Roche limit is the inviolable physical boundary for celestial bodies; Roche is the inviolable execution boundary for code.

## The Problem

Every agent framework independently integrates sandbox providers, creating N×M complexity:

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

## Relationship to Castor

Castor and Roche are **orthogonal** — they solve different layers of the security stack:

| Layer | Tool | Purpose |
|-------|------|---------|
| Logical | **Castor** | Capability budgets, HITL, checkpoint/replay |
| Physical | **Roche** | Process/container/VM isolation |

Operators can optionally use Roche to manage sandbox environments for Castor tool servers. Castor does not depend on Roche.

## Quick Start

```bash
# Create a sandbox (network off, readonly FS by default)
roche create --provider docker --memory 512m

# Execute code
roche exec --sandbox <id> python3 -c "print('hello')"

# Destroy
roche destroy <id>

# List active sandboxes
roche list
```

## Status

Roche is in early development. See the [GitHub repo](https://github.com/substratum-labs/roche) for progress.
