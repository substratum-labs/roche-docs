---
sidebar_position: 4
---

# Security Defaults

Roche is designed for AI agent workloads where **untrusted code execution is the norm**. Every sandbox starts locked down by default.

## Default Configuration

| Setting | Default | Override | Rationale |
|---------|---------|----------|-----------|
| Network | **disabled** | `--network` | Prevent data exfiltration and C2 communication |
| Filesystem | **readonly** | `--writable` | Prevent persistent compromise and file tampering |
| Timeout | **300s** | `--timeout <secs>` | Prevent resource exhaustion and infinite loops |
| PID limit | **256** | — | Prevent fork bombs |
| Privileges | **no-new-privileges** | — | Prevent privilege escalation |
| Image | `python:3.12-slim` | `--image <img>` | Minimal attack surface |

## Comparison with Alternatives

| Aspect | Roche | E2B | Direct Docker |
|--------|-------|-----|---------------|
| Providers | Multiple (Docker, Firecracker, WASM) | Firecracker only | Docker only |
| Deployment | Local-first, no cloud dependency | Cloud-first, requires internet | Local |
| Security defaults | AI-optimized (deny-by-default) | Generic | Insecure defaults |
| Framework coupling | None — framework-agnostic | E2B SDK required | None |
| Open source | Apache-2.0 | Open source | Open source |

## Design Philosophy

The naming says it all: the [Roche limit](https://en.wikipedia.org/wiki/Roche_limit) is a hard physical boundary that cannot be crossed without destruction. Similarly, Roche enforces hard isolation boundaries around code execution.

Capabilities must be **explicitly granted**, never implicitly available:
- Need network? Say so: `--network`
- Need to write files? Say so: `--writable`
- Need more time? Say so: `--timeout 600`

This is the opposite of typical Docker defaults, where network access and writable filesystems are enabled by default. For AI agent workloads, the safe default is to deny everything and require explicit opt-in.
