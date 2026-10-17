#!/usr/bin/env python3
"""
DevLog CLI (Python edition)
A lightweight command-line tool to record and view daily learning logs.
Compatible with Python 3.10+ using only standard library modules.
"""

from __future__ import annotations

import argparse
from datetime import date
from pathlib import Path
import sys

# Default file where logs are stored (same directory as this script)
DEFAULT_LOG_PATH = Path(__file__).resolve().parent / "LOG.md"


def format_entry(entry_date: str, message: str, tags: list[str]) -> str:
    """Formats a log entry into Markdown with a date header, tags, and content."""
    # Normalize tags: strip '#' if user provided it, ensure lowercase
    cleaned_tags = [f"#{tag.lstrip('#').lower()}" for tag in tags if tag.strip()]
    tag_str = " ".join(cleaned_tags) if cleaned_tags else "#general"

    return f"## {entry_date} | {tag_str}\n{message.strip()}\n\n---\n\n"


def cmd_add(args: argparse.Namespace) -> int:
    """Appends a new dated entry with tags to LOG.md."""
    message = args.message.strip()
    if not message:
        print("Error: Log message cannot be empty.", file=sys.stderr)
        return 1

    log_path = Path(args.file)
    today_str = date.today().isoformat()
    entry_text = format_entry(today_str, message, args.tags or [])

    try:
        # Create parent directories if they don't exist yet
        log_path.parent.mkdir(parents=True, exist_ok=True)

        # Open in append mode ('a') with UTF-8 encoding
        with log_path.open(mode="a", encoding="utf-8") as file:
            file.write(entry_text)

        print(f"Log entry saved to {log_path.name} for {today_str}")
        return 0
    except OSError as err:
        print(f"File system error writing to '{log_path}': {err}", file=sys.stderr)
        return 1


def cmd_list(args: argparse.Namespace) -> int:
    """Displays recorded entries from LOG.md."""
    log_path = Path(args.file)

    if not log_path.exists():
        print(f"No log file found at '{log_path}'. Use 'add' to create your first entry.")
        return 0

    try:
        content = log_path.read_text(encoding="utf-8").strip()
    except OSError as err:
        print(f"File system error reading '{log_path}': {err}", file=sys.stderr)
        return 1

    if not content:
        print(f"Log file '{log_path.name}' is currently empty.")
        return 0

    # Entries are separated by the Markdown divider '---'
    raw_entries = [entry.strip() for entry in content.split("---") if entry.strip()]

    # Apply limit if requested
    limit = args.limit if args.limit and args.limit > 0 else len(raw_entries)
    selected_entries = raw_entries[-limit:]  # Most recent entries appear at the bottom

    print(f"\n--- DevLog Entries ({len(selected_entries)} shown) ---\n")
    for entry in selected_entries:
        print(entry)
        print("\n" + ("-" * 40) + "\n")

    return 0


def build_parser() -> argparse.ArgumentParser:
    """Constructs the command-line interface specification."""
    parser = argparse.ArgumentParser(
        prog="devlog",
        description="DevLog: Track daily learning entries in Markdown format.",
        epilog="Both Python and Node.js versions share the same LOG.md format.",
    )

    # Optional global flag to point to a custom log file
    parser.add_argument(
        "-f",
        "--file",
        default=str(DEFAULT_LOG_PATH),
        help=f"Path to the log file (default: {DEFAULT_LOG_PATH.name})",
    )

    subparsers = parser.add_subparsers(dest="command", required=True, help="Action to perform")

    # 'add' subcommand
    add_parser = subparsers.add_parser("add", help="Append a new learning entry")
    add_parser.add_argument(
        "message",
        help="Description of what you learned or built today",
    )
    add_parser.add_argument(
        "-t",
        "--tag",
        dest="tags",
        action="append",
        default=[],
        help="Tag category (can be specified multiple times, e.g. -t python -t dsa)",
    )
    add_parser.set_defaults(func=cmd_add)

    # 'list' subcommand
    list_parser = subparsers.add_parser("list", help="View recent learning entries")
    list_parser.add_argument(
        "-n",
        "--limit",
        type=int,
        default=5,
        help="Number of recent entries to show (default: 5)",
    )
    list_parser.set_defaults(func=cmd_list)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
