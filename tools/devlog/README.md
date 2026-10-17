# DevLog CLI — Cross-Language Learning Journal Tool

A pair of minimal, dependency-free command-line tools written in **Python (3.10+)** and **JavaScript (Node.js 20+ ESM)** that append dated, tagged entries to a shared `LOG.md` file.

Both implementations use **only standard library modules** and produce identical, interoperable Markdown output.

---

## Features

- **Zero dependencies**: No `pip install` or `npm install` needed.
- **Interoperable**: The Python and Node.js CLI tools read and write the exact same `LOG.md` format.
- **Tagging system**: Categorize entries using `-t` or `--tag` (e.g., `#python`, `#dsa`, `#webdev`).
- **Standardized formatting**: Automatically timestamps entries with ISO 8601 dates (`YYYY-MM-DD`).
- **Built-in viewer**: Quickly view the latest $N$ entries directly in your terminal.

---

## File Structure

```text
tools/devlog/
├── devlog.py        # Python 3.10+ implementation (argparse)
├── devlog.mjs       # Node.js 20+ ESM implementation (node:util.parseArgs)
├── LOG.md           # Shared markdown log file
└── README.md        # Documentation and usage guide
```

---

## Usage

### 1. Python Edition (`devlog.py`)

Requirements: **Python 3.10+** (tested on Python 3.14)

```bash
# Append a new log entry with tags
python3 tools/devlog/devlog.py add "Solved LeetCode #7 Reverse Integer in Python" -t python -t dsa

# View recent entries (default: 5)
python3 tools/devlog/devlog.py list

# View the last 2 entries
python3 tools/devlog/devlog.py list -n 2

# Display help
python3 tools/devlog/devlog.py --help
```

### 2. JavaScript ESM Edition (`devlog.mjs`)

Requirements: **Node.js 20+** (tested on Node.js v24 LTS)

```bash
# Append a new log entry with tags
node tools/devlog/devlog.mjs add "Explored async/await and native ESM in Node.js" -t javascript -t nodejs

# View recent entries (default: 5)
node tools/devlog/devlog.mjs list

# View the last 2 entries
node tools/devlog/devlog.mjs list -n 2

# Display help
node tools/devlog/devlog.mjs --help
```

---

## Example Output

When you run `python3 tools/devlog/devlog.py list` or `node tools/devlog/devlog.mjs list`:

```text
--- DevLog Entries (2 shown) ---

## 2026-10-17 | #python #cli #learning
Explored Python 3.14 standard library and built the DevLog CLI with argparse

----------------------------------------

## 2026-10-17 | #javascript #nodejs #cli
Implemented DevLog CLI in modern Node.js ESM using native util.parseArgs

----------------------------------------
```

---

## How It Compares: Python vs. Node.js Standard Library

| Feature | Python (`devlog.py`) | JavaScript ESM (`devlog.mjs`) |
| :--- | :--- | :--- |
| **CLI Parser** | `argparse.ArgumentParser` | `node:util.parseArgs` (native since Node 18.3) |
| **File I/O** | `pathlib.Path.open()` | `node:fs/promises` (`appendFile`, `readFile`) |
| **Date Handling** | `datetime.date.today().isoformat()` | `new Date().toISOString().slice(0, 10)` |
| **Module Format** | Standard Python script | ECMAScript Module (`.mjs` with `import`) |
| **Dependencies** | None (Standard Library) | None (Standard Library) |
