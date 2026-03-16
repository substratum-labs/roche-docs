---
sidebar_position: 3
---

# Framework Integration

Roche integrates with all major AI agent frameworks as a secure code execution backend. Each integration follows the same pattern: wrap Roche sandbox operations as a framework-native tool.

## Integration Pattern

```
Agent Framework
    │
    └── Tool: "execute_code"
         │
         └── Roche Sandbox
              ├── create (or reuse)
              ├── exec(["python3", "-c", code])
              └── return stdout/stderr
```

All examples below run in **simulated mode** by default (no API key needed) and switch to real LLM calls when the appropriate environment variable is set.

## OpenAI Agents SDK

Wrap Roche as a `@function_tool`:

```python
from agents import Agent, Runner, function_tool
from roche_sandbox import AsyncRoche

@function_tool
async def execute_code(code: str) -> str:
    """Execute Python code in a secure sandbox."""
    roche = AsyncRoche()
    sandbox = await roche.create(image="python:3.12-slim")
    try:
        result = await sandbox.exec(["python3", "-c", code])
        return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()
    finally:
        await sandbox.destroy()

agent = Agent(name="Coder", tools=[execute_code])
result = await Runner.run(agent, "Calculate fibonacci(10)")
```

:::note
OpenAI Agents SDK is async — use `AsyncRoche`, not `Roche`.
:::

**Env var:** `OPENAI_API_KEY`
**Examples:** [`examples/python/openai-agents/`](https://github.com/substratum-labs/roche/tree/main/examples/python/openai-agents)

## LangChain / LangGraph

Use the `@tool` decorator or subclass `BaseTool`:

```python
from langchain_core.tools import tool
from roche_sandbox import Roche

@tool
def sandbox_execute(code: str) -> str:
    """Execute Python code in a secure Roche sandbox."""
    roche = Roche()
    sandbox = roche.create(image="python:3.12-slim")
    try:
        result = sandbox.exec(["python3", "-c", code])
        return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()
    finally:
        sandbox.destroy()
```

For stateful workflows, use LangGraph's `StateGraph` to build code-execute-retry loops:

```python
from langgraph.graph import StateGraph, END

graph = StateGraph(AgentState)
graph.add_node("generate", generate_code)
graph.add_node("execute", execute_in_sandbox)
graph.add_conditional_edges("execute", should_retry, {"retry": "generate", "done": END})
```

**Env var:** `OPENAI_API_KEY`
**Examples:** [`examples/python/langchain/`](https://github.com/substratum-labs/roche/tree/main/examples/python/langchain)

## CrewAI

Use the `@tool` decorator:

```python
from crewai import Agent, Crew, Task
from crewai.tools import tool
from roche_sandbox import Roche

@tool("sandbox_execute")
def sandbox_execute(code: str) -> str:
    """Execute Python code in a secure Roche sandbox."""
    roche = Roche()
    sandbox = roche.create(image="python:3.12-slim")
    try:
        result = sandbox.exec(["python3", "-c", code])
        return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()
    finally:
        sandbox.destroy()

developer = Agent(role="Coder", tools=[sandbox_execute], ...)
task = Task(description="Find primes under 50", agent=developer, ...)
crew = Crew(agents=[developer], tasks=[task])
crew.kickoff()
```

**Env var:** `OPENAI_API_KEY`
**Examples:** [`examples/python/crewai/`](https://github.com/substratum-labs/roche/tree/main/examples/python/crewai)

## Anthropic API

Define a tool schema and handle `tool_use` blocks:

```python
import anthropic
from roche_sandbox import Roche

TOOL = {
    "name": "execute_code",
    "description": "Execute Python code in a secure sandbox.",
    "input_schema": {
        "type": "object",
        "properties": {"code": {"type": "string"}},
        "required": ["code"],
    },
}

client = anthropic.Anthropic()
response = client.messages.create(
    model="claude-sonnet-4-20250514",
    tools=[TOOL],
    messages=[{"role": "user", "content": "Calculate 2^10 with Python"}],
)

for block in response.content:
    if block.type == "tool_use":
        roche = Roche()
        sandbox = roche.create(image="python:3.12-slim")
        try:
            result = sandbox.exec(["python3", "-c", block.input["code"]])
            print(result.stdout)
        finally:
            sandbox.destroy()
```

**Env var:** `ANTHROPIC_API_KEY`
**Examples:** [`examples/python/anthropic/`](https://github.com/substratum-labs/roche/tree/main/examples/python/anthropic)

## AutoGen

Implement a custom `CodeExecutor`:

```python
from roche_sandbox import Roche

class RocheCodeExecutor:
    def execute_code_blocks(self, code_blocks):
        roche = Roche()
        sandbox = roche.create(image="python:3.12-slim")
        try:
            outputs = []
            for lang, code in code_blocks:
                cmd = ["python3", "-c", code] if lang.startswith("py") else ["sh", "-c", code]
                result = sandbox.exec(cmd)
                if result.exit_code != 0:
                    return {"exit_code": result.exit_code, "output": result.stderr.strip()}
                outputs.append(result.stdout.strip())
            return {"exit_code": 0, "output": "\n".join(outputs)}
        finally:
            sandbox.destroy()
```

Use with `AssistantAgent` + `UserProxyAgent` or in a `GroupChat` with planner/coder/reviewer agents.

**Env var:** `OPENAI_API_KEY`
**Examples:** [`examples/python/autogen/`](https://github.com/substratum-labs/roche/tree/main/examples/python/autogen)

## Camel-AI

Build a toolkit:

```python
from roche_sandbox import Roche

class RocheToolkit:
    def execute_code(self, code: str) -> str:
        roche = Roche()
        sandbox = roche.create(image="python:3.12-slim")
        try:
            result = sandbox.exec(["python3", "-c", code])
            return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()
        finally:
            sandbox.destroy()

    def get_tools(self):
        return [self.execute_code]
```

Use with `ChatAgent` or in `RolePlaying` sessions.

**Env var:** `OPENAI_API_KEY`
**Examples:** [`examples/python/camel/`](https://github.com/substratum-labs/roche/tree/main/examples/python/camel)

## Using the `@roche_sandbox` Decorator

Instead of manually managing sandbox lifecycle, use the `@roche_sandbox` decorator. It auto-creates and destroys a sandbox, and strips the `sandbox` parameter from the function signature so frameworks don't see it.

### OpenAI Agents SDK

```python
from agents import Agent, Runner, function_tool
from roche_sandbox import roche_sandbox

@function_tool
@roche_sandbox(image="python:3.12-slim")
async def execute_code(code: str, sandbox) -> str:
    """Execute Python code in a secure sandbox."""
    result = await sandbox.exec(["python3", "-c", code])
    return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()

agent = Agent(name="Coder", tools=[execute_code])
```

### LangChain

```python
from langchain_core.tools import tool
from roche_sandbox import roche_sandbox

@tool
@roche_sandbox(image="python:3.12-slim")
def sandbox_execute(code: str, sandbox) -> str:
    """Execute Python code in a secure Roche sandbox."""
    result = sandbox.exec(["python3", "-c", code])
    return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()
```

### CrewAI

```python
from crewai.tools import tool
from roche_sandbox import roche_sandbox

@tool("sandbox_execute")
@roche_sandbox(image="python:3.12-slim")
def sandbox_execute(code: str, sandbox) -> str:
    """Execute Python code in a secure Roche sandbox."""
    result = sandbox.exec(["python3", "-c", code])
    return result.stdout.strip() if result.exit_code == 0 else result.stderr.strip()
```

:::tip
The decorator approach eliminates boilerplate `try/finally` blocks. For simple one-shot tools, it's the recommended pattern.
:::

## Sandbox Lifecycle Tips

- **Simple tools:** Use `@roche_sandbox` decorator — zero boilerplate.
- **Basic tools (manual):** Create sandbox per call, destroy in `finally`. Simple and safe.
- **Multi-step workflows:** Create sandbox once, reuse across calls, destroy at end. Better performance.
- **Async frameworks:** Use `AsyncRoche`/`AsyncSandbox` to avoid `asyncio.run()` conflicts.
- **File I/O:** Use `copy_to`/`copy_from` to transfer data in and out of the sandbox.
