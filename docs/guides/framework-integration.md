---
sidebar_position: 3
---

# Framework Integration

Roche is framework-agnostic — it works with any AI agent framework. This guide shows integration patterns for the six supported frameworks.

All examples run in **simulated mode** by default (no API key needed). Set the appropriate env var to enable real LLM calls.

## OpenAI Agents SDK

Use Roche as a `@function_tool` that agents can call to execute code:

```python
from roche_sandbox import Roche

roche = Roche()

def run_code_in_sandbox(code: str) -> str:
    """Execute Python code in a Roche sandbox."""
    with roche.create(image="python:3.12-slim") as sandbox:
        output = sandbox.exec(["python3", "-c", code])
        if output.exit_code != 0:
            return f"Error:\n{output.stderr}"
        return output.stdout
```

```bash
pip install openai-agents roche-sandbox
OPENAI_API_KEY=sk-... python examples/python/openai-agents/basic_tool.py
```

## LangChain / LangGraph

Create a custom `BaseTool` or use Roche in a LangGraph workflow with stateful retry:

```python
from roche_sandbox import Roche
from langchain_core.tools import BaseTool

class RocheSandboxTool(BaseTool):
    name = "sandbox"
    description = "Execute code in a secure sandbox"

    def _run(self, code: str) -> str:
        roche = Roche()
        with roche.create(image="python:3.12-slim") as sandbox:
            output = sandbox.exec(["python3", "-c", code])
            return output.stdout if output.exit_code == 0 else output.stderr
```

```bash
pip install langchain langchain-openai langgraph roche-sandbox
OPENAI_API_KEY=sk-... python examples/python/langchain/basic_tool.py
```

## CrewAI

Use the `@tool` decorator to make Roche available to CrewAI agents:

```python
from crewai.tools import tool
from roche_sandbox import Roche

roche = Roche()

@tool("sandbox_executor")
def execute_code(code: str) -> str:
    """Execute Python code in a secure Roche sandbox."""
    with roche.create(image="python:3.12-slim") as sandbox:
        output = sandbox.exec(["python3", "-c", code])
        return output.stdout if output.exit_code == 0 else output.stderr
```

```bash
pip install crewai roche-sandbox
OPENAI_API_KEY=sk-... python examples/python/crewai/basic_task.py
```

## Anthropic API

Use Roche as a `tool_use` tool in a multi-turn agentic loop:

```python
from roche_sandbox import Roche

roche = Roche()

# Define the tool for Claude
sandbox_tool = {
    "name": "execute_code",
    "description": "Execute Python code in a secure sandbox",
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {"type": "string", "description": "Python code to execute"}
        },
        "required": ["code"]
    }
}

def handle_tool_call(code: str) -> str:
    with roche.create(image="python:3.12-slim") as sandbox:
        output = sandbox.exec(["python3", "-c", code])
        return output.stdout if output.exit_code == 0 else output.stderr
```

```bash
pip install anthropic roche-sandbox
ANTHROPIC_API_KEY=sk-ant-... python examples/python/anthropic/basic_tool.py
```

## AutoGen

Implement a custom `CodeExecutor` that routes execution through Roche:

```python
from roche_sandbox import Roche

roche = Roche()

class RocheExecutor:
    """AutoGen-compatible code executor using Roche sandboxes."""

    def execute_code_blocks(self, code_blocks):
        results = []
        with roche.create(image="python:3.12-slim", writable=True) as sandbox:
            for block in code_blocks:
                output = sandbox.exec(["python3", "-c", block.code])
                results.append(output)
        return results
```

```bash
pip install pyautogen roche-sandbox
OPENAI_API_KEY=sk-... python examples/python/autogen/basic_executor.py
```

## Camel-AI

Create a `BaseToolkit` that exposes Roche to Camel's role-playing agents:

```python
from roche_sandbox import Roche

roche = Roche()

class RocheToolkit:
    """Camel-AI toolkit for sandbox code execution."""

    def execute_code(self, code: str) -> str:
        with roche.create(image="python:3.12-slim") as sandbox:
            output = sandbox.exec(["python3", "-c", code])
            return output.stdout if output.exit_code == 0 else output.stderr
```

```bash
pip install camel-ai roche-sandbox
OPENAI_API_KEY=sk-... python examples/python/camel/basic_tool.py
```

## Integration Pattern

The common pattern across all frameworks:

1. **Create** a `Roche()` client
2. **Wrap** sandbox creation in a context manager (`with`)
3. **Expose** `sandbox.exec()` as a tool/function the agent can call
4. **Return** stdout on success, stderr on failure

Roche handles isolation, resource limits, and cleanup. Your framework handles tool registration, LLM routing, and agent orchestration.

## Full Examples

Complete working examples (basic + advanced) for each framework are in the [examples directory](https://github.com/substratum-labs/roche/tree/main/examples/python).
