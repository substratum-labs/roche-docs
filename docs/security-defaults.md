---
sidebar_position: 4
---

# Security Defaults

Roche is designed for AI agent workloads where **untrusted code execution is the norm**. Every sandbox starts locked down by default.

## Default Configuration

| Setting | Default | Override | Rationale |
|---------|---------|----------|-----------|
| Network | **disabled** | `--network` | Prevent data exfiltration |
| Filesystem | **readonly** | `--writable` | Prevent persistent compromise |
| Timeout | **300s** | `--timeout <secs>` | Prevent runaway processes |
| Image | `python:3.12-slim` | `--image <img>` | Minimal attack surface |

## Comparison with Alternatives

| Aspect | Roche | E2B | Direct Docker |
|--------|-------|-----|---------------|
| Providers | Multiple | Firecracker only | Docker only |
| Deployment | Local-first | Cloud-first | Local |
| Security defaults | AI-optimized | Generic | Insecure defaults |
| Framework coupling | None | E2B SDK | None |

## Design Philosophy

The naming says it all: the [Roche limit](https://en.wikipedia.org/wiki/Roche_limit) is a hard physical boundary that cannot be crossed without destruction. Similarly, Roche enforces hard isolation boundaries around code execution.

Capabilities must be **explicitly granted**, never implicitly available:
- Need network? Say so: `--network`
- Need to write files? Say so: `--writable`
- Need more time? Say so: `--timeout 600`
