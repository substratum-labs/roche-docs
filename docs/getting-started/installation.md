---
sidebar_position: 1
---

# Installation

## CLI (Rust)

### From source

```bash
git clone https://github.com/substratum-labs/roche.git
cd roche
cargo install --path crates/roche-cli
```

### Prerequisites

- [Rust](https://rustup.rs/) stable toolchain
- [Docker](https://docs.docker.com/get-docker/) installed and running

Verify the installation:

```bash
roche --help
```

## Python SDK

```bash
pip install roche-sandbox          # SDK only (requires Roche CLI installed separately)
pip install roche-sandbox[cli]     # SDK + auto-download prebuilt CLI binary
```

If you installed without `[cli]`, you can download the CLI later:

```bash
roche-install-cli                  # downloads from GitHub Releases
cargo install roche-cli            # or build from source
```

Requires Python >= 3.10.

```python
from roche_sandbox import Roche

roche = Roche()
sandbox = roche.create(image="python:3.12-slim")
print(f"Sandbox created: {sandbox.id}")
sandbox.destroy()
```

## TypeScript SDK

```bash
npm install roche-sandbox
```

```typescript
import { Roche } from "roche-sandbox";

const roche = new Roche();
const sandbox = await roche.createSandbox({ image: "python:3.12-slim" });
console.log(`Sandbox created: ${sandbox.id}`);
await sandbox.destroy();
```
