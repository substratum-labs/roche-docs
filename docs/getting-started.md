---
sidebar_position: 2
---

# Getting Started

## Installation

### From source (Rust)

```bash
git clone https://github.com/substratum-labs/roche.git
cd roche
cargo install --path crates/roche-cli
```

### Python SDK

```bash
pip install roche-python
```

> **Note:** Both the CLI and Python SDK are in early development.

## Basic Usage

### CLI

```bash
# Create a sandbox with Docker (default provider)
roche create --provider docker --memory 512m

# Execute a command
roche exec --sandbox <id> python3 -c "print('hello from sandbox')"

# List running sandboxes
roche list

# Clean up
roche destroy <id>
```

### Python SDK

```python
from roche import Sandbox

# Coming soon
async with Sandbox(provider="docker", memory="512m") as sb:
    result = await sb.exec(["python3", "-c", "print('hello')"])
    print(result.stdout)
```

## Default Security

Every sandbox starts with AI-safe defaults:

- **Network:** disabled — opt in with `--network`
- **Filesystem:** readonly — opt in with `--writable`
- **Timeout:** 300 seconds — override with `--timeout`

These defaults exist because AI agent workloads frequently execute untrusted code. Roche assumes the worst and requires explicit opt-in for dangerous capabilities.
