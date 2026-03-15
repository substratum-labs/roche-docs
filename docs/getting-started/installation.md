---
sidebar_position: 1
---

# Installation

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed and running
- [Rust](https://rustup.rs/) toolchain (for building the CLI from source)

## CLI

### From source

```bash
git clone https://github.com/substratum-labs/roche.git
cd roche
cargo install --path crates/roche-cli
```

### From crates.io

```bash
cargo install roche-cli
```

### Verify

```bash
roche --help
```

## Python SDK

```bash
pip install roche-sandbox
```

Requirements: Python >= 3.10, Roche CLI on `PATH` (or Roche daemon running).

### Verify

```python
from roche_sandbox import Roche
roche = Roche()
print("roche-sandbox installed successfully")
```

## TypeScript SDK

```bash
npm install roche-sandbox
```

Requirements: Node.js >= 18, Roche CLI on `PATH` (or Roche daemon running).

### Verify

```typescript
import { Roche } from "roche-sandbox";
const roche = new Roche();
console.log("roche-sandbox installed successfully");
```

## Development Setup

To work on Roche itself:

```bash
git clone https://github.com/substratum-labs/roche.git
cd roche

# Rust
cargo build              # Build all crates
cargo test               # Run tests
cargo clippy             # Lint
cargo fmt --check        # Check formatting

# Python SDK
pip install -e "sdk/python[dev]"
pytest sdk/python/tests/ -v

# TypeScript SDK
cd sdk/typescript && npm ci && npm run build
```
