---
sidebar_position: 6
---

# API Reference

## CLI

### `roche create`

Create a new sandbox and print its ID.

```bash
roche create [OPTIONS]
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--provider` | string | `docker` | Sandbox provider (`docker`, `firecracker`, `wasm`) |
| `--image` | string | `python:3.12-slim` | Container image |
| `--memory` | string | — | Memory limit (e.g. `512m`, `1g`) |
| `--cpus` | float | — | CPU limit (e.g. `0.5`, `2.0`) |
| `--timeout` | int | `300` | Sandbox timeout in seconds |
| `--network` | flag | off | Enable network access |
| `--writable` | flag | off | Enable writable filesystem |
| `--env` | string | — | Environment variable `KEY=VALUE` (repeatable) |
| `--mount` | string | — | Volume mount `host:container[:ro]` (repeatable) |

### `roche exec`

Execute a command inside an existing sandbox.

```bash
roche exec --sandbox <ID> [OPTIONS] -- <COMMAND...>
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--sandbox` | string | (required) | Sandbox ID |
| `--timeout` | int | — | Timeout override in seconds |

### `roche destroy`

Destroy one or more sandboxes.

```bash
roche destroy <ID...>
```

### `roche list`

List all active Roche-managed sandboxes.

```bash
roche list [OPTIONS]
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--json` | flag | off | Output as JSON |

### `roche gc`

Garbage collect expired sandboxes.

```bash
roche gc [OPTIONS]
```

| Flag | Type | Default | Description |
|------|------|---------|-------------|
| `--dry-run` | flag | off | List without destroying |
| `--all` | flag | off | Destroy all sandboxes |

---

## Python SDK

```bash
pip install roche-sandbox
```

### `Roche` (sync client)

```python
from roche_sandbox import Roche

roche = Roche(
    mode="auto",           # "auto" | "direct" (CLI only)
    daemon_port=None,      # int — override gRPC daemon port
    provider="docker",     # default provider
    binary="roche",        # path to roche CLI binary
)
```

#### `roche.create(**kwargs) -> Sandbox`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `provider` | `str \| None` | `None` (uses client default) | Override provider |
| `image` | `str` | `"python:3.12-slim"` | Container image |
| `memory` | `str \| None` | `None` | Memory limit |
| `cpus` | `float \| None` | `None` | CPU limit |
| `timeout_secs` | `int` | `300` | Sandbox timeout |
| `network` | `bool` | `False` | Enable network |
| `writable` | `bool` | `False` | Enable writable FS |
| `env` | `dict[str, str] \| None` | `None` | Environment variables |
| `mounts` | `list[Mount] \| None` | `None` | Volume mounts |

#### `roche.exec(sandbox_id, command, timeout_secs=None) -> ExecOutput`

#### `roche.destroy(sandbox_id) -> None`

#### `roche.list() -> list[SandboxInfo]`

#### `roche.gc(dry_run=False, all=False) -> list[str]`

### `Sandbox` (sync handle)

```python
sandbox.id        # str — sandbox ID
sandbox.provider  # str — provider name

sandbox.exec(command: list[str], timeout_secs: int | None = None) -> ExecOutput
sandbox.pause() -> None
sandbox.unpause() -> None
sandbox.destroy() -> None
sandbox.copy_to(host_path: str, sandbox_path: str) -> None
sandbox.copy_from(sandbox_path: str, host_path: str) -> None
```

### `AsyncRoche` / `AsyncSandbox`

Async equivalents with identical APIs. All methods are `async`.

```python
async with await roche.create(image="python:3.12-slim") as sandbox:
    output = await sandbox.exec(["echo", "hello"])
```

### Types

```python
@dataclass
class SandboxConfig:
    provider: str = "docker"
    image: str = "python:3.12-slim"
    memory: str | None = None
    cpus: float | None = None
    timeout_secs: int = 300
    network: bool = False
    writable: bool = False
    env: dict[str, str] = field(default_factory=dict)
    mounts: list[Mount] = field(default_factory=list)

@dataclass
class ExecOutput:
    exit_code: int
    stdout: str
    stderr: str

@dataclass
class SandboxInfo:
    id: str
    status: SandboxStatus
    provider: str
    image: str
    expires_at: int | None = None

@dataclass
class Mount:
    host_path: str
    container_path: str
    readonly: bool = True

SandboxStatus = Literal["running", "paused", "stopped", "failed"]
```

### Errors

| Exception | When |
|-----------|------|
| `RocheError` | Base exception for all Roche errors |
| `SandboxNotFound` | Sandbox ID does not exist |
| `SandboxPaused` | Operation attempted on a paused sandbox |
| `ProviderUnavailable` | Provider not installed or not running |
| `TimeoutError` | Operation exceeded timeout |
| `UnsupportedOperation` | Provider does not support requested operation |

---

## TypeScript SDK

```bash
npm install roche-sandbox
```

### `Roche`

```typescript
const roche = new Roche({
  mode?: "auto" | "direct",
  daemonPort?: number,
  provider?: string,
  binary?: string,
});
```

#### `roche.createSandbox(config?) -> Promise<Sandbox>`

#### `roche.exec(sandboxId, command, timeoutSecs?) -> Promise<ExecOutput>`

#### `roche.destroy(sandboxId) -> Promise<void>`

#### `roche.list() -> Promise<SandboxInfo[]>`

### `Sandbox`

```typescript
sandbox.id: string;
sandbox.provider: string;

await sandbox.exec(command: string[], timeoutSecs?: number): Promise<ExecOutput>;
await sandbox.pause(): Promise<void>;
await sandbox.unpause(): Promise<void>;
await sandbox.destroy(): Promise<void>;
await sandbox.copyTo(hostPath: string, sandboxPath: string): Promise<void>;
await sandbox.copyFrom(sandboxPath: string, hostPath: string): Promise<void>;

// Auto-cleanup with `using` (TC39 Explicit Resource Management)
await using sandbox = await roche.createSandbox();
```

### Types

```typescript
interface SandboxConfig {
  provider?: string;
  image?: string;
  memory?: string;
  cpus?: number;
  timeoutSecs?: number;
  network?: boolean;
  writable?: boolean;
  env?: Record<string, string>;
  mounts?: Mount[];
}

interface ExecOutput {
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface SandboxInfo {
  id: string;
  status: SandboxStatus;
  provider: string;
  image: string;
  expiresAt?: number;
}

interface Mount {
  hostPath: string;
  containerPath: string;
  readonly?: boolean;
}

type SandboxStatus = "running" | "paused" | "stopped" | "failed";
```

### Errors

All errors extend `RocheError`.

| Error | When |
|-------|------|
| `RocheError` | Base error |
| `SandboxNotFound` | Sandbox ID not found |
| `SandboxPaused` | Operation on paused sandbox |
| `ProviderUnavailable` | Provider not available |
| `TimeoutError` | Operation timed out |
| `UnsupportedOperation` | Provider does not support operation |

---

## Rust Crate (`roche-core`)

```toml
[dependencies]
roche-core = "0.1"
```

### Traits

```rust
pub trait SandboxProvider {
    async fn create(&self, config: &SandboxConfig) -> Result<SandboxId, ProviderError>;
    async fn exec(&self, id: &SandboxId, request: &ExecRequest) -> Result<ExecOutput, ProviderError>;
    async fn destroy(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn list(&self) -> Result<Vec<SandboxInfo>, ProviderError>;
}

pub trait SandboxFileOps {
    async fn copy_to(&self, id: &SandboxId, src: &Path, dest: &str) -> Result<(), ProviderError>;
    async fn copy_from(&self, id: &SandboxId, src: &str, dest: &Path) -> Result<(), ProviderError>;
}

pub trait SandboxLifecycle {
    async fn pause(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn unpause(&self, id: &SandboxId) -> Result<(), ProviderError>;
    async fn gc(&self) -> Result<Vec<SandboxId>, ProviderError>;
}
```

### `ProviderError`

```rust
pub enum ProviderError {
    NotFound(SandboxId),
    CreateFailed(String),
    ExecFailed(String),
    Unavailable(String),
    Timeout(u64),
    Unsupported(String),
    FileFailed(String),
    Paused(SandboxId),
}
```

### Available Providers

| Provider | Struct | Status |
|----------|--------|--------|
| Docker | `docker::DockerProvider` | Stable |
| Firecracker | `firecracker::FirecrackerProvider` | Stable |
| WASM | `wasm::WasmProvider` | Stable (feature: `wasmtime`) |
