---
sidebar_position: 4
---

# Examples

Real-world examples showing how to use Roche for common AI agent patterns. All code is available in the [examples directory](https://github.com/substratum-labs/roche/tree/main/examples).

## Basic Usage

### Hello World

The simplest possible Roche program — create, exec, destroy:

```python
from roche_sandbox import Roche

roche = Roche()

sandbox = roche.create(image="python:3.12-slim")
output = sandbox.exec(["python3", "-c", "print('Hello from Roche!')"])
print(output.stdout)   # Hello from Roche!
print(output.exit_code) # 0
sandbox.destroy()
```

### Context Manager (Auto-Cleanup)

Use `with` to auto-destroy the sandbox, even if exceptions occur:

```python
from roche_sandbox import Roche

roche = Roche()

with roche.create(image="python:3.12-slim") as sandbox:
    # Run multiple commands in sequence
    for cmd in ["echo hello", "python3 -c 'print(2+2)'", "uname -a"]:
        output = sandbox.exec(["sh", "-c", cmd])
        print(f"$ {cmd}")
        print(f"  {output.stdout.strip()}")
# sandbox auto-destroyed here
```

### Async with Multiple Commands

```python
import asyncio
from roche_sandbox import AsyncRoche

async def main():
    roche = AsyncRoche()

    async with await roche.create(image="python:3.12-slim") as sandbox:
        # Sequential execution in the same sandbox
        for cmd in ["echo hello", "python3 -c 'print(2+2)'", "uname -a"]:
            output = await sandbox.exec(["sh", "-c", cmd])
            print(f"$ {cmd}")
            print(f"  {output.stdout.strip()}")

asyncio.run(main())
```

### TypeScript

```typescript
import { Roche } from "roche-sandbox";

async function main() {
  const roche = new Roche();
  const sandbox = await roche.createSandbox({ image: "python:3.12-slim" });

  const output = await sandbox.exec(["python3", "-c", "print('Hello from Roche!')"]);
  console.log(`stdout: ${output.stdout.trim()}`);
  console.log(`exit code: ${output.exitCode}`);

  const sandboxes = await roche.list();
  console.log(`Active sandboxes: ${sandboxes.length}`);

  await sandbox.destroy();
}

main().catch(console.error);
```

---

## File I/O: Upload Data, Process, Download Results

A common agent pattern — upload input files, run analysis code, retrieve output:

```python
import tempfile
from roche_sandbox import AsyncRoche

SAMPLE_CSV = """\
name,score
Alice,95
Bob,87
Charlie,92
Diana,88
Eve,91
"""

async def analyze_scores():
    roche = AsyncRoche()
    # writable=True needed because we write output files
    sandbox = await roche.create(image="python:3.12-slim", writable=True)

    try:
        # 1. Upload data to the sandbox
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write(SAMPLE_CSV)
            tmp_csv = f.name

        await sandbox.exec(["mkdir", "-p", "/data", "/output"])
        await sandbox.copy_to(tmp_csv, "/data/scores.csv")
        print("Uploaded scores.csv")

        # 2. Process data inside the sandbox
        code = """\
import csv

with open("/data/scores.csv") as f:
    rows = list(csv.DictReader(f))

scores = [int(r["score"]) for r in rows]
avg = sum(scores) / len(scores)
top = max(rows, key=lambda r: int(r["score"]))

print(f"Average score: {avg:.1f}")
print(f"Top student: {top['name']} ({top['score']})")

with open("/output/summary.txt", "w") as f:
    f.write(f"Average: {avg:.1f}\\nTop: {top['name']}\\n")
print("Summary written to /output/summary.txt")
"""
        result = await sandbox.exec(["python3", "-c", code])
        print(result.stdout)

        # 3. Download results from the sandbox
        with tempfile.NamedTemporaryFile(suffix=".txt", delete=False) as f:
            tmp_out = f.name
        await sandbox.copy_from("/output/summary.txt", tmp_out)
        with open(tmp_out) as f:
            print(f"Retrieved summary:\n{f.read()}")

    finally:
        await sandbox.destroy()
```

**Output:**
```
Uploaded scores.csv
Average score: 90.6
Top student: Alice (95)
Summary written to /output/summary.txt

Retrieved summary:
Average: 90.6
Top: Alice
```

---

## Error Handling

Agent code often fails. Roche captures exit codes and stderr so your agent can self-correct:

```python
from roche_sandbox import Roche, RocheError, SandboxNotFound

roche = Roche()

with roche.create(image="python:3.12-slim") as sandbox:
    # Successful execution
    result = sandbox.exec(["python3", "-c", "print('ok')"])
    assert result.exit_code == 0

    # Failed execution — stderr captured, no exception
    result = sandbox.exec(["python3", "-c", "1/0"])
    print(f"exit_code: {result.exit_code}")   # 1
    print(f"stderr: {result.stderr.strip()}")  # ZeroDivisionError: division by zero

    # Use exit code to decide what to feed back to the LLM
    if result.exit_code != 0:
        feedback = f"Code failed with error:\n{result.stderr}"
        # Feed `feedback` back to the LLM for self-correction
```

---

## Resource Limits

Control memory, CPU, and timeout per sandbox:

```python
from roche_sandbox import Roche

roche = Roche()

# Tight limits for untrusted code
sandbox = roche.create(
    image="python:3.12-slim",
    memory="256m",        # 256 MB memory limit
    cpus=0.5,             # half a CPU core
    timeout_secs=30,      # 30 second timeout
)

try:
    # This will be killed if it exceeds limits
    result = sandbox.exec(["python3", "-c", "print('constrained but working')"])
    print(result.stdout)
finally:
    sandbox.destroy()
```

---

## Agent Framework Examples

### OpenAI Agents SDK

Register a Roche sandbox as a `@function_tool`:

```python
import asyncio
from agents import Agent, Runner, function_tool
from roche_sandbox import AsyncRoche

@function_tool
async def execute_code(code: str) -> str:
    """Execute Python code in a secure sandbox. Returns stdout or error."""
    roche = AsyncRoche()
    sandbox = await roche.create(image="python:3.12-slim")
    try:
        result = await sandbox.exec(["python3", "-c", code])
        if result.exit_code != 0:
            return f"ERROR (exit {result.exit_code}):\n{result.stderr.strip()}"
        return result.stdout.strip()
    finally:
        await sandbox.destroy()

agent = Agent(
    name="Coder",
    instructions="You write and execute Python code to solve tasks.",
    tools=[execute_code],
)

async def main():
    result = await Runner.run(agent, "Calculate fibonacci(10) and print the result.")
    print(f"Agent response: {result.final_output}")

asyncio.run(main())
```

### LangChain / LangGraph

Use Roche as a LangChain tool with a ReAct agent:

```python
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent
from roche_sandbox import Roche

@tool
def sandbox_execute(code: str) -> str:
    """Execute Python code in a secure Roche sandbox. Returns stdout or error."""
    roche = Roche()
    sandbox = roche.create(image="python:3.12-slim")
    try:
        result = sandbox.exec(["python3", "-c", code])
        if result.exit_code != 0:
            return f"ERROR (exit {result.exit_code}):\n{result.stderr.strip()}"
        return result.stdout.strip()
    finally:
        sandbox.destroy()

llm = ChatOpenAI(model="gpt-4o-mini")
agent = create_react_agent(llm, [sandbox_execute])
result = agent.invoke(
    {"messages": [("user", "Calculate the sum of squares from 1 to 10.")]}
)
```

### Anthropic API (tool_use)

Multi-turn agentic loop with Claude calling a Roche sandbox tool:

```python
import anthropic
from roche_sandbox import Roche

TOOL_SCHEMA = {
    "name": "execute_code",
    "description": "Execute Python code in a secure sandbox. Returns stdout or error.",
    "input_schema": {
        "type": "object",
        "properties": {
            "code": {"type": "string", "description": "Python code to execute"}
        },
        "required": ["code"],
    },
}

client = anthropic.Anthropic()
roche = Roche()
sandbox = roche.create(image="python:3.12-slim")

messages = [{"role": "user", "content": "Write a palindrome checker and test it."}]

# Agentic loop — Claude calls tools until done
for turn in range(5):
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        tools=[TOOL_SCHEMA],
        messages=messages,
    )

    tool_results = []
    for block in response.content:
        if block.type == "text":
            print(f"Claude: {block.text}")
        elif block.type == "tool_use":
            print(f"[Turn {turn + 1}] Executing: {block.input['code'][:60]}...")
            result = sandbox.exec(["python3", "-c", block.input["code"]])
            output = (result.stdout.strip() if result.exit_code == 0
                      else f"ERROR:\n{result.stderr.strip()}")
            print(f"Output: {output}")
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": output,
            })

    messages.append({"role": "assistant", "content": response.content})
    if tool_results:
        messages.append({"role": "user", "content": tool_results})

    if response.stop_reason == "end_turn":
        break

sandbox.destroy()
```

### CrewAI

```python
from crewai import Agent, Task, Crew
from crewai.tools import tool
from roche_sandbox import Roche

roche = Roche()

@tool("sandbox_executor")
def execute_code(code: str) -> str:
    """Execute Python code in a secure Roche sandbox."""
    with roche.create(image="python:3.12-slim") as sandbox:
        result = sandbox.exec(["python3", "-c", code])
        return result.stdout if result.exit_code == 0 else result.stderr

coder = Agent(
    role="Python Developer",
    goal="Write and test Python code",
    tools=[execute_code],
)

task = Task(
    description="Calculate the first 10 prime numbers and print them.",
    expected_output="A list of the first 10 prime numbers",
    agent=coder,
)

crew = Crew(agents=[coder], tasks=[task])
result = crew.kickoff()
```

### AutoGen

Custom code executor backed by Roche:

```python
from roche_sandbox import Roche

roche = Roche()

class RocheExecutor:
    """AutoGen-compatible code executor using Roche."""

    def execute_code_blocks(self, code_blocks):
        results = []
        with roche.create(image="python:3.12-slim", writable=True) as sandbox:
            for block in code_blocks:
                output = sandbox.exec(["python3", "-c", block.code])
                results.append(output)
        return results

# Use with AutoGen's AssistantAgent / UserProxyAgent
executor = RocheExecutor()
```

### Camel-AI

Toolkit for Camel's role-playing sessions:

```python
from roche_sandbox import Roche

roche = Roche()

class RocheToolkit:
    """Camel-AI toolkit for sandbox code execution."""

    def get_tools(self):
        return [self.execute_code]

    def execute_code(self, code: str) -> str:
        """Execute Python code in a secure Roche sandbox."""
        with roche.create(image="python:3.12-slim") as sandbox:
            result = sandbox.exec(["python3", "-c", code])
            return result.stdout if result.exit_code == 0 else result.stderr
```

---

## Common Patterns

### Reusable Sandbox (Multi-Step Agent)

For agents that run multiple steps, keep the sandbox alive across calls:

```python
from roche_sandbox import Roche

roche = Roche()

with roche.create(image="python:3.12-slim", writable=True) as sandbox:
    # Step 1: define a function
    sandbox.exec(["python3", "-c", """\
with open('/tmp/utils.py', 'w') as f:
    f.write('def greet(name): return f"Hello, {name}!"\\n')
"""])

    # Step 2: use the function (state persists in the sandbox)
    result = sandbox.exec(["python3", "-c", """\
import sys; sys.path.insert(0, '/tmp')
from utils import greet
print(greet('Roche'))
"""])
    print(result.stdout)  # Hello, Roche!
```

### Parallel Sandboxes

Run multiple sandboxes concurrently for batch processing:

```python
import asyncio
from roche_sandbox import AsyncRoche

async def run_task(roche, task_id, code):
    async with await roche.create(image="python:3.12-slim") as sandbox:
        result = await sandbox.exec(["python3", "-c", code])
        return f"Task {task_id}: {result.stdout.strip()}"

async def main():
    roche = AsyncRoche()

    tasks = [
        run_task(roche, 1, "print(sum(range(100)))"),
        run_task(roche, 2, "print(2 ** 32)"),
        run_task(roche, 3, "import math; print(math.factorial(20))"),
    ]

    results = await asyncio.gather(*tasks)
    for r in results:
        print(r)

asyncio.run(main())
```

**Output:**
```
Task 1: 4950
Task 2: 4294967296
Task 3: 2432902008176640000
```

### Network-Enabled Sandbox

For agents that need to fetch data from the internet:

```python
from roche_sandbox import Roche

roche = Roche()

# Explicitly opt in to network access
with roche.create(image="python:3.12-slim", network=True) as sandbox:
    result = sandbox.exec([
        "python3", "-c",
        "import urllib.request; print(urllib.request.urlopen('https://httpbin.org/ip').read().decode())"
    ])
    print(result.stdout)
```

### Environment Variables

Pass secrets or config into sandboxes:

```python
from roche_sandbox import Roche

roche = Roche()

with roche.create(
    image="python:3.12-slim",
    env={"DB_HOST": "localhost", "DB_PORT": "5432"},
) as sandbox:
    result = sandbox.exec([
        "python3", "-c",
        "import os; print(f\"DB: {os.environ['DB_HOST']}:{os.environ['DB_PORT']}\")"
    ])
    print(result.stdout)  # DB: localhost:5432
```

---

## Running the Examples

All examples are in the [GitHub repo](https://github.com/substratum-labs/roche/tree/main/examples):

```bash
# Prerequisites
cargo install --path crates/roche-cli   # install roche CLI
pip install roche-sandbox               # install Python SDK

# Basic examples
python examples/python/basic.py
python examples/python/async_context_manager.py

# Agent framework examples (simulated mode, no API key needed)
pip install -r examples/python/openai-agents/requirements.txt
python examples/python/openai-agents/basic_tool.py

# With real LLM calls
OPENAI_API_KEY=sk-... python examples/python/openai-agents/basic_tool.py
ANTHROPIC_API_KEY=sk-ant-... python examples/python/anthropic/code_assistant.py

# TypeScript
cd sdk/typescript && npm ci && npm run build && cd ../..
npx tsx examples/typescript/basic.ts
```
